<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Product } from '$lib/types/types';
	import { authUser } from '$lib/stores/auth.store';
	import QRCode from 'qrcode';

	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';
	import MethodSelectorModal from '$lib/components/features/payment/MethodSelectorModal.svelte';
	import PaymentModal from '$lib/components/features/payment/PaymentModal.svelte';

	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import FeaturesSection from '$lib/components/features/shop/FeaturesSection.svelte';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { cartStore } from '$lib/stores/cart.store';
	import { calculateDiscountedPrice, isDiscountActive, isInStock } from '$lib/utils/product.utils';
	import { generateOrderId, encodeOrderId } from '$lib/utils/order.utils';
	import { toast } from '$lib/stores/toast.store';
	import { confirmLogin } from '$lib/utils/swal.utils';
	import { appliedCoupon } from '$lib/stores/coupon.store';

	let product = $state<Product | null>(null);
	let loading = $state(true);
	let selectedImage = $state(0);
	let quantity = $state(1);
	let addingToCart = $state(false);
	let activeTab = $state<'detail' | 'faq'>('detail');
	let note = $state('');
	let showPayment = $state(false);
	let showMethodSelector = $state(false);
	let selectedMethod = $state('qris');
	let paymentData = $state<any>(null);
	let qrImageUrl = $state('');
	let isSimulating = $state(false);
	let isDevelopment = $state(false);

	const user = $derived($authUser);
	const productId = $derived($page.params.slug);
	const hasDiscount = $derived(product ? isDiscountActive(product) : false);
	const finalPrice = $derived(product ? calculateDiscountedPrice(product) : 0);
	const inStock = $derived(product ? isInStock(product, quantity) : false);
	const subtotal = $derived(finalPrice * quantity);

	onMount(async () => {
		loadProduct();

		// Check if development mode
		try {
			const res = await fetch('/api/config');
			if (res.ok) {
				const data = await res.json();
				isDevelopment = data.isDevelopment;
			}
		} catch (error) {
			console.error('Failed to check config:', error);
		}
	});

	async function loadProduct() {
		try {
			const res = await fetch(`/api/products/${productId}`);
			if (res.ok) {
				product = await res.json();
			} else {
				goto('/shop');
			}
		} catch (error) {
			console.error('Failed to load product:', error);
			goto('/shop');
		} finally {
			loading = false;
		}
	}

	async function handleAddToCart() {
		if (!product) return;

		if (!user) {
			const confirmed = await confirmLogin('menambahkan produk ke keranjang');
			if (confirmed) {
				goto('/login');
			}
			return;
		}

		addingToCart = true;
		const success = await cartStore.addItem(product, quantity);
		if (success) {
			toast.success('Produk berhasil ditambahkan ke keranjang!');
		} else {
			toast.error('Gagal menambahkan ke keranjang');
		}
		addingToCart = false;
	}

	async function handleBuyNow() {
		if (!product) return;

		if (!user) {
			const confirmed = await confirmLogin('membeli produk ini');
			if (confirmed) {
				goto('/login');
			}
			return;
		}

		showMethodSelector = true;
	}

	async function processCheckout(method: string) {
		if (!product || !user) return;

		selectedMethod = method;
		showMethodSelector = false;

		try {
			const orderId = generateOrderId();
			const encodedOrderId = encodeOrderId(orderId);

			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					product_id: product.id,
					order_id: encodedOrderId,
					payment_method: method,
					user_id: user.id,
					quantity: quantity,
					note: note,
					coupon_code: $appliedCoupon?.coupon.code,
					discount_amount: $appliedCoupon?.discount_amount
				})
			});

			const data = await res.json();

			if (!res.ok || data.error) {
				toast.error(data.error || 'Gagal membuat transaksi.');
				return;
			}

			goto(`/payment/${encodedOrderId}`);
			appliedCoupon.clear();
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

	function closePayment() {
		showPayment = false;
		paymentData = null;
		qrImageUrl = '';
	}

	function closeMethodSelector() {
		showMethodSelector = false;
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

			if (res.ok) {
				toast.success('Simulasi berhasil! Tunggu sebentar...');
			} else {
				const data = await res.json();
				toast.error(data.error || 'Simulasi gagal');
				isSimulating = false;
			}
		} catch (error) {
			console.error('Simulate error:', error);
			toast.error('Terjadi kesalahan saat simulasi');
			isSimulating = false;
		}
	}

	function increaseQuantity() {
		if (product && quantity < product.stock) {
			quantity++;
		}
	}

	function decreaseQuantity() {
		if (quantity > 1) {
			quantity--;
		}
	}

	function handleQuantityInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value);

		if (!isNaN(value) && value >= 1 && product && value <= product.stock) {
			quantity = value;
		}
	}
	function handleShare(platform: 'facebook' | 'twitter') {
		const url = window.location.href;
		const text = `Check out ${product?.name} on adverFI!`;

		if (platform === 'facebook') {
			window.open(
				`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
				'facebook-share-dialog',
				'width=800,height=600'
			);
		} else if (platform === 'twitter') {
			window.open(
				`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
				'twitter-share-dialog',
				'width=800,height=600'
			);
		}
	}
