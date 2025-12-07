<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import { toast } from '$lib/stores/toast.store';
	import { confirmAction } from '$lib/utils/swal.utils';
	import { RotateCw, UserRound, Send, Trash2, Pencil, X } from '@lucide/svelte';
	import { locale } from 'svelte-i18n';
	import { getLocalizedText } from '$lib/utils/localization.utils';

	let { data } = $props();

	let orders = $derived(data.orders);
	let pagination = $derived(data.pagination);
	let completing = $state<string | null>(null);
	let notificationSound: HTMLAudioElement;
	let previousOrderCount = $state(0);
	let expandedOrders = $state(new Set<string>());
	let fulfillmentForms = $state<Record<string, string>>({});
	let sendingFulfillment = $state<string | null>(null);
	let editingFulfillment = $state<{
		id: string;
		orderId: string;
		itemIndex: number; // to target specific form
	} | null>(null);

	function toggleExpand(orderId: string) {
		const newSet = new Set(expandedOrders);
		if (newSet.has(orderId)) {
			newSet.delete(orderId);
		} else {
			newSet.add(orderId);
		}
		expandedOrders = newSet;
	}

	onMount(() => {
		// Setup notification sound
		notificationSound = new Audio('/notification_3.wav');

		// Set initial count
		previousOrderCount = orders.length;

		// Auto refresh setiap 10 detik
		const interval = setInterval(async () => {
			await invalidate('app:orders-processing');
		}, 10000);

		// Request notification permission
		if (Notification.permission === 'default') {
			Notification.requestPermission();
		}

		return () => clearInterval(interval);
	});

	// Deteksi order baru dengan effect
	$effect(() => {
		if (orders.length > previousOrderCount) {
			// Ada order baru
			const newOrdersCount = orders.length - previousOrderCount;

			// Play sound
			if (notificationSound) {
				notificationSound.play().catch((e) => console.log('Sound play failed:', e));
			}

			// Browser notification
			if (Notification.permission === 'granted') {
				new Notification('Order Baru!', {
					body: `Ada ${newOrdersCount} pesanan baru yang perlu diproses`,
					icon: '/favicon.svg'
				});
			}
		}

		// Update previous count
		previousOrderCount = orders.length;
	});

	async function loadOrders() {
		await invalidate('app:orders-processing');
	}

	async function completeOrder(orderId: string) {
		const confirmed = await confirmAction(
			'Tandai pesanan ini sebagai selesai?',
			'Konfirmasi Penyelesaian'
		);
		if (!confirmed) return;

		completing = orderId;
		try {
			const res = await fetch(`/api/admin/orders/${orderId}/complete`, {
				method: 'POST'
			});

			const data = await res.json();

			if (res.ok) {
				toast.success('Pesanan berhasil diselesaikan');
				await loadOrders();
			} else {
				toast.error(data.error || 'Gagal menyelesaikan pesanan');
			}
		} catch (error) {
			console.error('Complete order error:', error);
			toast.error('Terjadi kesalahan');
		} finally {
			completing = null;
		}
	}

	async function sendFulfillment(orderId: string, itemId: string, itemIndex: number) {
		const formKey = `${orderId}-${itemIndex}`;
		const content = fulfillmentForms[formKey];

		if (!content || !content.trim()) {
			toast.error('Isi data fulfillment terlebih dahulu');
			return;
		}

		// Check mode: Edit or Create
		const isEditing =
			editingFulfillment?.orderId === orderId && editingFulfillment.itemIndex === itemIndex;

		if (!isEditing) {
			// Check for existing fulfillments (only for new sends)
			const order = orders.find((o) => o.order_id === orderId);
			const item = order?.items.find((i: any) => i.product_id === itemId);

			if (item && item.fulfillments && item.fulfillments.length > 0) {
				const confirmed = await confirmAction(
					'Item ini sudah pernah dikirim data sebelumnya. Yakin ingin mengirim lagi?',
					'Kirim Ulang?'
				);
				if (!confirmed) return;
			}
		}

		sendingFulfillment = formKey;
		try {
			let res;
			if (isEditing) {
				// UPDATE existing
				res = await fetch('/api/admin/fulfillment', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: editingFulfillment!.id,
						content: content.trim()
					})
				});
			} else {
				// CREATE new
				res = await fetch('/api/admin/fulfillment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						transaction_id: orderId,
						product_id: itemId,
						type: 'text',
						content: content.trim()
					})
				});
			}

			const data = await res.json();

			if (res.ok) {
				toast.success(isEditing ? 'Fulfillment diupdate' : 'Fulfillment berhasil dikirim');
				fulfillmentForms[formKey] = '';
				editingFulfillment = null; // Exit edit mode
				await loadOrders();
			} else {
				toast.error(data.error || 'Gagal mengirim data');
			}
		} catch (error) {
			console.error('Send fulfillment error:', error);
			toast.error('Terjadi kesalahan');
		} finally {
			sendingFulfillment = null;
		}
	}

	function startEdit(
		orderId: string,
		itemIndex: number,
		fulfillment: { id: string; content: string }
	) {
		const formKey = `${orderId}-${itemIndex}`;
		fulfillmentForms[formKey] = fulfillment.content;
		editingFulfillment = { id: fulfillment.id, orderId, itemIndex };
		const textarea = document.getElementById(`textarea-${formKey}`);
		if (textarea) textarea.focus();
	}

	function cancelEdit(orderId: string, itemIndex: number) {
		const formKey = `${orderId}-${itemIndex}`;
		fulfillmentForms[formKey] = '';
		editingFulfillment = null;
	}

	async function deleteFulfillment(fulfillmentId: string) {
		const confirmed = await confirmAction(
			'Hapus item fulfillment draft ini? Pembeli belum melihatnya.',
			'Hapus Item?'
		);
		if (!confirmed) return;

		try {
			const res = await fetch(`/api/admin/fulfillment?id=${fulfillmentId}`, {
				method: 'DELETE'
			});

			const data = await res.json();

			if (res.ok) {
				toast.success('Fulfillment dihapus');
				await loadOrders();
			} else {
				toast.error(data.error || 'Gagal menghapus');
			}
		} catch (error) {
			console.error('Delete fulfillment error:', error);
			toast.error('Terjadi kesalahan');
		}
	}

	async function toggleFileUpload(orderId: string, itemId: string, itemIndex: number) {
		toast.info('Fitur upload file akan segera hadir! Saat ini dukung input text/link dulu ya.');
	}
