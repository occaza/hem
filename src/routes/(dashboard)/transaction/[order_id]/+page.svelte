<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { getStatusBadge, getStatusText } from '$lib/utils/status.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import { User, Mail, Phone, Calendar, Clock, CheckCircle2, ArrowLeft, Receipt } from '@lucide/svelte';
	import { locale } from 'svelte-i18n';
	import { getLocalizedText } from '$lib/utils/localization.utils';
	import type { LocalizedString } from '$lib/types/types';

	type ProductInfo = {
		name: string | LocalizedString;
		description: string | LocalizedString;
		price: number;
		images?: string[];
	};

	type TransactionItem = {
		product: ProductInfo;
		amount: number;
		note?: string;
	};

	type BuyerInfo = {
		name: string;
		email: string | null;
		phone: string | null;
	};

	type TransactionDetail = {
		order_id: string;
		total_amount: number;
		status: string;
		payment_method?: string;
		completed_at?: string;
		created_at?: string;
		processing_started_at?: string;
		buyer: BuyerInfo;
		items: TransactionItem[];
	};

	let transaction = $state<TransactionDetail | null>(null);
	let loading = $state(true);
	let error = $state('');

	const orderId = $derived($page.params.order_id);

	onMount(async () => {
		try {
			const res = await fetch(`/api/admin/transactions/${orderId}`);
			if (res.ok) {
				transaction = await res.json();
			} else {
				error = 'Transaksi tidak ditemukan';
			}
		} catch (err) {
			error = 'Gagal memuat transaksi';
		} finally {
			loading = false;
		}
	});

	function getTimelineStepClass(stepStatus: string, currentStatus: string) {
		const statusOrder = ['pending', 'processing', 'completed'];
		const currentIdx = statusOrder.indexOf(currentStatus);
		const stepIdx = statusOrder.indexOf(stepStatus);

		if (currentStatus === 'cancelled' || currentStatus === 'expired') {
			return stepIdx === 0 ? 'step-primary' : 'step-neutral';
		}

		return stepIdx <= currentIdx ? 'step-primary' : '';
	}
</script>

