<script lang="ts">
	import {
		Package,
		Clock,
		CircleCheck,
		CircleX,
		CircleAlert,
		Search,
		ShoppingBag,
		ReceiptText,
		ArrowRight,
		CreditCard
	} from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { getStatusBadge, getStatusText } from '$lib/utils/status.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import { formatInvoiceNumber } from '$lib/utils/invoice.utils';
	import { confirmAction } from '$lib/utils/swal.utils';
	import { toast } from '$lib/stores/toast.store';

	import type { Order } from '$lib/types/order.types';

	let { orders = [] as Order[], userId } = $props();

	let filter = $state('all');
	let searchQuery = $state('');
	let currentPage = $state(1);
	const itemsPerPage = 5;

	const filteredOrders = $derived(
		orders.filter((o) => {
			const matchesFilter = filter === 'all' || o.status === filter;
			const matchesSearch =
				o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				o.items.some((i) => i.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesFilter && matchesSearch;
		})
	);

	const totalPages = $derived(Math.ceil(filteredOrders.length / itemsPerPage));

	const paginatedOrders = $derived(
		filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	$effect(() => {
		filter;
		searchQuery;
		currentPage = 1;
	});

	const orderTabs = [
		{ id: 'all', label: 'Semua', icon: Package },
		{ id: 'pending', label: 'Menunggu', icon: Clock },
		{ id: 'completed', label: 'Selesai', icon: CircleCheck },
		{ id: 'failed', label: 'Gagal', icon: CircleAlert },
		{ id: 'cancelled', label: 'Dibatalkan', icon: CircleX }
	];

	let expandedOrders = $state<Record<string, boolean>>({});

	function toggleOrder(orderId: string) {
		expandedOrders[orderId] = !expandedOrders[orderId];
	}

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
				body: JSON.stringify({ order_id: orderId, user_id: userId })
			});

			const result = await res.json();

			if (res.ok) {
				toast.success('Pesanan berhasil dibatalkan');
				window.location.reload();
			} else {
				toast.error(result.error || 'Gagal membatalkan pesanan');
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

			const result = await res.json();

			if (res.ok) {
				if (result.status === 'expired') {
					toast.error('Transaksi telah kadaluarsa');
				} else if (result.status === 'completed') {
					toast.success('Pembayaran berhasil dikonfirmasi!');
				} else {
					toast.info('Status pesanan diperbarui: ' + getStatusText(result.status));
				}
				window.location.reload();
			} else {
				toast.error(result.error || 'Gagal mengecek status');
			}
		} catch (error) {
			console.error('Check status error:', error);
			toast.error('Terjadi kesalahan saat mengecek status');
		}
	}
</script>

<div class="space-y-6">
	<!-- Search and Filter -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="relative w-full md:w-64">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="h-5 w-5 text-base-content/60" />
			</div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari pesanan..."
				class="input-bordered input w-full pl-10"
			/>
		</div>

		<div class="no-scrollbar flex gap-2 overflow-x-auto pb-2 md:pb-0">
			{#each orderTabs as tab}
				<button
					class="btn btn-sm {filter === tab.id ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => (filter = tab.id)}
				>
					<tab.icon size={16} />
					{tab.label}
				</button>
			{/each}
		</div>
	</div>

	{#if filteredOrders.length === 0}
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
					class="btn shadow-lg transition-all btn-primary hover:-translate-y-1 hover:shadow-xl"
				>
					<span>🛍️</span>
					Belanja Sekarang
				</a>
			</div>
		</div>
	{:else}
		<div class="space-y-4">
			{#each paginatedOrders as order, i (order.order_id)}
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
								<div class="flex items-center gap-1 font-mono text-sm font-bold opacity-70">
									<ReceiptText size={12} />
									{formatInvoiceNumber(order.order_id)}
								</div>
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
							<div class="flex-1 space-y-3">
								{#each expandedOrders[order.order_id] ? order.items : order.items.slice(0, 3) as item}
									<div class="group/item flex gap-3">
										<div
											class="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-base-300 shadow-sm"
										>
											<img
												src={item.product?.images?.[0] ||
													'https://placehold.co/100x100?text=No+Image'}
												alt={item.product?.name || 'Product'}
												class="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
											/>
										</div>

										<div class="flex-1">
											<div
												class="text-sm font-bold transition-colors group-hover/item:text-primary"
											>
												{item.product?.name || 'Unknown Product'}
											</div>
											<div class="flex items-center gap-2 text-xs text-base-content/70">
												<span class="badge badge-ghost badge-xs"
													>{item.product?.quantity || 1} Item</span
												>
												<span>x {formatCurrency(item.product?.price || 0)}</span>
											</div>
											{#if item.note}
												<div
													class="mt-1 inline-block rounded border-l-2 border-primary bg-base-200/80 px-2 py-1 text-[10px]"
												>
													<span class="font-semibold opacity-70">Catatan:</span>
													{item.note}
												</div>
											{/if}
										</div>
									</div>
								{/each}

								{#if order.items.length > 3}
									<button
										class="btn w-full text-base-content/60 btn-ghost btn-xs hover:text-primary"
										onclick={() => toggleOrder(order.order_id)}
									>
										{expandedOrders[order.order_id]
											? 'Tampilkan lebih sedikit'
											: `Tampilkan ${order.items.length - 3} produk lainnya`}
									</button>
								{/if}
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
											<span><CreditCard /></span>
											<span class="font-semibold">{formatPaymentMethod(order.payment_method)}</span>
										</div>
									{/if}

									<!-- {#if order.status === 'completed' && order.completed_at}
										<div class="mb-4 flex items-center gap-1 text-xs text-success">
											<CheckCircle size={12} />
											Dibayar: {formatDate(order.completed_at)}
										</div>
									{/if} -->
								</div>

								<div class="mt-4 flex flex-col gap-2">
									{#if order.status === 'pending'}
										{#if !order.expired_at || new Date(order.expired_at) > new Date()}
											<a
												href="/payment/{order.order_id}"
												class="btn w-full shadow-md transition-transform btn-primary group-hover:scale-[1.02] hover:shadow-lg"
											>
												Bayar Sekarang <ArrowRight size={16} />
											</a>
										{/if}
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

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-8 flex justify-center">
				<div class="join">
					<button
						class="btn join-item"
						disabled={currentPage === 1}
						onclick={() => (currentPage -= 1)}
					>
						«
					</button>
					<button class="btn pointer-events-none join-item">
						Page {currentPage} of {totalPages}
					</button>
					<button
						class="btn join-item"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage += 1)}
					>
						»
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
