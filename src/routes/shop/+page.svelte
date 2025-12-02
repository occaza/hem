<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product, Category } from '$lib/types/types';
	import QRCode from 'qrcode';

	import { cartStore } from '$lib/stores/cart.store';
	import { toast } from '$lib/stores/toast.store';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';
	import MethodSelectorModal from '$lib/components/features/payment/MethodSelectorModal.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PaymentModal from '$lib/components/features/payment/PaymentModal.svelte';
	import ProductCard from '$lib/components/features/products/ProductCard.svelte';
	import SidebarFilter from '$lib/components/features/shop/SidebarFilter.svelte';
	import FeaturesSection from '$lib/components/features/shop/FeaturesSection.svelte';
	import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';
	import { ChevronDown, X } from '@lucide/svelte';

	let products = $state<Product[]>([]);
	let categories = $state<Category[]>([]);
	let selectedCategory = $state<string | null>(null);
	let minPrice = $state<number | null>(null);
	let maxPrice = $state<number | null>(null);
	let availability = $state<string[]>([]);
	let onDiscount = $state(false);
	let loading = $state(true);
	let showPayment = $state(false);
	let showMethodSelector = $state(false);
	let selectedProduct = $state<Product | null>(null);
	let selectedMethod = $state('qris');
	let paymentData = $state<any>(null);
	let qrImageUrl = $state('');
	let pollingInterval = $state<any>(null);
	let isSimulating = $state(false);
	let sortBy = $state('default');

	// Pagination State
	let currentPage = $state(1);
	const itemsPerPage = 20;

	let paginatedProducts = $derived(
		products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	let totalPages = $derived(Math.ceil(products.length / itemsPerPage));

	function changePage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	onMount(() => {
		(async () => {
			try {
				// Load categories
				const catRes = await fetch('/api/categories');
				const catData = await catRes.json();
				categories = catData;

				// Load products
				await loadProducts();

				// Load cart ✨
				await cartStore.load();
			} catch (error) {
				console.error('Failed to fetch data:', error);
			} finally {
				loading = false;
			}
		})();

		return () => {
			if (pollingInterval) clearInterval(pollingInterval);
		};
	});

	async function loadProducts() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (selectedCategory) params.append('category', selectedCategory);
			if (minPrice) params.append('min_price', minPrice.toString());
			if (maxPrice) params.append('max_price', maxPrice.toString());
			if (availability.length > 0) params.append('availability', availability.join(','));

			const url = `/api/products?${params.toString()}`;
			const res = await fetch(url);
			let data = await res.json();

			// Client-side discount filter
			if (onDiscount) {
				data = data.filter((p: Product) => {
					if (!p.discount_percentage || p.discount_percentage === 0) return false;
					if (p.discount_end_date) {
						const now = new Date();
						const end = new Date(p.discount_end_date);
						return now <= end;
					}
					return true;
				});
			}

			// Client-side sorting for now
			if (sortBy === 'price_low') {
				data.sort((a: Product, b: Product) => a.price - b.price);
			} else if (sortBy === 'price_high') {
				data.sort((a: Product, b: Product) => b.price - a.price);
			}

			products = data;
			currentPage = 1; // Reset to first page on filter change
		} catch (error) {
			console.error('Failed to fetch products:', error);
		} finally {
			loading = false;
		}
	}

	async function selectCategory(slug: string | null) {
		selectedCategory = slug;
		await loadProducts();
	}

	async function applyFilter(min: number | null, max: number | null) {
		minPrice = min;
		maxPrice = max;
		await loadProducts();
	}

	async function toggleAvailability(status: string) {
		if (availability.includes(status)) {
			availability = availability.filter((s) => s !== status);
		} else {
			availability = [...availability, status];
		}
		await loadProducts();
	}

	async function toggleDiscount() {
		onDiscount = !onDiscount;
		await loadProducts();
	}

	function clearAllFilters() {
		selectedCategory = null;
		minPrice = null;
		maxPrice = null;
		availability = [];
		onDiscount = false;
		loadProducts();
	}

	function showMethodSelection(product: Product) {
		selectedProduct = product;
		showMethodSelector = true;
	}

	async function processCheckout(method: string) {
		if (!selectedProduct) return;

		selectedMethod = method;
		const today = new Date();
		const ymd = today.toISOString().slice(2, 10).replace(/-/g, ''); // 231109
		const run = String(Math.floor(Math.random() * 1e4)).padStart(4, '0');
		const orderId = `ADF${ymd}-${run}`;
		showMethodSelector = false;

		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					product_id: selectedProduct.id,
					order_id: orderId,
					payment_method: method
				})
			});

			const data = await res.json();

			if (!res.ok || data.error) {
				toast.error(data.error || 'Gagal membuat transaksi.');
				return;
			}

			if (!data.payment_number) {
				toast.error('Response tidak valid dari server.');
				return;
			}

			paymentData = data;

			if (method === 'qris') {
				qrImageUrl = await QRCode.toDataURL(data.payment_number, {
					width: 300,
					margin: 2
				});
			}

			showPayment = true;
			startPolling(orderId);
		} catch (error) {
			console.error('Checkout error:', error);
			toast.error('Terjadi kesalahan. Silakan coba lagi.');
		}
	}

	function handleSelectQRIS() {
		processCheckout('qris');
	}

	function handleSelectOther(method: string) {
		processCheckout(method);
	}

	function startPolling(orderId: string) {
		pollingInterval = setInterval(async () => {
			try {
				const res = await fetch('/api/check-payment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ order_id: orderId })
				});

				const data = await res.json();

				if (data.status === 'completed') {
					clearInterval(pollingInterval);
					window.location.href = `/success?order_id=${orderId}`;
				}
			} catch (error) {
				console.error('Polling error:', error);
			}
		}, 3000);

		setTimeout(() => {
			if (pollingInterval) clearInterval(pollingInterval);
		}, 600000);
	}

	function closePayment() {
		if (pollingInterval) clearInterval(pollingInterval);
		showPayment = false;
		paymentData = null;
		qrImageUrl = '';
	}

	function closeMethodSelector() {
		showMethodSelector = false;
		selectedProduct = null;
	}

	async function simulatePayment() {
		if (!paymentData || isSimulating) return;

		isSimulating = true;

		try {
			const res = await fetch('/api/simulate-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					order_id: paymentData.order_id,
					amount: paymentData.amount
				})
			});

			const data = await res.json();

			if (res.ok) {
				toast.success('Simulasi berhasil! Tunggu sebentar...');
			} else {
				toast.error(data.error || 'Simulasi gagal');
				isSimulating = false;
			}
		} catch (error) {
			console.error('Simulate error:', error);
			toast.error('Terjadi kesalahan saat simulasi');
			isSimulating = false;
		}
	}