</script>

<div>
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Pesanan Diproses</h1>
			<p class="text-base-content/70">
				{orders.length} pesanan menunggu konfirmasi
			</p>
		</div>
		<button class="btn btn-ghost" onclick={loadOrders}>
			<RotateCw />
			Refresh
		</button>
	</div>

	{#if orders.length === 0}
		<div class="rounded-xl border border-base-200 bg-base-100 py-16 text-center shadow-sm">
			<div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-base-200">
				<span class="text-4xl">📦</span>
			</div>
			<h2 class="mb-2 text-xl font-bold">Tidak Ada Pesanan</h2>
			<p class="text-base-content/60">Semua pesanan sudah diproses</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			{#each orders as order}
				<div
					class="card border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md"
				>
					<div class="card-body p-5">
						<!-- Header -->
						<div class="mb-4 flex items-start justify-between">
							<div>
								<div class="mb-1 flex items-center gap-1">
									<span class="font-mono text-lg font-bold"
										>#{order.order_id.replace(/-/g, '/')}</span
									>
								</div>
								<div
									class="mb-0.5 flex items-center gap-2 text-sm font-medium text-base-content/80"
								>
									<UserRound size={14} />
									{order.buyer?.username || order.buyer?.email || 'User'}
								</div>
								<div class="text-xs text-base-content/60">
									{formatDate(order.processing_started_at)}
								</div>
							</div>
							<span class="badge animate-pulse badge-sm font-semibold badge-warning">PROSES</span>
						</div>

						<!-- Items -->
						<div class="mb-4 space-y-4">
							{#each order.items as item, i}
								{#if i === 0 || expandedOrders.has(order.order_id)}
									<div class="flex gap-3">
										<div
											class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-base-200"
										>
											<img
												src={item.product.images?.[0] || 'https://placehold.co/100'}
												alt={getLocalizedText(item.product.name, $locale)}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="min-w-0 flex-1">
											<div
												class="line-clamp-1 text-sm font-medium"
												title={getLocalizedText(item.product.name, $locale)}
											>
												{getLocalizedText(item.product.name, $locale)}
											</div>
											<div class="text-xs text-base-content/60">
												{formatCurrency(item.amount)}
											</div>
										</div>
									</div>

									<!-- Fulfillment History -->
									{#if item.fulfillments && item.fulfillments.length > 0}
										<div class="mt-2 space-y-1">
											{#each item.fulfillments as f}
												<div
													class="flex items-center justify-between rounded bg-base-200 px-2 py-1 text-[10px] text-base-content/70"
												>
													<div class="max-w-[150px] truncate font-mono">
														{f.type === 'text' ? f.content : 'File/Image Sent'}
													</div>
													<div class="flex items-center gap-1 opacity-50">
														<span>{formatDate(f.created_at)}</span>
														<span class="text-success">✓</span>
														<button
															class="btn h-auto min-h-0 p-0 text-warning btn-ghost btn-xs"
															title="Edit Draft"
															onclick={() => startEdit(order.order_id, i, f)}
														>
															<Pencil size={12} />
														</button>
														<button
															class="btn h-auto min-h-0 p-0 text-error btn-ghost btn-xs"
															title="Hapus Draft"
															onclick={() => deleteFulfillment(f.id)}
														>
															<Trash2 size={12} />
														</button>
													</div>
												</div>
											{/each}
										</div>
									{/if}

									<!-- Fulfillment Form -->
									{#if (!item.fulfillments || item.fulfillments.length === 0) || (editingFulfillment?.orderId === order.order_id && editingFulfillment?.itemIndex === i)}
										<div class="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
											<div class="mb-2 flex items-center justify-between">
												<div class="text-xs font-semibold tracking-wide text-primary uppercase">
													{#if editingFulfillment?.orderId === order.order_id && editingFulfillment?.itemIndex === i}
														✏️ Edit Mode
													{:else}
														📤 Kirim Pesanan
													{/if}
												</div>
												<div class="flex gap-1">
													<button
														class="btn btn-square text-primary btn-ghost btn-xs"
														title="Upload File"
														onclick={() => toggleFileUpload(order.order_id, item.product_id, i)}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="14"
															height="14"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
															><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
																points="17 8 12 3 7 8"
															/><line x1="12" x2="12" y1="3" y2="15" /></svg
														>
													</button>
												</div>
											</div>
											<textarea
												id={`textarea-${order.order_id}-${i}`}
												class="textarea-bordered textarea mb-2 w-full font-mono text-xs textarea-sm {editingFulfillment?.orderId ===
													order.order_id && editingFulfillment?.itemIndex === i
													? 'textarea-warning'
													: ''}"
												placeholder="username|password (satu per baris jika banyak)"
												rows="3"
												bind:value={fulfillmentForms[`${order.order_id}-${i}`]}
											></textarea>
											<button
												class="btn w-full gap-2 btn-sm btn-primary"
												onclick={() => sendFulfillment(order.order_id, item.product_id, i)}
												disabled={sendingFulfillment === `${order.order_id}-${i}`}
											>
												{#if sendingFulfillment === `${order.order_id}-${i}`}
													<span class="loading loading-xs loading-spinner"></span>
													Processing...
												{:else if editingFulfillment?.orderId === order.order_id && editingFulfillment?.itemIndex === i}
													<Pencil size={14} />
													Simpan Perubahan
												{:else}
													<Send size={14} />
													Kirim
												{/if}
											</button>
											{#if editingFulfillment?.orderId === order.order_id && editingFulfillment?.itemIndex === i}
												<button
													class="btn mt-2 w-full text-error btn-ghost btn-xs"
													onclick={() => cancelEdit(order.order_id, i)}
												>
													<X size={14} /> Batal Edit
												</button>
											{/if}
										</div>
									{/if}

									{#if item.note}
										<div class="rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm">
											<div
												class="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-warning uppercase"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													><path
														d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
													/><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path
														d="M10 9H8"
													/></svg
												>
												Catatan Pembeli
											</div>
											<p class="text-base-content/80 italic">"{item.note}"</p>
										</div>
									{/if}
								{/if}
							{/each}

							{#if order.items.length > 1}
								<button
									class="btn w-full gap-1 text-base-content/60 btn-ghost btn-xs hover:text-primary"
									onclick={() => toggleExpand(order.order_id)}
								>
									{#if expandedOrders.has(order.order_id)}
										Tutup
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"><path d="m18 15-6-6-6 6" /></svg
										>
									{:else}
										Lihat {order.items.length - 1} item lainnya
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg
										>
									{/if}
								</button>
							{/if}
						</div>

						<div class="divider my-2"></div>

						<!-- Footer Info -->
						<div class="mb-4 flex items-center justify-between">
							<div class="flex flex-col text-xs">
								<span class="opacity-60">Metode</span>
								<span class="font-medium">{formatPaymentMethod(order.payment_method)}</span>
							</div>
							<div class="flex flex-col text-right">
								<span class="text-xs opacity-60">Total</span>
								<span class="text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
							</div>
						</div>

						<!-- Actions -->
						<button
							class="btn btn-block btn-primary"
							onclick={() => completeOrder(order.order_id)}
							disabled={completing === order.order_id}
						>
							{#if completing === order.order_id}
								<span class="loading loading-xs loading-spinner"></span>
							{:else}
								Selesaikan Order
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Smart Pagination -->
		{#if pagination && pagination.totalPages > 1}
			<div class="mt-8 flex justify-center">
				<div class="join">
					<button
						class="btn join-item"
						disabled={pagination.page === 1}
						onclick={() => (window.location.href = `?page=${pagination.page - 1}`)}
					>
						«
					</button>

					{#each Array(pagination.totalPages) as _, i}
						{#if i + 1 === pagination.page}
							<button class="btn btn-active join-item">{i + 1}</button>
						{:else if i + 1 === 1 || i + 1 === pagination.totalPages || Math.abs(pagination.page - (i + 1)) <= 1}
							<button
								class="btn join-item"
								onclick={() => (window.location.href = `?page=${i + 1}`)}
							>
								{i + 1}
							</button>
						{:else if Math.abs(pagination.page - (i + 1)) === 2}
							<button class="btn btn-disabled join-item">...</button>
						{/if}
					{/each}

					<button
						class="btn join-item"
						disabled={pagination.page === pagination.totalPages}
						onclick={() => (window.location.href = `?page=${pagination.page + 1}`)}
					>
						»
					</button>
				</div>
			</div>

			<div class="mt-2 text-center text-xs text-base-content/50">
				Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
			</div>
		{/if}
	{/if}
</div>
