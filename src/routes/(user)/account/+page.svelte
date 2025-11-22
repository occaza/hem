<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { ShoppingBag, Package, CheckCircle, Clock, ArrowRight, User, TrendingUp, Sparkles } from '@lucide/svelte';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { getStatusBadge, getStatusText } from '$lib/utils/status.utils';

	let { data } = $props();

	const firstName = $derived(data.user.full_name?.split(' ')[0] || 'User');
	
	// Function to get the correct link based on order status
	function getOrderLink(order: any) {
		// If completed, go to order detail page (if exists), otherwise my-orders
		if (order.status === 'completed') {
			return `/my-orders`;
		}
		// If pending or processing, go to payment page
		return `/payment/${order.order_id}`;
	}
</script>

<svelte:head>
	<title>Dashboard - AdverFI</title>
	<style>
		.gradient-bg {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
		.gradient-card {
			background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
		}
		.stat-card {
			transition: all 0.3s ease;
		}
		.stat-card:hover {
			transform: translateY(-4px);
			box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
		}
		.order-item {
			transition: all 0.2s ease;
		}
		.order-item:hover {
			transform: translateX(4px);
		}
	</style>
</svelte:head>

<Navbar />

<div class="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 pb-20 pt-24">
	<div class="container mx-auto px-4">
		<!-- Welcome Section with Gradient -->
		<div class="card gradient-bg shadow-2xl mb-8 overflow-hidden">
			<div class="card-body text-white">
				<div class="flex flex-col md:flex-row items-center gap-6">
					<div class="avatar online">
						<div class="w-24 rounded-full ring ring-white ring-offset-4 ring-offset-purple-600 shadow-xl">
							{#if data.user.avatar_url}
								<img src={data.user.avatar_url} alt="Avatar" />
							{:else}
								<div
									class="flex h-full items-center justify-center bg-white text-4xl text-purple-600 font-bold"
								>
									{data.user.full_name?.charAt(0) || '👤'}
								</div>
							{/if}
						</div>
					</div>
					<div class="flex-1 text-center md:text-left">
						<div class="flex items-center gap-2 justify-center md:justify-start mb-2">
							<Sparkles size={24} />
							<h1 class="text-4xl font-bold">Halo, {firstName}!</h1>
						</div>
						<p class="text-white/90 text-lg">{data.user.email}</p>
						<p class="text-white/70 mt-2">Selamat datang kembali di dashboard Anda</p>
					</div>
					<div class="hidden lg:block">
						<div class="stats stats-vertical shadow-lg bg-white/10 backdrop-blur-sm text-white">
							<div class="stat">
								<div class="stat-title text-white/70">Member Sejak</div>
								<div class="stat-value text-2xl">2025</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Stats Cards with Hover Effect -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
			<!-- Total Orders -->
			<div class="stat-card stats shadow-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
				<div class="stat">
					<div class="stat-figure text-primary">
						<div class="avatar">
							<div class="w-16 rounded-full bg-primary/20">
								<div class="flex h-full items-center justify-center">
									<ShoppingBag size={32} />
								</div>
							</div>
						</div>
					</div>
					<div class="stat-title font-semibold">Total Pesanan</div>
					<div class="stat-value text-primary text-4xl">{data.stats.totalOrders}</div>
					<div class="stat-desc flex items-center gap-1">
						<TrendingUp size={14} />
						Semua transaksi Anda
					</div>
				</div>
			</div>

			<!-- Pending Orders -->
			<div class="stat-card stats shadow-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
				<div class="stat">
					<div class="stat-figure text-warning">
						<div class="avatar">
							<div class="w-16 rounded-full bg-warning/20">
								<div class="flex h-full items-center justify-center">
									<Clock size={32} />
								</div>
							</div>
						</div>
					</div>
					<div class="stat-title font-semibold">Menunggu Pembayaran</div>
					<div class="stat-value text-warning text-4xl">{data.stats.pendingOrders}</div>
					<div class="stat-desc">Segera selesaikan pembayaran</div>
				</div>
			</div>

			<!-- Completed Orders -->
			<div class="stat-card stats shadow-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
				<div class="stat">
					<div class="stat-figure text-success">
						<div class="avatar">
							<div class="w-16 rounded-full bg-success/20">
								<div class="flex h-full items-center justify-center">
									<CheckCircle size={32} />
								</div>
							</div>
						</div>
					</div>
					<div class="stat-title font-semibold">Pesanan Selesai</div>
					<div class="stat-value text-success text-4xl">{data.stats.completedOrders}</div>
					<div class="stat-desc">Transaksi berhasil 🎉</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Recent Orders -->
			<div class="lg:col-span-2">
				<div class="card bg-base-100 shadow-xl border border-base-300">
					<div class="card-body">
						<div class="flex items-center justify-between mb-4">
							<h2 class="card-title text-2xl">
								<Package size={24} class="text-primary" />
								Pesanan Terbaru
							</h2>
							{#if data.stats.totalOrders > 0}
								<a href="/my-orders" class="btn btn-ghost btn-sm gap-1">
									Lihat Semua
									<ArrowRight size={16} />
								</a>
							{/if}
						</div>

						{#if data.recentOrders.length > 0}
							<div class="space-y-3">
								{#each data.recentOrders as order}
									<a
										href={getOrderLink(order)}
										class="order-item flex items-center justify-between rounded-xl bg-gradient-to-r from-base-200 to-base-100 p-4 border border-base-300 hover:border-primary hover:shadow-lg"
									>
										<div class="flex items-center gap-4">
											{#if order.product?.[0]?.images?.[0]}
												<div class="avatar">
													<div class="w-14 rounded-lg shadow-md">
														<img src={order.product[0].images[0]} alt={order.product[0].name} />
													</div>
												</div>
											{:else}
												<div class="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 shadow-md">
													<Package size={24} class="text-primary" />
												</div>
											{/if}
											<div>
												<div class="font-semibold text-base">{order.product?.[0]?.name || 'Produk'}</div>
												<div class="text-sm text-base-content/60 flex items-center gap-2">
													<Clock size={12} />
													{formatDate(order.created_at)}
												</div>
											</div>
										</div>
										<div class="flex items-center gap-4">
											<div class="text-right">
												<div class="font-bold text-lg text-primary">{formatCurrency(order.amount)}</div>
												<div class="text-sm mt-1">
													<span class="badge {getStatusBadge(order.status)} gap-1 font-medium">
														{getStatusText(order.status)}
													</span>
												</div>
											</div>
											<ArrowRight size={20} class="text-base-content/30" />
										</div>
									</a>
								{/each}
							</div>
						{:else}
							<div class="flex flex-col items-center justify-center py-16 gradient-card rounded-xl">
								<div class="bg-primary/10 p-6 rounded-full mb-4">
									<Package size={64} class="text-primary" />
								</div>
								<p class="text-xl font-semibold mb-2">Belum Ada Pesanan</p>
								<p class="mb-6 text-base-content/70">Mulai berbelanja sekarang!</p>
								<a href="/shop" class="btn btn-primary btn-lg gap-2 shadow-lg">
									<ShoppingBag size={20} />
									Mulai Belanja
								</a>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="lg:col-span-1 space-y-6">
				<div class="card bg-base-100 shadow-xl border border-base-300">
					<div class="card-body">
						<h2 class="card-title text-xl mb-4">
							<Sparkles size={20} class="text-primary" />
							Aksi Cepat
						</h2>
						<div class="space-y-3">
							<a href="/shop" class="btn btn-primary btn-block justify-start gap-2 shadow-md hover:shadow-lg">
								<ShoppingBag size={20} />
								Lanjutkan Belanja
							</a>
							<a href="/my-orders" class="btn btn-outline btn-block justify-start gap-2 hover:btn-primary">
								<Package size={20} />
								Lihat Semua Pesanan
							</a>
							<a href="/profile" class="btn btn-outline btn-block justify-start gap-2 hover:btn-primary">
								<User size={20} />
								Edit Profil
							</a>
						</div>
					</div>
				</div>

				<div class="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl border border-primary/30">
					<div class="card-body">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
							</svg>
							Butuh Bantuan?
						</h3>
						<p class="text-sm text-base-content/80 mb-3">
							Tim support kami siap membantu Anda 24/7
						</p>
						<a href="mailto:support@adverfi.id" class="btn btn-primary btn-block gap-2 shadow-md">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
								<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
							</svg>
							Hubungi Support
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