<div class="mx-auto max-w-6xl pb-10">
	<!-- Header / Breadcrumb -->
	<div class="mb-6 flex items-center gap-4">
		<a href="/transaction" class="btn btn-circle btn-ghost btn-sm">
			<ArrowLeft size={20} />
		</a>
		<div>
			<h1 class="text-2xl font-bold">Detail Transaksi</h1>
			<div class="breadcrumbs text-sm text-base-content/70">
				<ul>
					<li><a href="/dashboard">Dashboard</a></li>
					<li><a href="/transaction">Transaksi</a></li>
					<li>#{orderId}</li>
				</ul>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex h-64 items-center justify-center rounded-2xl bg-base-100 shadow-sm">
			<span class="loading loading-lg loading-spinner text-primary"></span>
		</div>
	{:else if error}
		<div class="alert alert-error shadow-sm">
			<span>{error}</span>
		</div>
	{:else if transaction}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Left Column: Main Info (2 span) -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Order Header Card -->
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
							<div>
								<div class="text-xs uppercase tracking-wider text-base-content/60">Order ID</div>
								<div class="flex items-center gap-2 font-mono text-xl font-bold">
									#{transaction.order_id}
									<button
										class="btn btn-ghost btn-xs"
										title="Copy ID"
										onclick={() => {
											navigator.clipboard.writeText(transaction!.order_id);
											// Optional: toast
										}}>📋</button
									>
								</div>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="badge badge-lg {getStatusBadge(transaction.status)} uppercase font-bold tracking-wide">
									{getStatusText(transaction.status)}
								</span>
								<div class="flex items-center gap-1 text-xs text-base-content/60">
									<Calendar size={12} />
									{formatDate(transaction.created_at)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Products List -->
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body p-0">
						<div class="flex items-center gap-2 border-b border-base-200 bg-base-200/50 px-6 py-4">
							<Receipt size={18} class="text-base-content/70" />
							<h3 class="font-bold">Rincian Produk</h3>
						</div>
						
						<div class="divide-y divide-base-200">
							{#each transaction.items as item}
								{#if item.product}
									<div class="p-6">
										<div class="flex gap-4">
											<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-base-200 bg-base-200">
												<img
													src={item.product.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
													alt={getLocalizedText(item.product.name, $locale)}
													class="h-full w-full object-cover"
												/>
											</div>
											<div class="flex-1">
												<div class="flex justify-between items-start">
													<div>
														<div class="font-bold text-lg">{getLocalizedText(item.product.name, $locale)}</div>
														<div class="text-sm text-base-content/70 line-clamp-2">
															{getLocalizedText(item.product.description, $locale)}
														</div>
													</div>
													<div class="text-right">
														<div class="font-bold text-lg">{formatCurrency(item.amount)}</div>
														<div class="text-xs text-base-content/50">x1</div>
													</div>
												</div>
												
												{#if item.note}
													<div class="mt-3 relative">
														<div class="absolute -left-3 top-0 bottom-0 w-1 bg-warning/50 rounded-full"></div>
														<div class="p-3 bg-warning/10 rounded-lg text-sm">
															<span class="text-xs font-bold text-warning uppercase block mb-1">Catatan Pembeli</span>
															<span class="italic text-base-content/80">"{item.note}"</span>
														</div>
													</div>
												{/if}
											</div>
										</div>
									</div>
								{/if}
							{/each}
						</div>

						<!-- Payment Summary -->
						<div class="bg-base-200/30 px-6 py-6 border-t border-base-200">
							<div class="flex flex-col gap-2">
								<div class="flex justify-between text-base-content/70">
									<span>Subtotal</span>
									<span>{formatCurrency(transaction.total_amount)}</span>
								</div>
								<!-- Jika ada handling fee atau diskon, tambahkan di sini -->
								<div class="divider my-1"></div>
								<div class="flex justify-between items-center text-lg">
									<span class="font-bold">Total Pembayaran</span>
									<span class="font-bold text-primary text-xl">{formatCurrency(transaction.total_amount)}</span>
								</div>
								<div class="mt-2 flex justify-end">
									<div class="badge badge-outline gap-2 py-3 px-4">
										<span class="text-xs opacity-70">Metode:</span>
										<span class="font-semibold">{formatPaymentMethod(transaction.payment_method)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Sidebar (1 span) -->
			<div class="space-y-6">
				<!-- Buyer Info Card -->
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h3 class="card-title text-base flex items-center gap-2 mb-2">
							<User size={18} class="text-primary" />
							Informasi Pembeli
						</h3>
						<div class="space-y-4">
							<div>
								<div class="text-xs text-base-content/60 mb-0.5">Nama Akun</div>
								<div class="font-semibold">{transaction.buyer.name}</div>
							</div>
							
							<div class="divider my-0"></div>

							<div class="flex items-center gap-3">
								<div class="h-8 w-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/60">
									<Mail size={16} />
								</div>
								<div class="overflow-hidden">
									<div class="text-xs text-base-content/60">Email</div>
									<div class="font-medium truncate text-sm" title={transaction.buyer.email || '-'}>
										{transaction.buyer.email || '-'}
									</div>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="h-8 w-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/60">
									<Phone size={16} />
								</div>
								<div>
									<div class="text-xs text-base-content/60">Nomor HP</div>
									<div class="font-medium text-sm">{transaction.buyer.phone || '-'}</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Timeline Card -->
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h3 class="card-title text-base flex items-center gap-2 mb-4">
							<Clock size={18} class="text-primary" />
							Riwayat Status
						</h3>
						
						{#if transaction.status === 'cancelled'}
							<div class="alert alert-error text-sm">
								<span>Transaksi ini telah dibatalkan.</span>
							</div>
						{:else if transaction.status === 'expired'}
							<div class="alert alert-warning text-sm">
								<span>Transaksi ini telah kadaluarsa.</span>
							</div>
						{:else}
							<ul class="steps steps-vertical w-full text-sm">
								<li class="step step-primary" data-content="✓">
									<div class="flex flex-col items-start text-left w-full pl-2 pb-4">
										<span class="font-semibold">Menunggu Pembayaran</span>
										<span class="text-xs text-base-content/60">{formatDate(transaction.created_at)}</span>
									</div>
								</li>
								<li class="step {getTimelineStepClass('processing', transaction.status)}" data-content={transaction.status === 'processing' || transaction.status === 'completed' ? '✓' : '●'}>
									<div class="flex flex-col items-start text-left w-full pl-2 pb-4">
										<span class="font-semibold">Diproses</span>
										{#if transaction.processing_started_at}
											<span class="text-xs text-base-content/60">{formatDate(transaction.processing_started_at)}</span>
										{:else}
											<span class="text-xs text-base-content/40">Menunggu sistem/admin</span>
										{/if}
									</div>
								</li>
								<li class="step {getTimelineStepClass('completed', transaction.status)}" data-content={transaction.status === 'completed' ? '✓' : '●'}>
									<div class="flex flex-col items-start text-left w-full pl-2">
										<span class="font-semibold">Selesai</span>
										{#if transaction.completed_at}
											<span class="text-xs text-base-content/60">{formatDate(transaction.completed_at)}</span>
										{:else}
											<span class="text-xs text-base-content/40">Menunggu konfirmasi admin</span>
										{/if}
									</div>
								</li>
							</ul>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
