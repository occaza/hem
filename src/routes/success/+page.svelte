<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Transaction } from '$lib/types/types';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { CircleCheck, X, Hourglass, Copy, Clock, CreditCard } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';
	import QRCode from 'qrcode';

	import { goto } from '$app/navigation';

	let transaction:
		| (Pick<Transaction, 'status' | 'amount'> & {
				payment_method?: string;
				payment_number?: string;
				total_payment?: number;
				expired_at?: string;
				fee?: number;
		  })
		| null = null;

	let loading = true;
	let isSimulated = false;
	let countdown = 5;
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let qrImageUrl = '';

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const orderId = urlParams.get('order_id');
		isSimulated = urlParams.get('simulated') === 'true';

		if (!orderId) {
			loading = false;
			return;
		}

		await fetchTransaction(orderId);
	});

	async function fetchTransaction(orderId: string) {
		try {
			const res = await fetch(`/api/transaction/${orderId}`);
			const data = await res.json();

			if (res.ok) {
				transaction = data;
				// If simulated, treat as completed regardless of actual status
				if (isSimulated && transaction) {
					transaction.status = 'completed';
					startRedirectCountdown();
				} else if (transaction?.status === 'completed') {
					startRedirectCountdown();
				} else if (
					transaction?.status === 'pending' &&
					transaction.payment_method === 'qris' &&
					transaction.payment_number
				) {
					generateQRCode(transaction.payment_number);
				}
			}
		} catch (error) {
			console.error('Failed to fetch transaction:', error);
		} finally {
			loading = false;
		}
	}

	async function generateQRCode(text: string) {
		try {
			qrImageUrl = await QRCode.toDataURL(text, {
				width: 256,
				margin: 1,
				errorCorrectionLevel: 'M'
			});
		} catch (err) {
			console.error('QR Generation error:', err);
		}
	}

	function startRedirectCountdown() {
		if (countdownInterval) clearInterval(countdownInterval);
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				if (countdownInterval) clearInterval(countdownInterval);
				goto('/account?tab=orders');
			}
		}, 1000);
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.success('Disalin ke clipboard');
	}

	onDestroy(() => {
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
	});

	function getPaymentMethodName(code?: string) {
		if (!code) return 'Pembayaran';
		if (code === 'qris') return 'QRIS';
		if (code.includes('va')) return code.replace('_va', '').toUpperCase() + ' Virtual Account';
		return code.toUpperCase();
	}
</script>

