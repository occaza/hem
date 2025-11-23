<script lang="ts">
	import { onMount } from 'svelte';
	import type { Transaction } from '$lib/types/types';
	import Footer from '$lib/components/layout/Footer.svelte';

	let transaction: Pick<Transaction, 'status' | 'amount'> | null = null;
	let loading = true;
	let isSimulated = false;

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
			}
		} catch (error) {
			console.error('Failed to fetch transaction:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Pembayaran Berhasil - adverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-md">
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
						<div class="mb-4 text-6xl">✅</div>
						<h1 class="card-title text-2xl">Pembayaran Berhasil</h1>
						<p class="text-base-content/70">Pesanan Anda sudah selesai diproses</p>
						<div class="divider"></div>
						<div class="text-3xl font-bold text-primary">
							Rp{transaction.amount.toLocaleString('id-ID')}
						</div>
						<div class="mt-6 card-actions">
							<a href="/my-orders" class="btn btn-primary">Pesanan saya</a>
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
							<a href="/my-orders" class="btn btn-primary">Lihat Status Pesanan</a>
						</div>
					</div>
				</div>
			{:else}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<div class="mb-4 text-6xl">❌</div>
						<h1 class="card-title text-2xl">Pembayaran Belum Berhasil</h1>
						<p class="mt-2 text-base-content/70">
							Silakan coba lagi atau hubungi kami jika ada masalah.
						</p>
						<div class="mt-6 card-actions">
							<a href="/my-orders" class="btn btn-primary">Coba Lagi</a>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
	<Footer />
</div>
