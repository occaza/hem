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
		CreditCard,
		Copy,
		Key,
		Loader
	} from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { getStatusBadge } from '$lib/utils/status.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import { formatInvoiceNumber } from '$lib/utils/invoice.utils';
	import { confirmAction } from '$lib/utils/swal.utils';
	import { toast } from '$lib/stores/toast.store';
	import { t, locale } from 'svelte-i18n';
	import { getLocalizedText } from '$lib/utils/localization.utils';

	import type { Order } from '$lib/types/order.types';

	let { orders = [] as Order[], userId } = $props();

	let filter = $state('all');
	let searchQuery = $state('');
	let currentPage = $state(1);
	const itemsPerPage = 5;

	const filteredOrders = $derived(
		orders.filter((o) => {
			// Status mapping for filter compatibility if needed
			const matchesFilter = filter === 'all' || o.status === filter;

			const matchesSearch =
				o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				o.items.some((i) =>
					getLocalizedText(i.product?.name, $locale)
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				);
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

	// Updated Tabs with missing statuses
	const orderTabs = [
		{ id: 'all', label: 'common.status.all', icon: Package },
		{ id: 'pending', label: 'common.status.pending', icon: Clock },
		{ id: 'processing', label: 'common.status.processing', icon: Loader },
		{ id: 'completed', label: 'common.status.completed', icon: CircleCheck },
		{ id: 'failed', label: 'common.status.failed', icon: CircleAlert },
		{ id: 'expired', label: 'common.status.expired', icon: CircleX },
		{ id: 'cancelled', label: 'common.status.cancelled', icon: CircleX }
	];

	let expandedOrders = $state<Record<string, boolean>>({});

	function toggleOrder(orderId: string) {
		expandedOrders[orderId] = !expandedOrders[orderId];
	}

	let selectedFulfillments = $state<any[] | null>(null);
	let fulfillmentModal: HTMLDialogElement;

	function showFulfillments(fulfillments: any[]) {
		selectedFulfillments = fulfillments;
		fulfillmentModal?.showModal();
	}

	async function handleCancelOrder(orderId: string) {
		const confirmed = await confirmAction(
			$t('account.order_list.cancel_confirm_msg') ||
				'Apakah Anda yakin ingin membatalkan pesanan ini?',
			$t('account.order_list.cancel_confirm_title') || 'Batalkan Pesanan?'
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
				toast.success($t('common.success'));
				window.location.reload();
			} else {
				toast.error(result.error || $t('common.error'));
			}
		} catch (error) {
			console.error('Cancel error:', error);
			toast.error($t('common.error'));
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
					toast.error($t('payment.failed'));
				} else if (result.status === 'completed') {
					toast.success($t('payment.success'));
				} else {
					toast.info($t('common.status.' + result.status));
				}
				window.location.reload();
			} else {
				toast.error(result.error || $t('common.error'));
			}
		} catch (error) {
			console.error('Check status error:', error);
			toast.error($t('common.error'));
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast.success($t('account.order_list.copy_success'));
			})
			.catch(() => {
				toast.error($t('account.order_list.copy_fail'));
			});
	}
</script>