</script>

<svelte:head>
	<title>{product ? `${product.name} - adverFI` : 'Produk - adverFI'}</title>
	{#if product}
		<meta property="og:title" content={product.name} />
		<meta property="og:description" content={product.description} />
		<meta
			property="og:image"
			content={product.images?.[0] || 'https://placehold.co/600x600?text=No+Image'}
		/>
		<meta property="og:url" content={$page.url.href} />
		<meta property="og:type" content="product" />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={product.name} />
		<meta name="twitter:description" content={product.description} />
		<meta
			name="twitter:image"
			content={product.images?.[0] || 'https://placehold.co/600x600?text=No+Image'}
		/>
	{/if}
</svelte:head>

<div class="min-h-screen bg-base-100 font-sans">
	<Navbar />

	{#if loading}
		<div class="flex min-h-screen items-center justify-center">
			<span class="loading loading-lg loading-spinner text-primary"></span>
		</div>
	{:else if product}
		<!-- Header -->
		<div class="bg-base-200/30 py-12 text-center">
			<h1 class="mb-2 text-4xl font-bold">Shop</h1>
			<div class="breadcrumbs flex justify-center text-sm text-base-content/60">
				<ul>
					<li><a href="/">Home</a></li>
					<li><a href="/shop">Shop</a></li>
					<li>Product Details</li>
				</ul>
			</div>
		</div>

		<div class="container mx-auto px-4 py-12">
			<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<!-- Left Column: Images -->
				<div class="mx-auto max-w-md space-y-4">
					<div class="overflow-hidden rounded-3xl bg-base-200/30 p-6">
						<img
							src={product.images?.[selectedImage] || 'https://placehold.co/600x600?text=No+Image'}
							alt={product.name}
							class="aspect-square w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
						/>
					</div>

					{#if product.images && product.images.length > 1}
						<div class="grid grid-cols-4 gap-4">
							{#each product.images as image, index}
								<button
									onclick={() => (selectedImage = index)}
									class="overflow-hidden rounded-xl border-2 transition-all hover:border-primary"
									class:border-primary={selectedImage === index}
									class:border-transparent={selectedImage !== index}
									aria-label={`Select image ${index + 1}`}
								>
									<div class="bg-base-200/30 p-2">
										<img
											src={image}
											alt={`${product.name} ${index + 1}`}
											class="aspect-square w-full object-contain mix-blend-multiply"
										/>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Right Column: Details -->
				<div class="flex flex-col gap-6">
					<div>
						{#if product.categories && product.categories.length > 0}
							<span class="text-sm font-medium text-base-content/60">
								{product.categories[0].name}
							</span>
						{/if}
						<div class="mt-2 flex items-start justify-between gap-4">
							<h1 class="text-3xl font-bold">{product.name}</h1>
							{#if inStock}
								<div class="badge gap-1 badge-outline p-3 font-medium badge-success">In Stock</div>
							{:else}
								<div class="badge gap-1 badge-outline p-3 font-medium badge-error">
									Out of Stock
								</div>
							{/if}
						</div>
					</div>

					<!-- Price -->
					<div class="flex items-center gap-4">
						{#if hasDiscount && product.discount_percentage}
							<span class="text-3xl font-bold text-primary">{formatCurrency(finalPrice)}</span>
							<span class="text-xl text-base-content/40 line-through">
								{formatCurrency(product.price)}
							</span>
						{:else}
							<span class="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
						{/if}
					</div>

					<!-- Description Excerpt -->
					<p class="leading-relaxed text-base-content/70">
						{product.description}
					</p>

					<!-- Actions -->
					<div class="mt-4 space-y-6">
						<!-- Note -->
						<div class="form-control">
							<label class="label" for="note">
								<span class="label-text font-bold">Catatan untuk Penjual</span>
							</label>
							<textarea
								id="note"
								class="textarea-bordered textarea h-24 w-full resize-none rounded-2xl focus:border-primary focus:outline-none"
								placeholder="Contoh: Tolong kirim ke email contoh@gmail.com"
								bind:value={note}
							></textarea>
						</div>

						<div class="flex flex-wrap items-center gap-4">
							<!-- Quantity -->
							<div class="flex items-center rounded-full border border-base-300 bg-base-100">
								<button
									class="btn btn-circle btn-ghost btn-sm"
									onclick={decreaseQuantity}
									disabled={quantity <= 1}
									aria-label="Decrease quantity"
								>
									−
								</button>
								<input
									type="number"
									class="w-12 bg-transparent text-center font-bold focus:outline-none"
									value={quantity}
									min="1"
									max={product.stock}
									oninput={handleQuantityInput}
								/>
								<button
									class="btn btn-circle btn-ghost btn-sm"
									onclick={increaseQuantity}
									disabled={quantity >= product.stock}
									aria-label="Increase quantity"
								>
									+
								</button>
							</div>

							{#if inStock}
								<button
									class="btn min-w-[140px] rounded-full px-8 text-white shadow-lg transition-all btn-primary hover:-translate-y-0.5 hover:shadow-xl"
									onclick={handleAddToCart}
									disabled={addingToCart}
								>
									{#if addingToCart}
										<span class="loading loading-sm loading-spinner"></span>
									{:else}
										Add To Cart
									{/if}
								</button>

								<button
									class="btn min-w-[140px] rounded-full px-8 text-white shadow-lg transition-all btn-secondary hover:-translate-y-0.5 hover:shadow-xl"
									onclick={handleBuyNow}
								>
									Buy Now
								</button>
							{:else}
								<button class="btn btn-disabled rounded-full px-8" disabled> Out of Stock </button>
							{/if}

							<button
								class="btn btn-circle border border-base-300 btn-ghost hover:border-primary hover:text-primary"
								aria-label="Add to wishlist"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
							</button>
						</div>
					</div>

					<div class="divider"></div>

					<!-- Meta Info -->
					<div class="space-y-2 text-sm">
						<div class="flex gap-2">
							<span class="min-w-[60px] font-bold">Tags :</span>
							<span class="text-base-content/70">
								{product.categories?.map((c) => c.name).join(', ') || 'Uncategorized'}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="min-w-[60px] font-bold">Share :</span>
							<div class="flex gap-2">
								<button
									class="btn btn-circle bg-primary/10 text-primary btn-ghost btn-xs hover:bg-primary hover:text-white"
									aria-label="Share on Facebook"
									onclick={() => handleShare('facebook')}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
										></path></svg
									>
								</button>
								<button
									class="btn btn-circle bg-primary/10 text-primary btn-ghost btn-xs hover:bg-primary hover:text-white"
									aria-label="Share on Twitter"
									onclick={() => handleShare('twitter')}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path
											d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
										></path></svg
									>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Bottom Tabs -->
			<div class="mt-20">
				<div class="mb-8 flex justify-center gap-8 border-b border-base-200">
					<button
						class="relative pb-4 text-xl font-bold transition-colors"
						class:text-primary={activeTab === 'detail'}
						class:text-base-content={activeTab !== 'detail'}
						onclick={() => (activeTab = 'detail')}
					>
						Description
						{#if activeTab === 'detail'}
							<div class="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-primary"></div>
						{/if}
					</button>
					<button
						class="relative pb-4 text-xl font-bold transition-colors"
						class:text-primary={activeTab === 'faq'}
						class:text-base-content={activeTab !== 'faq'}
						onclick={() => (activeTab = 'faq')}
					>
						FAQ
						{#if activeTab === 'faq'}
							<div class="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-primary"></div>
						{/if}
					</button>
					<button class="cursor-not-allowed pb-4 text-xl font-bold text-base-content/40">
						Reviews (Coming Soon)
					</button>
				</div>

				<div class="mx-auto px-32">
					{#if activeTab === 'detail'}
						<div class="prose max-w-none leading-relaxed text-base-content/80">
							<p class="whitespace-pre-line">
								{product.detail_description || product.description}
							</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#if product.faq && Array.isArray(product.faq) && product.faq.length > 0}
								{#each product.faq as item}
									<div
										class="collapse-plus collapse rounded-2xl border border-base-200 bg-base-100"
									>
										<input type="radio" name="faq-accordion" />
										<div class="collapse-title text-lg font-medium">
											{item.question}
										</div>
										<div class="collapse-content">
											<p class="text-base-content/70">{item.answer}</p>
										</div>
									</div>
								{/each}
							{:else}
								<div class="py-12 text-center text-base-content/50">
									No additional information available.
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<FeaturesSection />
	{/if}

	<Footer />
</div>

{#if showMethodSelector && product}
	<MethodSelectorModal
		{product}
		paymentMethods={[...PAYMENT_METHODS]}
		totalAmount={subtotal}
		onClose={closeMethodSelector}
		onSelectQRIS={handleSelectQRIS}
		onSelectOther={handleSelectOther}
	/>
{/if}

{#if showPayment && paymentData && product}
	<PaymentModal
		{product}
		{paymentData}
		{qrImageUrl}
		{isSimulating}
		{isDevelopment}
		onClose={closePayment}
		onSimulate={simulatePayment}
	/>
{/if}
