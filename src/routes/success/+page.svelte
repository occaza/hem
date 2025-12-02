<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Transaction } from '$lib/types/types';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { CircleCheck, X } from '@lucide/svelte';

	import { goto } from '$app/navigation';

	let transaction: Pick<Transaction, 'status' | 'amount'> | null = null;
	let loading = true;
	let isSimulated = false;
	let countdown = 5;
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const orderId = urlParams.get('order_id');
		isSimulated = urlParams.get('simulated') === 'true';

		if (!orderId) {
			loading = false;
			return;
		}

		try {
			const res = await fetch(`/api/transaction/${orderId}`);
			const data = await res.json();

			if (res.ok) {
				transaction = data;
				if (transaction?.status === 'completed') {
					countdownInterval = setInterval(() => {
						countdown--;
						if (countdown <= 0) {
							if (countdownInterval) clearInterval(countdownInterval);
							goto('/account?tab=orders');
						}
					}, 1000);
				}
			}
		} catch (error) {
			console.error('Failed to fetch transaction:', error);
		} finally {
			loading = false;
		}
	});

	onDestroy(() => {
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
	});
</script>

<svelte:head>
	<title>Pembayaran Berhasil - adverFI</title>
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
							Rp{transaction.amount.toLocaleString('id-ID')}
						</div>
						<div class="mt-6 card-actions">
							<a href="/account?tab=orders" class="btn btn-primary">Pesanan saya</a>
						</div>
					</div>
				</div>
			{:else if transaction && transaction.status === 'processing'}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<div class="mb-4 text-6xl">⏳</div>
						<h1 class="card-title text-2xl">
							{isSimulated ? 'Pembayaran Diterima!' : 'Sedang Diproses'}
						</h1>
						<p class="text-base-content/70">
							Pesanan Anda sedang diproses oleh admin. Anda akan menerima notifikasi saat selesai.
						</p>
						<div class="divider"></div>
						<div class="text-2xl font-bold text-primary">
							Rp{transaction.amount.toLocaleString('id-ID')}
						</div>
						<div class="mt-6 card-actions">
							<a href="/account?tab=orders" class="btn btn-primary">Lihat Status Pesanan</a>
						</div>
					</div>
				</div>
			{:else}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<X size={64} />
						<h1 class="card-title text-2xl">Pembayaran Belum Berhasil</h1>
						<p class="mt-2 text-base-content/70">
							Silakan coba lagi atau hubungi kami jika ada masalah.
						</p>
						<div class="mt-6 card-actions">
							<a href="/account?tab=orders" class="btn btn-primary">Coba Lagi</a>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
	<!-- <Footer /> -->
</div>