</script>

<svelte:head>
	<title>Shop - adverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-100 font-sans">
	<Navbar />

	<!-- Header -->
	<PageHeader title="Shop" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shop' }]} />

	<div class="container mx-auto px-4 py-12">
		<div class="grid grid-cols-1 gap-20 lg:grid-cols-4">
			<!-- Sidebar -->
			<div class="rounded-lg bg-base-200 p-4 px-5 lg:col-span-1">
				<SidebarFilter
					{categories}
					{selectedCategory}
					{minPrice}
					{maxPrice}
					{availability}
					{onDiscount}
					onSelectCategory={selectCategory}
					onApplyFilter={applyFilter}
					onToggleAvailability={toggleAvailability}
					onToggleDiscount={toggleDiscount}
				/>
			</div>

			<!-- Main Content -->
			<div class="lg:col-span-3">
				<!-- Top Bar -->
				<div class="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
					<div class="text-base-content/70">
						Showing 1-{products.length} of {products.length} results
					</div>

					<div class="flex items-center gap-1">
						<span class="w-full text-base-content/70">Sort by : </span>
						<select
							class="select-bordered select w-fit max-w-xs rounded-lg select-sm"
							bind:value={sortBy}
							onchange={loadProducts}
						>
							<option value="default">Default Sorting</option>
							<option value="price_low">Price: Low to High</option>
							<option value="price_high">Price: High to Low</option>
						</select>
					</div>
				</div>

				<!-- Active Filters -->
				{#if selectedCategory || minPrice || maxPrice || availability.length > 0 || onDiscount}
					<div class="mb-8 flex flex-wrap items-center gap-2">
						<span class="mr-2 text-sm font-semibold">Active Filter:</span>

						{#if selectedCategory}
							<div class="badge gap-2 p-3 text-white badge-primary">
								Category: {categories.find((c) => c.slug === selectedCategory)?.name ||
									selectedCategory}
								<button onclick={() => selectCategory(null)}><X size={14} /></button>
							</div>
						{/if}

						{#if minPrice || maxPrice}
							<div class="badge gap-2 p-3 text-white badge-primary">
								Price: {minPrice ? minPrice : 0} - {maxPrice ? maxPrice : 'Max'}
								<button onclick={() => applyFilter(null, null)}><X size={14} /></button>
							</div>
						{/if}

						{#if availability.length > 0}
							<div class="badge gap-2 p-3 text-white badge-primary">
								Availability: {availability
									.map((s) => (s === 'in_stock' ? 'In Stock' : 'Out of Stock'))
									.join(', ')}
								<button
									onclick={() => {
										availability = [];
										loadProducts();
									}}><X size={14} /></button
								>
							</div>
						{/if}

						{#if onDiscount}
							<div class="badge gap-2 p-3 text-white badge-primary">
								Sedang Diskon
								<button onclick={toggleDiscount}><X size={14} /></button>
							</div>
						{/if}

						<button
							class="btn text-primary underline btn-ghost btn-xs hover:bg-transparent"
							onclick={clearAllFilters}
						>
							Clear All
						</button>
					</div>
				{/if}

				<!-- Products Grid -->
				{#if loading}
					<div class="flex justify-center py-20">
						<span class="loading loading-lg loading-spinner text-primary"></span>
					</div>
				{:else if paginatedProducts.length > 0}
					<div
						class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4"
					>
						{#each paginatedProducts as product}
							<ProductCard {product} showAddToCart={true} />
						{/each}
					</div>

					<!-- Smart Pagination -->
					{#if totalPages > 1}
						<div class="mt-12 flex justify-center gap-2">
							<button
								class="btn btn-circle btn-sm {currentPage === 1 ? 'btn-disabled' : 'btn-ghost'}"
								onclick={() => changePage(currentPage - 1)}
								disabled={currentPage === 1}
							>
								&lt;
							</button>

							{#each Array(totalPages) as _, i}
								{@const page = i + 1}
								{#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
									<button
										class="btn btn-circle btn-sm {currentPage === page
											? 'btn-primary'
											: 'btn-ghost'}"
										onclick={() => changePage(page)}
									>
										{page}
									</button>
								{:else if page === currentPage - 2 || page === currentPage + 2}
									<span class="flex items-center px-1">...</span>
								{/if}
							{/each}

							<button
								class="btn btn-circle btn-sm {currentPage === totalPages
									? 'btn-disabled'
									: 'btn-ghost'}"
								onclick={() => changePage(currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								&gt;
							</button>
						</div>
					{/if}
				{:else}
					<div class="rounded-2xl bg-base-200/30 py-20 text-center">
						<DynamicIcon name="package-open" class="mx-auto mb-4 h-16 w-16 text-base-content/30" />
						<h3 class="mb-2 text-xl font-bold">No products found</h3>
						<p class="mb-6 text-base-content/60">Try adjusting your filters or search criteria.</p>
						<button class="btn btn-primary" onclick={clearAllFilters}>Clear Filters</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<FeaturesSection />

	<Footer />
</div>

{#if showMethodSelector && selectedProduct}
	<MethodSelectorModal
		product={selectedProduct}
		paymentMethods={[...PAYMENT_METHODS]}
		onClose={closeMethodSelector}
		onSelectQRIS={handleSelectQRIS}
		onSelectOther={handleSelectOther}
	/>
{/if}

{#if showPayment && paymentData && selectedProduct}
	<PaymentModal
		product={selectedProduct}
		{paymentData}
		{qrImageUrl}
		{isSimulating}
		onClose={closePayment}
		onSimulate={simulatePayment}
	/>
{/if}
