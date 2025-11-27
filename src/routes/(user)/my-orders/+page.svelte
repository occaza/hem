<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { getStatusBadge, getStatusText } from '$lib/utils/status.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import {
		Package,
		Clock,
		CheckCircle,
		XCircle,
		Search,
		Filter,
		ArrowRight,
		ShoppingBag
	} from '@lucide/svelte';
	import { fade, fly, slide } from 'svelte/transition';

	type OrderItem = {
		product: {
			id: string;
			name: string;
			images?: string[];
			price: number;
			quantity?: number;
		};
		amount: number;
		note?: string;
	};

	type Order = {
		order_id: string;
		status: string;
		payment_method?: string;
		completed_at?: string;
		created_at: string;
		items: OrderItem[];
		total: number;
		fee?: number;
		total_payment?: number;
	};

	let { data } = $props();

	const user = $derived(data.user);
	const orders = $derived<Order[]>(data.orders || []);
	const loading = $derived(data.loading || false);

	let filter = $state('all');
	let searchQuery = $state('');

	const filteredOrders = $derived(
		orders.filter((o) => {
			const matchesFilter = filter === 'all' || o.status === filter;
			const matchesSearch =
				o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				o.items.some((i) => i.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesFilter && matchesSearch;
		})
	);

	import { toast } from '$lib/stores/toast.store';
	import { confirmAction } from '$lib/utils/swal.utils';

	// ... imports ...

	const tabs = [
		{ id: 'all', label: 'Semua', icon: Package },
		{ id: 'pending', label: 'Menunggu', icon: Clock },
		{ id: 'completed', label: 'Selesai', icon: CheckCircle },
		{ id: 'failed', label: 'Gagal', icon: XCircle },
		{ id: 'cancelled', label: 'Dibatalkan', icon: XCircle }
	];

	async function handleCancelOrder(orderId: string) {
		const confirmed = await confirmAction(
			'Apakah Anda yakin ingin membatalkan pesanan ini?',
			'Batalkan Pesanan?'
		);

		if (!confirmed) return;

		try {
			const res = await fetch('/api/transaction/cancel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order_id: orderId, user_id: user.id })
			});

			const data = await res.json();

			if (res.ok) {
				toast.success('Pesanan berhasil dibatalkan');
				window.location.reload();
			} else {
				toast.error(data.error || 'Gagal membatalkan pesanan');
			}
		} catch (error) {
			console.error('Cancel error:', error);
			toast.error('Terjadi kesalahan saat membatalkan pesanan');
		}
	}

	async function handleCheckStatus(orderId: string) {
		try {
			const res = await fetch('/api/check-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order_id: orderId })
			});

			const data = await res.json();

			if (res.ok) {
				if (data.status === 'expired') {
					toast.error('Transaksi telah kadaluarsa');
				} else if (data.status === 'completed') {
					toast.success('Pembayaran berhasil dikonfirmasi!');
				} else {
					toast.info('Status pesanan diperbarui: ' + getStatusText(data.status));
				}
				window.location.reload();
			} else {
				toast.error(data.error || 'Gagal mengecek status');
			}
		} catch (error) {
			console.error('Check status error:', error);
			toast.error('Terjadi kesalahan saat mengecek status');
		}
	}
</script>

