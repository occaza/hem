<!-- src/routes/+page.svelte (REFACTORED - Step 4) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product, Category } from '$lib/types/types';
	import QRCode from 'qrcode';

	import { cartStore, cartCount } from '$lib/stores/cart.store';
	import { toast } from '$lib/stores/toast.store';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';
	import ProductCard from '$lib/components/features/products/ProductCard.svelte';
	import MethodSelectorModal from '$lib/components/features/payment/MethodSelectorModal.svelte';
	import PaymentModal from '$lib/components/features/payment/PaymentModal.svelte';
	import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';

	let products = $state<Product[]>([]);
	let categories = $state<Category[]>([]);
	let selectedCategory = $state<string | null>(null);
	let loading = $state(true);
	let showPayment = $state(false);
	let showMethodSelector = $state(false);
	let selectedProduct = $state<Product | null>(null);
	let selectedMethod = $state('qris');
	let paymentData = $state<any>(null);
	let qrImageUrl = $state('');
	let pollingInterval = $state<any>(null);
	let isSimulating = $state(false);

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
		try {
			const url = selectedCategory ? `/api/products?category=${selectedCategory}` : '/api/products';
			const res = await fetch(url);
			const data = await res.json();
			products = data;
		} catch (error) {
			console.error('Failed to fetch products:', error);
		}
	}

	async function selectCategory(slug: string | null) {
		selectedCategory = slug;
		await loadProducts();
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
	<title>Produk - adverFI</title>
</svelte:head>

<!-- Update Navbar untuk tampilkan cart count -->
<div class="min-h-screen bg-base-200">
	<!-- Header/Navbar -->
	<Navbar />

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-12">
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-4xl font-bold">Produk Kami</h1>
			<p class="text-lg text-base-content/70">
				Pilih produk yang Anda inginkan dan nikmati kemudahan berbelanja
			</p>
		</div>

		<!-- Category Filter -->
		<!-- Category Filter -->
		{#if categories.length > 0}
			<div class="mb-6 flex flex-wrap items-center justify-center gap-2">
				<button
					class="btn btn-sm {selectedCategory === null ? 'btn-primary' : 'btn-outline'}"
					onclick={() => selectCategory(null)}
				>
					Semua Produk
				</button>
				{#each categories as category}
					<button
						class="btn btn-sm {selectedCategory === category.slug ? 'btn-primary' : 'btn-outline'}"
						onclick={() => selectCategory(category.slug)}
					>
						{category.name}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Products Grid -->
		{#if loading}
			<div class="flex justify-center py-12">
				<span class="loading loading-lg loading-spinner text-primary"></span>
			</div>
		{:else if products.length > 0}
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{#each products as product}
					<ProductCard {product} showAddToCart={true} />
				{/each}
			</div>
		{:else}
			<div class="alert alert-info">
				<DynamicIcon name="info" class="h-6 w-6" />
				<span>Belum ada produk tersedia saat ini. Silakan cek kembali nanti.</span>
			</div>
		{/if}
	</div>
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
