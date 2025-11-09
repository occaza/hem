<!-- src/routes/+page.svelte (REFACTORED - Step 4) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product } from '$lib/types/types';
	import QRCode from 'qrcode';
	import PaymentModal from '$lib/components/payment/PaymentModal.svelte';
	import MethodSelectorModal from '$lib/components/payment/MethodSelectorModal.svelte';
	import ProductCard from '$lib/components/products/ProductCard.svelte';
	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';

	let products = $state<Product[]>([]);
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
				const res = await fetch('/api/products');
				const data = await res.json();
				products = data;
			} catch (error) {
				console.error('Failed to fetch products:', error);
			} finally {
				loading = false;
			}
		})();

		return () => {
			if (pollingInterval) clearInterval(pollingInterval);
		};
	});

	function showMethodSelection(product: Product) {
		selectedProduct = product;
		showMethodSelector = true;
	}

	async function processCheckout(method: string) {
		if (!selectedProduct) return;

		selectedMethod = method;
		const orderId = `ORDER_${Date.now()}`;
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
				alert(data.error || 'Gagal membuat transaksi.');
				return;
			}

			if (!data.payment_number) {
				alert('Response tidak valid dari server.');
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
			alert('Terjadi kesalahan. Silakan coba lagi.');
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
				alert('Simulasi berhasil! Tunggu sebentar...');
			} else {
				alert(data.error || 'Simulasi gagal');
				isSimulating = false;
			}
		} catch (error) {
			console.error('Simulate error:', error);
			alert('Terjadi kesalahan saat simulasi');
			isSimulating = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-center text-4xl font-bold">Produk Kami</h1>

	{#if loading}
		<div class="flex justify-center">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if products.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each products as product}
				<ProductCard {product} onBuy={showMethodSelection} />
			{/each}
		</div>
	{:else}
		<div class="alert alert-info">
			<span>Tidak ada produk tersedia.</span>
		</div>
	{/if}
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