<svelte:head>
	<title>Pesanan Saya - adverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200 pb-20">
	<Navbar />

	<!-- Header Section with Gradient -->
	<div
		class="relative overflow-hidden bg-gradient-to-br from-primary/90 to-purple-700 pt-24 pb-12 text-white shadow-lg"
	>
		<div
			class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
		></div>
		<div class="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
		<div class="absolute top-10 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

		<div class="relative z-10 container mx-auto px-4">
			<div class="flex flex-col items-end justify-between gap-4 md:flex-row">
				<div>
					<h1 class="mb-2 flex items-center gap-3 text-4xl font-bold">
						<Package class="h-10 w-10" />
						Pesanan Saya
					</h1>
					<p class="max-w-xl text-lg text-white/80">
						Kelola dan pantau status semua pesanan Anda di sini.
					</p>
				</div>

				<!-- Search Bar -->
				<div class="w-full md:w-auto">
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Search class="h-5 w-5 text-white/60" />
						</div>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Cari pesanan..."
							class="input-bordered input w-full border-white/20 bg-white/10 pl-10 text-white placeholder-white/60 transition-all focus:border-white focus:bg-white/20 md:w-64"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="relative z-20 container mx-auto -mt-6 px-4">
		<!-- Tabs -->
		<div
			class="no-scrollbar mb-8 flex flex-wrap gap-2 overflow-x-auto rounded-xl bg-base-100 p-2 shadow-lg"
		>
			{#each tabs as tab}
				<button
					class="btn h-10 min-w-[100px] flex-1 gap-2 transition-all duration-300 btn-sm {filter ===
					tab.id
						? 'shadow-md btn-primary'
						: 'btn-ghost hover:bg-base-200'}"
					onclick={() => (filter = tab.id)}
				>
					<tab.icon size={16} />
					{tab.label}
				</button>
			{/each}
		</div>

		{#if loading}
			<div class="flex flex-col items-center justify-center py-20">
				<span class="loading mb-4 loading-lg loading-spinner text-primary"></span>
				<p class="animate-pulse text-base-content/60">Memuat pesanan Anda...</p>
			</div>
		{:else if filteredOrders.length === 0}
			<div in:fade={{ duration: 300 }} class="card border border-base-300 bg-base-100 shadow-xl">
				<div class="card-body items-center py-20 text-center">
					<div class="mb-6 rounded-full bg-base-200 p-6">
						<ShoppingBag size={64} class="text-base-content/30" />
					</div>
					<h2 class="mb-2 text-2xl font-bold">
						{searchQuery
							? 'Pesanan tidak ditemukan'
							: filter === 'all'
								? 'Belum Ada Pesanan'
								: `Tidak ada pesanan ${filter}`}
					</h2>
					<p class="mb-8 max-w-md text-base-content/60">
						{searchQuery
							? `Tidak ada hasil untuk pencarian "${searchQuery}"`
							: 'Jelajahi katalog kami dan temukan produk digital terbaik untuk kebutuhan Anda.'}
					</p>
					<a
						href="/shop"
						class="btn shadow-lg transition-all btn-lg btn-primary hover:-translate-y-1 hover:shadow-xl"
					>
						<span>🛍️</span>
						Belanja Sekarang
					</a>
				</div>
			</div>
		{:else}
			<div class="space-y-6">
				{#each filteredOrders as order, i (order.order_id)}
					<div
						in:fly={{ y: 20, duration: 400, delay: i * 100 }}
						class="group card overflow-hidden border border-base-200 bg-base-100 shadow-md transition-all duration-300 hover:shadow-xl"
					>
						<!-- Card Header -->
						<div
							class="flex flex-wrap items-center justify-between gap-4 border-b border-base-200 bg-base-200/50 px-6 py-4"
						>
							<div class="flex items-center gap-3">
								<div class="rounded-lg border border-base-200 bg-white p-2 shadow-sm">
									<Package size={20} class="text-primary" />
								</div>
								<div>
									<div class="font-mono text-sm font-bold opacity-70">#{order.order_id}</div>
									<div class="flex items-center gap-1 text-xs text-base-content/60">
										<Clock size={12} />
										{formatDate(order.created_at)}
									</div>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<span class="badge {getStatusBadge(order.status)} gap-1 font-medium">
									{getStatusText(order.status)}
								</span>
							</div>
						</div>

						<div class="card-body p-6">
							<div class="flex flex-col gap-6 lg:flex-row">
								<!-- Items List -->
								<div class="flex-1 space-y-4">
									{#each order.items as item}
										<div class="group/item flex gap-4">
											<div
												class="relative h-20 w-20 overflow-hidden rounded-xl border border-base-300 shadow-sm"
											>
												<img
													src={item.product.images?.[0] ||
														'https://placehold.co/100x100?text=No+Image'}
													alt={item.product.name}
													class="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
												/>
											</div>

											<div class="flex-1">
												<div
													class="text-lg font-bold transition-colors group-hover/item:text-primary"
												>
													{item.product.name}
												</div>
												<div class="mt-1 flex items-center gap-2 text-sm text-base-content/70">
													<span class="badge badge-ghost badge-sm"
														>{item.product.quantity || 1} Item</span
													>
													<span>x {formatCurrency(item.product.price)}</span>
												</div>
												{#if item.note}
													<div
														class="mt-2 inline-block rounded-lg border-l-2 border-primary bg-base-200/80 p-2 text-xs"
													>
														<span class="font-semibold opacity-70">Catatan:</span>
														{item.note}
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>

								<!-- Order Summary & Actions -->
								<div
									class="flex flex-col justify-between border-t border-base-200 pt-4 lg:w-72 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
								>
									<div>
										<!-- Payment Breakdown -->
										<div class="mb-4 space-y-2 text-sm">
											<div class="flex justify-between text-base-content/70">
												<span>Subtotal</span>
												<span>{formatCurrency(order.total)}</span>
											</div>
											{#if order.fee}
												<div class="flex justify-between text-base-content/70">
													<span>Biaya Admin</span>
													<span>{formatCurrency(order.fee)}</span>
												</div>
											{/if}
											<div class="divider my-2"></div>
										</div>

										<div class="mb-1 text-sm text-base-content/60">Total Pembayaran</div>
										<div class="mb-4 text-2xl font-bold text-primary">
											{formatCurrency(order.total_payment || order.total)}
										</div>

										{#if order.payment_method}
											<div
												class="mb-2 flex items-center gap-2 rounded-lg bg-base-200/50 p-2 text-sm text-base-content/70"
											>
												<span>💳</span>
												<span class="font-semibold"
													>{formatPaymentMethod(order.payment_method)}</span
												>
											</div>
										{/if}

										{#if order.status === 'completed' && order.completed_at}
											<div class="mb-4 flex items-center gap-1 text-xs text-success">
												<CheckCircle size={12} />
												Dibayar: {formatDate(order.completed_at)}
											</div>
										{/if}
									</div>

									<div class="mt-4 flex flex-col gap-2">
										{#if order.status === 'pending'}
											<a
												href="/payment/{order.order_id}"
												class="btn w-full shadow-md transition-transform btn-primary group-hover:scale-[1.02] hover:shadow-lg"
											>
												Bayar Sekarang <ArrowRight size={16} />
											</a>
											<div class="grid grid-cols-2 gap-2">
												<button
													class="btn w-full btn-outline btn-sm"
													onclick={() => handleCheckStatus(order.order_id)}
												>
													Cek Status
												</button>
												<button
													class="btn w-full btn-outline btn-sm btn-error"
													onclick={() => handleCancelOrder(order.order_id)}
												>
													Batalkan
												</button>
											</div>
										{:else if order.status === 'completed'}
											<a href="/shop" class="btn w-full btn-outline btn-sm"> Beli Lagi </a>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<Footer />
</div>

<style>
	/* Hide scrollbar for tabs */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
