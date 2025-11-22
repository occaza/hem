<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { getStatusBadge, getStatusText } from '$lib/utils/status.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import { Package, Clock, CheckCircle, XCircle, Search, Filter, ArrowRight, ShoppingBag } from '@lucide/svelte';
	import { fade, fly, slide } from 'svelte/transition';

	type OrderItem = {
		product: {
			id: string;
			name: string;
			images?: string[];
			price: number;
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
			const matchesSearch = o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
								  o.items.some(i => i.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesFilter && matchesSearch;
		})
	);

	const tabs = [
		{ id: 'all', label: 'Semua', icon: Package },
		{ id: 'pending', label: 'Menunggu', icon: Clock },
		{ id: 'completed', label: 'Selesai', icon: CheckCircle },
		{ id: 'failed', label: 'Gagal', icon: XCircle }
	];
</script>

<svelte:head>
	<title>Pesanan Saya - adverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200 pb-20">
	<Navbar />

	<!-- Header Section with Gradient -->
	<div class="relative bg-gradient-to-br from-primary/90 to-purple-700 pt-24 pb-12 text-white shadow-lg overflow-hidden">
		<div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
		<div class="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
		<div class="absolute top-10 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
		
		<div class="container mx-auto px-4 relative z-10">
			<div class="flex flex-col md:flex-row justify-between items-end gap-4">
				<div>
					<h1 class="text-4xl font-bold mb-2 flex items-center gap-3">
						<Package class="h-10 w-10" />
						Pesanan Saya
					</h1>
					<p class="text-white/80 text-lg max-w-xl">
						Kelola dan pantau status semua pesanan Anda di sini.
					</p>
				</div>
				
				<!-- Search Bar -->
				<div class="w-full md:w-auto">
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search class="h-5 w-5 text-white/60" />
						</div>
						<input 
							type="text" 
							bind:value={searchQuery}
							placeholder="Cari pesanan..." 
							class="input input-bordered bg-white/10 border-white/20 text-white placeholder-white/60 pl-10 w-full md:w-64 focus:bg-white/20 focus:border-white transition-all"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 -mt-6 relative z-20">
		<!-- Tabs -->
		<div class="bg-base-100 rounded-xl shadow-lg p-2 mb-8 flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
			{#each tabs as tab}
				<button
					class="flex-1 min-w-[100px] btn btn-sm h-10 gap-2 transition-all duration-300 {filter === tab.id ? 'btn-primary shadow-md' : 'btn-ghost hover:bg-base-200'}"
					onclick={() => (filter = tab.id)}
				>
					<tab.icon size={16} />
					{tab.label}
				</button>
			{/each}
		</div>

		{#if loading}
			<div class="flex flex-col items-center justify-center py-20">
				<span class="loading loading-spinner loading-lg text-primary mb-4"></span>
				<p class="text-base-content/60 animate-pulse">Memuat pesanan Anda...</p>
			</div>
		{:else if filteredOrders.length === 0}
			<div in:fade={{ duration: 300 }} class="card bg-base-100 shadow-xl border border-base-300">
				<div class="card-body items-center py-20 text-center">
					<div class="mb-6 bg-base-200 p-6 rounded-full">
						<ShoppingBag size={64} class="text-base-content/30" />
					</div>
					<h2 class="mb-2 text-2xl font-bold">
						{searchQuery ? 'Pesanan tidak ditemukan' : (filter === 'all' ? 'Belum Ada Pesanan' : `Tidak ada pesanan ${filter}`)}
					</h2>
					<p class="mb-8 text-base-content/60 max-w-md">
						{searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : 'Jelajahi katalog kami dan temukan produk digital terbaik untuk kebutuhan Anda.'}
					</p>
					<a href="/shop" class="btn btn-primary btn-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
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
						class="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-200 overflow-hidden group"
					>
						<!-- Card Header -->
						<div class="bg-base-200/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-base-200">
							<div class="flex items-center gap-3">
								<div class="bg-white p-2 rounded-lg shadow-sm border border-base-200">
									<Package size={20} class="text-primary" />
								</div>
								<div>
									<div class="font-mono text-sm font-bold opacity-70">#{order.order_id}</div>
									<div class="text-xs text-base-content/60 flex items-center gap-1">
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
							<div class="flex flex-col lg:flex-row gap-6">
								<!-- Items List -->
								<div class="flex-1 space-y-4">
									{#each order.items as item}
										<div class="flex gap-4 group/item">
											<div class="h-20 w-20 overflow-hidden rounded-xl border border-base-300 shadow-sm relative">
												<img
													src={item.product.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
													alt={item.product.name}
													class="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
												/>
											</div>

											<div class="flex-1">
												<div class="font-bold text-lg group-hover/item:text-primary transition-colors">{item.product.name}</div>
												<div class="text-sm text-base-content/70 flex items-center gap-2 mt-1">
													<span class="badge badge-sm badge-ghost">{item.amount}x</span>
													<span>{formatCurrency(item.product.price)}</span>
												</div>
												{#if item.note}
													<div class="mt-2 text-xs bg-base-200/80 p-2 rounded-lg inline-block border-l-2 border-primary">
														<span class="font-semibold opacity-70">Catatan:</span> {item.note}
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>

								<!-- Order Summary & Actions -->
								<div class="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-base-200 pt-4 lg:pt-0 lg:pl-6">
									<div>
										<div class="text-sm text-base-content/60 mb-1">Total Pembayaran</div>
										<div class="text-2xl font-bold text-primary mb-4">{formatCurrency(order.total)}</div>
										
										{#if order.payment_method}
											<div class="flex items-center gap-2 text-sm text-base-content/70 mb-2 bg-base-200/50 p-2 rounded-lg">
												<span>💳</span>
												<span class="font-semibold">{formatPaymentMethod(order.payment_method)}</span>
											</div>
										{/if}
										
										{#if order.status === 'completed' && order.completed_at}
											<div class="text-xs text-success flex items-center gap-1 mb-4">
												<CheckCircle size={12} />
												Dibayar: {formatDate(order.completed_at)}
											</div>
										{/if}
									</div>

									<div class="mt-4 flex flex-col gap-2">
										{#if order.status === 'pending'}
											<a href="/payment/{order.order_id}" class="btn btn-primary shadow-md hover:shadow-lg w-full group-hover:scale-[1.02] transition-transform">
												Bayar Sekarang <ArrowRight size={16} />
											</a>
											<button class="btn btn-outline btn-sm w-full" onclick={() => window.location.reload()}>
												Cek Status
											</button>
										{:else if order.status === 'completed'}
											<a href="/shop" class="btn btn-outline btn-sm w-full">
												Beli Lagi
											</a>
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
