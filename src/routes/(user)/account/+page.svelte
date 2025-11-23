<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import {
		ShoppingBag,
		Package,
		CheckCircle,
		Clock,
		ArrowRight,
		User,
		TrendingUp,
		Sparkles
	} from '@lucide/svelte';
	import { formatCurrency, formatDate, formatDateSimple } from '$lib/utils/format.utils';
	import { getStatusBadge, getStatusText } from '$lib/utils/status.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import OrderDetailModal from '$lib/components/features/orders/OrderDetailModal.svelte';

	let { data } = $props();

	const firstName = $derived(data.user.full_name?.split(' ')[0] || 'User');

	let selectedOrder = $state<any>(null);
	let isModalOpen = $state(false);

	function openOrderDetail(order: any) {
		selectedOrder = order;
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		setTimeout(() => (selectedOrder = null), 300);
	}

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
			background: linear-gradient(
				135deg,
				rgba(102, 126, 234, 0.1) 0%,
				rgba(118, 75, 162, 0.1) 100%
			);
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

<div class="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 pt-24 pb-20">
	<div class="container mx-auto px-4">
		<!-- Welcome Section with Gradient -->
		<div class="gradient-bg card mb-8 overflow-hidden shadow-2xl">
			<div class="card-body text-white">
				<div class="flex flex-col items-center gap-6 md:flex-row">
					<div class="online avatar">
						<div
							class="w-24 rounded-full shadow-xl ring ring-white ring-offset-4 ring-offset-purple-600"
						>
							{#if data.user.avatar_url}
								<img src={data.user.avatar_url} alt="Avatar" />
							{:else}
								<div
									class="flex h-full items-center justify-center bg-white text-4xl font-bold text-purple-600"
								>
									{data.user.full_name?.charAt(0) || '👤'}
								</div>
							{/if}
						</div>
					</div>
					<div class="flex-1 text-center md:text-left">
						<div class="mb-2 flex items-center justify-center gap-2 md:justify-start">
							<Sparkles size={24} />
							<h1 class="text-4xl font-bold">Halo, {firstName}!</h1>
						</div>
						<p class="text-lg text-white/90">{data.user.email}</p>
						<p class="mt-2 text-white/70">Selamat datang kembali di dashboard Anda</p>
					</div>
					<div class="hidden lg:block">
						<div class="stats stats-vertical bg-white/10 text-white shadow-lg backdrop-blur-sm">
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
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Total Orders -->
			<div
				class="stat-card stats border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl"
			>
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
					<div class="stat-value text-4xl text-primary">{data.stats.totalOrders}</div>
					<div class="stat-desc flex items-center gap-1">
						<TrendingUp size={14} />
						Semua transaksi Anda
					</div>
				</div>
			</div>

			<!-- Pending Orders -->
			<div
				class="stat-card stats border border-warning/20 bg-gradient-to-br from-warning/10 to-warning/5 shadow-xl"
			>
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
					<div class="stat-value text-4xl text-warning">{data.stats.pendingOrders}</div>
					<div class="stat-desc">Segera selesaikan pembayaran</div>
				</div>
			</div>

			<!-- Completed Orders -->
			<div
				class="stat-card stats border border-success/20 bg-gradient-to-br from-success/10 to-success/5 shadow-xl"
			>
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
					<div class="stat-value text-4xl text-success">{data.stats.completedOrders}</div>
					<div class="stat-desc">Transaksi berhasil 🎉</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Recent Orders -->
			<div class="lg:col-span-2">
				<div class="card border border-base-300 bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="card-title text-2xl">
								<Package size={24} class="text-primary" />
								Pesanan Terbaru
							</h2>
							{#if data.stats.totalOrders > 0}
								<a href="/my-orders" class="btn gap-1 btn-ghost btn-sm">
									Lihat Semua
									<ArrowRight size={16} />
								</a>
							{/if}
						</div>

						{#if data.recentOrders.length > 0}
							<div class="space-y-6">
								{#each data.recentOrders as order}
									<div
										class="group card overflow-hidden border border-base-200 bg-base-100 shadow-md transition-all duration-300 hover:shadow-xl"
									>
										<!-- Card Header -->
										<div
											class="flex flex-wrap items-center justify-between gap-4 border-b border-base-200 bg-base-200/50 px-6 py-4"
										>
											<div class="flex items-center gap-3">
												<div class="flex items-center gap-1 text-sm font-bold text-base-content/60">
													<ShoppingBag size={20} />
													Belanja
													<span class="font-medium">{formatDateSimple(order.created_at)}</span>
													<span class="badge {getStatusBadge(order.status)} gap-1 font-medium">
														{getStatusText(order.status)}</span
													>
													{order.order_id}
												</div>
											</div>
										</div>

										<div class="card-body p-6">
											<div class="flex flex-col gap-6 lg:flex-row">
												<!-- Items List -->
												<div class="flex-1 space-y-4">
													<div class="group/item flex gap-4">
														<div
															class="relative h-20 w-20 overflow-hidden rounded-xl border border-base-300 shadow-sm"
														>
															<img
																src={order.product[0].images?.[0] ||
																	'https://placehold.co/100x100?text=No+Image'}
																alt={order.product[0].name}
																class="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
															/>
														</div>

														<div class="flex-1">
															<div
																class="text-lg font-bold transition-colors group-hover/item:text-primary"
															>
																{order.product[0].name}
															</div>
															<div
																class="mt-1 flex items-center gap-2 text-sm text-base-content/70"
															>
																<span class="badge badge-ghost badge-sm"
																	>{order.product[0].quantity || 1} Item</span
																>
																<span>x {formatCurrency(order.product[0].price)}</span>
															</div>
															{#if order.product.length > 1}
																<div class="mt-2 text-sm font-medium text-base-content/60">
																	+{order.product.length - 1} produk lainnya
																</div>
															{/if}
														</div>
													</div>
												</div>

												<!-- Order Summary & Actions -->
												<div
													class="flex flex-col justify-between border-t border-base-200 pt-4 lg:w-64 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
												>
													<div>
														<!-- Payment Breakdown -->
														<div class="mb-4 space-y-2 text-sm">
															<div class="flex justify-between text-base-content/70">
																<span>Subtotal</span>
																<span>{formatCurrency(order.amount)}</span>
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
															{formatCurrency(order.total_payment || order.amount)}
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
													</div>

													<div class="mt-4 flex flex-col gap-2">
														<button
															class="btn w-full btn-outline btn-sm"
															onclick={() => openOrderDetail(order)}
														>
															Lihat Detail
														</button>
														{#if order.status === 'pending'}
															<a
																href="/payment/{order.order_id}"
																class="btn w-full shadow-md btn-sm btn-primary hover:shadow-lg"
															>
																Bayar Sekarang <ArrowRight size={16} />
															</a>
														{/if}
													</div>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="gradient-card flex flex-col items-center justify-center rounded-xl py-16">
								<div class="mb-4 rounded-full bg-primary/10 p-6">
									<Package size={64} class="text-primary" />
								</div>
								<p class="mb-2 text-xl font-semibold">Belum Ada Pesanan</p>
								<p class="mb-6 text-base-content/70">Mulai berbelanja sekarang!</p>
								<a href="/shop" class="btn gap-2 shadow-lg btn-lg btn-primary">
									<ShoppingBag size={20} />
									Mulai Belanja
								</a>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="space-y-6 lg:col-span-1">
				<div class="card border border-base-300 bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="mb-4 card-title text-xl">
							<Sparkles size={20} class="text-primary" />
							Aksi Cepat
						</h2>
						<div class="space-y-3">
							<a
								href="/shop"
								class="btn btn-block justify-start gap-2 shadow-md btn-primary hover:shadow-lg"
							>
								<ShoppingBag size={20} />
								Lanjutkan Belanja
							</a>
							<a
								href="/my-orders"
								class="btn btn-block justify-start gap-2 btn-outline hover:btn-primary"
							>
								<Package size={20} />
								Lihat Semua Pesanan
							</a>
							<a
								href="/profile"
								class="btn btn-block justify-start gap-2 btn-outline hover:btn-primary"
							>
								<User size={20} />
								Edit Profil
							</a>
						</div>
					</div>
				</div>

				<div
					class="card border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl"
				>
					<div class="card-body">
						<h3 class="flex items-center gap-2 text-lg font-bold">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clip-rule="evenodd"
								/>
							</svg>
							Butuh Bantuan?
						</h3>
						<p class="mb-3 text-sm text-base-content/80">
							Tim support kami siap membantu Anda 24/7
						</p>
						<a href="mailto:support@adverfi.id" class="btn btn-block gap-2 shadow-md btn-primary">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
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
	<Footer />
	{#if selectedOrder}
		<OrderDetailModal order={selectedOrder} isOpen={isModalOpen} onClose={closeModal} />
	{/if}
</div>
