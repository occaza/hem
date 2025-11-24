<script lang="ts">
	import { X, Package, CheckCircle } from '@lucide/svelte';
	import { formatCurrency, formatDate } from '$lib/utils/format.utils';
	import { getStatusBadge, getStatusText } from '$lib/utils/status.utils';
	import { formatPaymentMethod } from '$lib/utils/payment.utils';
	import { ChevronDown } from '@lucide/svelte';

	import { slide, fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	interface Props {
		order: any;
		isOpen: boolean;
		onClose: () => void;
	}

	let { order, isOpen, onClose }: Props = $props();

	const products = $derived(order?.product || []);
	const totalItems = $derived(products.length);

	let expanded = $state(false);
</script>

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onclick={onClose}
		role="button"
		tabindex="0"
		aria-label="Close modal"
		transition:fade={{ duration: 200 }}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClose();
			}
		}}
	>
		<!-- Modal Content -->
		<div
			class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-base-100 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="0"
			transition:scale={{ duration: 300, start: 0.95, easing: quintOut }}
			onkeydown={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-base-200 bg-base-100 px-6 py-4">
				<h2 class="text-xl font-bold">Detail Transaksi</h2>
				<button onclick={onClose} class="btn btn-circle btn-ghost btn-sm" aria-label="Close">
					<X size={24} />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto">
				<div class="flex h-full flex-col lg:flex-row">
					<!-- Left Column: Details -->
					<div class="flex-1 space-y-4 border-r border-base-200 p-6">
						<!-- Status Section -->
						<section class="rounded-lg border border-base-300 p-4">
							<div class="mb-3">
								<h3 class="text-base font-bold">Pesanan {getStatusText(order.status)}</h3>
							</div>

							<div class="grid grid-cols-2 gap-y-2 text-sm">
								<div class="text-left text-base-content/60">No. Pesanan</div>
								<div class="text-right font-bold text-success">{order.order_id}</div>
								<div class="text-left text-base-content/60">Tanggal Pembelian</div>
								<div class="text-right">{formatDate(order.created_at)}</div>
							</div>
						</section>

						<div class="divider my-0"></div>

						<!-- Product Details Section -->
						<section>
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-lg font-bold">Detail Produk</h3>
								<div class="flex items-center gap-1 text-sm font-semibold">
									<span>AdverFI Store</span>
								</div>
							</div>

							<div class="space-y-4">
								{#if totalItems > 0}
									<!-- Tampilkan selalu item pertama -->
									{#each products.slice(0, 1) as product}
										<div class="flex flex-col gap-4 border-b border-base-100 pb-4 sm:flex-row">
											<div class="flex-shrink-0">
												<a href="/shop/{product.slug}">
													{#if product?.images?.[0]}
														<img
															src={product.images[0]}
															alt={product.name}
															class="h-16 w-16 rounded-md border border-base-200 object-cover transition-opacity hover:opacity-80"
														/>
													{:else}
														<div
															class="flex h-16 w-16 items-center justify-center rounded-md bg-base-200"
														>
															<Package size={24} class="text-base-content/30" />
														</div>
													{/if}
												</a>
											</div>

											<div class="flex-1">
												<a href="/shop/{product.slug}" class="group">
													<h4
														class="mb-1 text-base font-bold transition-colors group-hover:text-primary"
													>
														{product.name}
													</h4>
												</a>
												<p class="text-sm text-base-content/70">
													{product.quantity}x {formatCurrency(product.price)}
												</p>
											</div>

											<div class="flex-shrink-0">
												{#if order.status === 'completed'}
													<a
														href="/shop/{product.slug}"
														class="btn w-full btn-outline btn-sm btn-success sm:w-auto"
													>
														Beli Lagi
													</a>
												{/if}
											</div>
										</div>
									{/each}

									<!-- Item lainnya jika expanded -->
									{#if expanded}
										<div transition:slide={{ duration: 300, easing: quintOut }}>
											{#each products.slice(1) as product}
												<div
													class="flex flex-col gap-4 border-b border-base-100 pt-4 pb-4 sm:flex-row"
												>
													<div class="flex-shrink-0">
														<a href="/shop/{product.slug}">
															{#if product?.images?.[0]}
																<img
																	src={product.images[0]}
																	alt={product.name}
																	class="h-16 w-16 rounded-md border border-base-200 object-cover transition-opacity hover:opacity-80"
																/>
															{:else}
																<div
																	class="flex h-16 w-16 items-center justify-center rounded-md bg-base-200"
																>
																	<Package size={24} class="text-base-content/30" />
																</div>
															{/if}
														</a>
													</div>

													<div class="flex-1">
														<a href="/shop/{product.slug}" class="group">
															<h4
																class="mb-1 text-base font-bold transition-colors group-hover:text-primary"
															>
																{product.name}
															</h4>
														</a>
														<p class="text-sm text-base-content/70">
															{product.quantity}x {formatCurrency(product.price)}
														</p>
													</div>

													<div class="flex-shrink-0">
														{#if order.status === 'completed'}
															<a
																href="/shop/{product.slug}"
																class="btn w-full btn-outline btn-sm btn-success sm:w-auto"
															>
																Beli Lagi
															</a>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									{/if}

									<!-- Toggle tombol -->
									{#if products.length > 1}
										<button
											class="mt-1 flex items-center gap-1 text-sm font-semibold text-success"
											onclick={() => (expanded = !expanded)}
										>
											{expanded ? 'Lihat Lebih Sedikit' : 'Lihat Semua Item'}
											<ChevronDown
												size={16}
												class={expanded
													? 'rotate-180 transition-transform'
													: 'transition-transform'}
											/>
										</button>
									{/if}
								{:else}
									<div class="py-4 text-center text-base-content/60">Tidak ada detail produk</div>
								{/if}
							</div>
						</section>

						<div class="divider my-0"></div>

						<!-- Payment Details Section -->
						<section>
							<h3 class="mb-4 text-lg font-bold">Rincian Pembayaran</h3>

							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-base-content/60">Metode Pembayaran</span>
									<span
										>{order.payment_method ? formatPaymentMethod(order.payment_method) : '-'}</span
									>
								</div>

								<div class="divider my-2"></div>

								<div class="flex justify-between">
									<span class="text-base-content/60">Subtotal Harga Item</span>
									<span>{formatCurrency(order.amount)}</span>
								</div>

								{#if order.fee}
									<div class="flex justify-between">
										<span class="text-base-content/60">Admin Fee</span>
										<span>{formatCurrency(order.fee)}</span>
									</div>
								{/if}

								<div class="mt-2 flex items-center justify-between border-t border-base-200 pt-4">
									<span class="text-lg font-bold">Total Belanja</span>
									<span class="text-lg font-bold text-base-content"
										>{formatCurrency(order.total_payment || order.amount)}</span
									>
								</div>
							</div>
						</section>
					</div>

					<!-- Right Column: Actions -->
					<div class="flex h-full flex-col gap-3 bg-base-100 p-6 lg:sticky lg:top-0 lg:w-80">
						{#if order.status === 'completed'}
							<a href="/shop" class="btn w-full font-bold text-white btn-success"> Beli Lagi </a>
						{:else if order.status === 'pending'}
							<a href="/payment/{order.order_id}" class="btn w-full font-bold btn-primary">
								Bayar Sekarang
							</a>
						{/if}

						<button
							class="btn w-full font-medium btn-outline hover:bg-base-200 hover:text-base-content"
						>
							Chat Penjual
						</button>

						<button
							class="btn w-full font-medium btn-outline hover:bg-base-200 hover:text-base-content"
						>
							Bantuan
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
