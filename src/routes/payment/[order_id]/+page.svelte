<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import QRCode from 'qrcode';
	import { formatCurrency, formatShortDate } from '$lib/utils/format.utils';

	let paymentData = $state<any>(null);
	let qrImageUrl = $state('');
	let loading = $state(true);
	let pollingInterval: any = null;
	let isSimulating = $state(false);

	const orderId = $derived($page.params.order_id);

	onMount(() => {
		if (!browser) return;

		loadPaymentData();
		startPolling();

		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
				pollingInterval = null;
			}
		};
	});

	async function loadPaymentData() {
		try {
			const res = await fetch(`/api/payment-info/${orderId}`);
			if (!res.ok) {
				goto('/my-orders');
				return;
			}

			const data = await res.json();
			paymentData = data;
			// QR akan di-generate otomatis oleh $effect di atas
		} catch (error) {
			console.error('Load payment error:', error);
			goto('/my-orders');
		} finally {
			loading = false;
		}
	}

	function startPolling() {
		if (!browser) return;

		pollingInterval = setInterval(async () => {
			try {
				const res = await fetch('/api/check-payment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ order_id: orderId })
				});

				const data = await res.json();

				if (data.status === 'completed') {
					if (pollingInterval) {
						clearInterval(pollingInterval);
						pollingInterval = null;
					}
					goto(`/success?order_id=${orderId}`);
				}
			} catch (error) {
				console.error('Polling error:', error);
			}
		}, 3000);

		setTimeout(() => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
				pollingInterval = null;
			}
		}, 600000);
	}

	async function simulatePayment() {
		if (isSimulating || !paymentData) return;

		isSimulating = true;

		try {
			const res = await fetch('/api/simulate-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					order_id: orderId,
					amount: paymentData.amount
				})
			});

			if (res.ok) {
				alert('Simulasi berhasil! Tunggu sebentar...');
			} else {
				const data = await res.json();
				alert(data.error || 'Simulasi gagal');
				isSimulating = false;
			}
		} catch (error) {
			console.error('Simulate error:', error);
			alert('Terjadi kesalahan');
			isSimulating = false;
		}
	}

	function copyToClipboard(text: string) {
		if (!browser) return;
		navigator.clipboard.writeText(text);
		alert('Nomor berhasil disalin!');
	}

	$effect(() => {
		if (
			paymentData?.payment_method === 'qris' &&
			paymentData.payment_number &&
			browser &&
			!qrImageUrl
		) {
			QRCode.toDataURL(paymentData.payment_number, {
				width: 300,
				margin: 2,
				errorCorrectionLevel: 'M'
			})
				.then((url) => {
					qrImageUrl = url;
				})
				.catch((error) => {
					console.error('QR generation error:', error);
				});
		}
	});
</script>

<div class="min-h-screen bg-base-200">
	<div class="navbar bg-base-100 shadow-md">
		<div class="container mx-auto">
			<a href="/my-orders" class="btn btn-ghost">
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Kembali
			</a>
			<div class="flex-1 text-center">
				<span class="text-lg font-bold">Menunggu Pembayaran</span>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8">
		{#if loading}
			<div class="flex justify-center py-20">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{:else if paymentData}
			<div class="mx-auto max-w-lg">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-4 text-center">
							<div class="text-sm text-base-content/70">Order ID</div>
							<div class="font-mono font-semibold">{orderId}</div>
						</div>

						<div class="rounded-lg bg-base-200 p-4">
							<div class="mb-2 flex items-center justify-between">
								<span class="text-sm">Total Pembayaran:</span>
								<span class="text-xl font-bold text-primary">
									{formatCurrency(paymentData.total_payment || 0)}
								</span>
							</div>

							<div class="mb-1 flex justify-between text-sm text-base-content/70">
								<span>Subtotal:</span>
								<span>{formatCurrency(paymentData.amount || 0)}</span>
							</div>
							<div class="mb-1 flex justify-between text-sm text-base-content/70">
								<span>Biaya Admin:</span>
								<span>{formatCurrency(paymentData.fee || 0)}</span>
							</div>
							{#if paymentData.expired_at}
								<div class="flex justify-between text-sm text-base-content/70">
									<span>Berlaku hingga:</span>
									<span>{formatShortDate(paymentData.expired_at)}</span>
								</div>
							{/if}
						</div>

						<div class="divider"></div>

						{#if paymentData.payment_method === 'qris'}
							<div class="mb-4">
								<div class="mb-2 text-center font-semibold">Scan QR Code</div>
								<div class="flex justify-center">
									<div class="rounded-lg border-4 border-base-300 p-4">
										{#if qrImageUrl}
											<img src={qrImageUrl} alt="QR Code QRIS" class="h-72 w-72" />
										{:else}
											<!-- ✅ Fallback jika QR gagal generate -->
											<div class="flex h-72 w-72 flex-col items-center justify-center gap-4">
												<span class="loading loading-lg loading-spinner"></span>
												<div class="text-center">
													<div class="text-sm text-base-content/70">Atau gunakan nomor:</div>
													<input
														type="text"
														value={paymentData.payment_number}
														readonly
														class="input-bordered input input-sm mt-2 w-full font-mono text-xs"
													/>
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>

							<div class="alert alert-info">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									class="h-6 w-6 shrink-0 stroke-current"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span class="text-sm">
									Buka aplikasi mobile banking atau e-wallet, lalu scan QR code di atas.
								</span>
							</div>
						{:else if paymentData.payment_number}
							<div class="mb-4">
								<div class="mb-2 text-sm font-semibold">
									Nomor Virtual Account / Kode Pembayaran:
								</div>
								<div class="flex items-center gap-2">
									<input
										type="text"
										value={paymentData.payment_number}
										readonly
										class="input-bordered input w-full font-mono"
									/>
									<button
										class="btn btn-square btn-primary"
										onclick={() => copyToClipboard(paymentData.payment_number)}
									>
										📋
									</button>
								</div>
							</div>

							<div class="alert alert-info">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									class="h-6 w-6 shrink-0 stroke-current"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span class="text-sm">
									Gunakan nomor di atas untuk pembayaran melalui ATM, mobile banking, atau retail.
								</span>
							</div>
						{/if}

						<div class="divider"></div>

						<button
							class="btn btn-block btn-sm btn-warning"
							onclick={simulatePayment}
							disabled={isSimulating}
						>
							{#if isSimulating}
								<span class="loading loading-sm loading-spinner"></span>
								Memproses simulasi...
							{:else}
								🧪 Simulasi Pembayaran (Development Only)
							{/if}
						</button>

						<div class="mt-4 flex items-center justify-center gap-2 text-warning">
							<span class="loading loading-sm loading-spinner"></span>
							<span class="font-medium">Menunggu pembayaran...</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