<svelte:head>
	<title>Status Pembayaran - adverFI</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-200">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-md items-center">
			{#if loading}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<span class="loading loading-lg loading-spinner"></span>
						<p>Memverifikasi pembayaran...</p>
					</div>
				</div>
			{:else if transaction && transaction.status === 'completed'}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<div class="mb-4 text-6xl text-primary"><CircleCheck size={64} /></div>
						<h1 class="card-title text-2xl">Pembayaran Berhasil</h1>
						<p class="text-base-content/70">
							Silahkan cek pesanan anda di menu <a
								href="/account?tab=orders"
								class="text-primary underline"
								>pesanan
							</a> saya.
						</p>
						<p class="mt-2 text-sm text-base-content/50">
							Mengalihkan otomatis dalam {countdown} detik...
						</p>
						<div class="divider"></div>
						<div class="text-3xl font-bold text-primary">
							Rp{(transaction.total_payment || transaction.amount).toLocaleString('id-ID')}
						</div>
						<div class="mt-6 card-actions">
							<a href="/account?tab=orders" class="btn btn-primary">Pesanan saya</a>
						</div>
					</div>
				</div>
			{:else if transaction && transaction.status === 'processing'}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<Hourglass size={64} />
						<h1 class="card-title text-2xl">
							{isSimulated ? 'Pembayaran Diterima!' : 'Sedang Diproses'}
						</h1>
						<p class="text-base-content/70">
							Pesanan Anda sedang diproses oleh admin. Anda akan menerima notifikasi saat selesai.
						</p>
						<div class="divider"></div>
						<div class="text-2xl font-bold text-primary">
							Rp{(transaction.total_payment || transaction.amount).toLocaleString('id-ID')}
						</div>
						<div class="mt-6 card-actions">
							<a href="/account?tab=orders" class="btn btn-primary">Lihat Status Pesanan</a>
						</div>
					</div>
				</div>
			{:else if transaction && transaction.status === 'pending'}
				<!-- PENDING PAYMENT -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-6 text-center">
							<div class="mb-2 flex justify-center text-warning">
								<Clock size={48} />
							</div>
							<h1 class="card-title justify-center text-2xl">Menunggu Pembayaran</h1>
							<p class="text-base-content/70">Selesaikan pembayaran sebelum waktu habis.</p>
						</div>

						<div class="mb-4 rounded-xl bg-base-200 p-4">
							<div class="mb-1 text-sm text-base-content/60">Total Pembayaran</div>
							<div class="flex items-center justify-between">
								<div class="text-2xl font-bold text-primary">
									Rp{(transaction.total_payment || transaction.amount).toLocaleString('id-ID')}
								</div>
								<button
									class="btn btn-square btn-ghost btn-sm"
									onclick={() =>
										copyToClipboard(
											(transaction?.total_payment || transaction?.amount || 0).toString()
										)}
								>
									<Copy size={16} />
								</button>
							</div>
						</div>

						<div class="rounded-xl border border-base-200 p-4">
							<div class="mb-4 flex items-center gap-3">
								<div class="rounded-lg bg-primary/10 p-2 text-primary">
									<CreditCard size={24} />
								</div>
								<div>
									<div class="text-sm text-base-content/60">Metode Pembayaran</div>
									<div class="font-bold">{getPaymentMethodName(transaction.payment_method)}</div>
								</div>
							</div>

							{#if transaction.payment_number && transaction.payment_number !== '-'}
								<div class="divider my-2"></div>
								<div class="mb-1 text-sm text-base-content/60">
									{transaction.payment_method === 'qris'
										? 'Kode Pembayaran'
										: 'Nomor Virtual Account'}
								</div>

								{#if transaction.payment_method === 'qris' && qrImageUrl}
									<div class="mb-4 flex justify-center">
										<div class="rounded-xl border-2 border-base-200 bg-white p-3">
											<img src={qrImageUrl} alt="QRIS Code" class="h-64 w-64" />
										</div>
									</div>
									<div class="mb-3 text-center text-xs text-base-content/50">
										Scan QR code di atas dengan aplikasi e-wallet
									</div>
								{/if}

								<div class="flex items-center justify-between rounded-lg bg-base-200 p-3">
									<div class="font-mono text-xl font-bold tracking-wider">
										{transaction.payment_number}
									</div>
									<button
										class="btn btn-square btn-ghost btn-sm"
										onclick={() => copyToClipboard(transaction?.payment_number || '')}
									>
										<Copy size={16} />
									</button>
								</div>
							{/if}

							{#if transaction.expired_at}
								<div class="mt-4 text-center text-xs text-error">
									Jatuh tempo: {new Date(transaction.expired_at).toLocaleString('id-ID')}
								</div>
							{/if}
						</div>

						<div class="mt-6 card-actions flex-col gap-2">
							<button class="btn w-full btn-primary" onclick={() => window.location.reload()}>
								Cek Status Pembayaran
							</button>
							<a href="/account?tab=orders" class="btn w-full btn-ghost">Cek Nanti</a>
						</div>
					</div>
				</div>
			{:else}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<X size={64} />
						<h1 class="card-title text-2xl">Pembayaran Gagal</h1>
						<p class="mt-2 text-base-content/70">
							Maaf, terjadi kesalahan atau pembayaran dibatalkan.
						</p>
						<div class="mt-6 card-actions">
							<a href="/cart" class="btn btn-primary">Coba Lagi</a>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
	<!-- <Footer /> -->
</div>