<div class="space-y-6">
	<!-- Search and Filter (Stacked) -->
	<div class="flex flex-col gap-6">
		<!-- Search -->
		<div class="relative w-full">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="h-5 w-5 text-base-content/60" />
			</div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={$t('account.order_list.search_placeholder')}
				class="input-bordered input w-full pl-10"
			/>
		</div>

		<!-- Filter -->
		<div class="w-full">
			<!-- Desktop Filter (Tabs, flex-wrap for safety) -->
			<div class="hidden flex-wrap gap-2 md:flex">
				{#each orderTabs as tab}
					<button
						class="btn text-nowrap btn-sm {filter === tab.id ? 'btn-primary' : 'btn-ghost'}"
						onclick={() => (filter = tab.id)}
					>
						<tab.icon size={16} />
						{$t(tab.label)}
					</button>
				{/each}
			</div>

			<!-- Mobile Filter (Select) -->
			<div class="md:hidden">
				<select class="select-bordered select w-full" bind:value={filter}>
					{#each orderTabs as tab}
						<option value={tab.id}>{$t(tab.label)}</option>
					{/each}
				</select>
			</div>
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
						? $t('account.order_list.empty_search', { values: { query: searchQuery } })
						: filter === 'all'
							? $t('account.order_list.empty')
							: $t('account.order_list.empty_filter', {
									values: { filter: $t('common.status.' + filter) }
								})}
				</h2>
				<p class="mb-8 max-w-md text-base-content/60">
					{searchQuery ? '' : $t('hero.subtitle')}
				</p>
				<a
					href="/shop"
					class="btn shadow-lg transition-all btn-primary hover:-translate-y-1 hover:shadow-xl"
				>
					<span>🛍️</span>
					{$t('account.order_list.explore_btn')}
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
								{$t('common.status.' + order.status)}
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
												alt={getLocalizedText(item.product?.name, $locale) || 'Product'}
												class="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
											/>
										</div>

										<div class="flex-1">
											<div
												class="text-sm font-bold transition-colors group-hover/item:text-primary"
											>
												{getLocalizedText(item.product?.name, $locale) || 'Unknown Product'}
											</div>
											<div class="flex items-center gap-2 text-xs text-base-content/70">
												<span class="badge badge-ghost badge-xs"
													>{item.product?.quantity || 1} {$t('cart.item')}</span
												>
												<span>x {formatCurrency(item.product?.price || 0)}</span>
											</div>
											{#if item.note}
												<div
													class="mt-1 inline-block rounded border-l-2 border-primary bg-base-200/80 px-2 py-1 text-[10px]"
												>
													<span class="font-semibold opacity-70"
														>{$t('account.order_list.note')}</span
													>
													{item.note}
												</div>
											{/if}

											<!-- Fulfillment Data (Button) -->
											{#if item.fulfillments && item.fulfillments.length > 0}
												<div class="mt-2">
													<button
														class="btn gap-2 btn-outline btn-xs btn-success"
														onclick={() => showFulfillments(item.fulfillments || [])}
													>
														<Key size={12} />
														{$t('account.order_list.view_credentials')}
													</button>
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
											? $t('account.order_list.show_less')
											: $t('account.order_list.items_more', {
													values: { count: order.items.length - 3 }
												})}
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
											<span>{$t('account.order_list.subtotal')}</span>
											<span>{formatCurrency(order.total)}</span>
										</div>
										{#if order.fee}
											<div class="flex justify-between text-base-content/70">
												<span>{$t('account.order_list.admin_fee')}</span>
												<span>{formatCurrency(order.fee)}</span>
											</div>
										{/if}
										<div class="divider my-2"></div>
									</div>

									<div class="mb-1 text-sm text-base-content/60">
										{$t('account.order_list.total_payment')}
									</div>
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
								</div>

								<div class="mt-4 flex flex-col gap-2">
									{#if order.status === 'pending'}
										{#if !order.expired_at || new Date(order.expired_at) > new Date()}
											<a
												href="/payment/{order.order_id}"
												class="btn w-full shadow-md transition-transform btn-primary group-hover:scale-[1.02] hover:shadow-lg"
											>
												{$t('account.order_list.pay_now')}
												<ArrowRight size={16} />
											</a>
										{/if}
										<div class="grid grid-cols-2 gap-2">
											<button
												class="btn w-full btn-outline btn-sm"
												onclick={() => handleCheckStatus(order.order_id)}
											>
												{$t('account.order_list.check_status')}
											</button>
											<button
												class="btn w-full btn-outline btn-sm btn-error"
												onclick={() => handleCancelOrder(order.order_id)}
											>
												{$t('account.order_list.cancel')}
											</button>
										</div>
									{:else if order.status === 'completed'}
										<a href="/shop" class="btn w-full btn-outline btn-sm">
											{$t('account.order_list.buy_again')}
										</a>
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

<!-- Fulfillment Modal -->
<dialog bind:this={fulfillmentModal} class="modal">
	<div class="modal-box">
		<form method="dialog">
			<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
		</form>
		<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
			<Key class="text-success" />
			{$t('account.order_list.credentials_modal')}
		</h3>

		{#if selectedFulfillments}
			<div class="space-y-4">
				{#each selectedFulfillments as fulfillment}
					<div class="bg-base-50 rounded-lg border border-base-200 p-4">
						{#if fulfillment.type === 'text'}
							<div class="space-y-2">
								<div class="text-xs font-semibold tracking-wide uppercase opacity-70"></div>
								<div class="group/copy relative">
									<div
										class="custom-scrollbar max-h-60 overflow-y-auto rounded-md bg-base-200 p-3 font-mono text-sm break-all whitespace-pre-wrap"
									>
										{fulfillment.content}
									</div>
									<button
										class="btn absolute top-1 right-4 btn-square btn-ghost btn-sm"
										title={$t('shop.share')}
										onclick={() => copyToClipboard(fulfillment.content)}
									>
										<Copy size={16} />
									</button>
								</div>
							</div>
						{:else if fulfillment.type === 'image' || fulfillment.type === 'file'}
							<a
								href={fulfillment.content}
								target="_blank"
								class="btn w-full gap-2 btn-sm btn-primary"
							>
								<span>📂</span>
								{$t('account.order_list.open_file')}
							</a>
						{/if}
						<div class="mt-2 text-right text-xs text-base-content/40">
							{$t('account.order_list.sent_at')}
							{formatDate(fulfillment.created_at)}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<div class="modal-action">
			<form method="dialog">
				<button class="btn">{$t('account.order_list.close')}</button>
			</form>
		</div>
	</div>
</dialog>
