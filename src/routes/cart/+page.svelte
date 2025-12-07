<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { fetchWithCSRF } from '$lib/utils/csrf.utils';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { cartStore } from '$lib/stores/cart.store';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { appliedCoupon } from '$lib/stores/coupon.store';
	import type { CartItem } from '$lib/types/types';
	import { toast } from '$lib/stores/toast.store';
	import { confirmClearCart, confirmDelete } from '$lib/utils/swal.utils';
	import { t, locale } from 'svelte-i18n';
	import { authUser, authLoading } from '$lib/stores/auth.store';
	import { generateOrderId, encodeOrderId } from '$lib/utils/order.utils';
	import { Trash2, Smartphone, CreditCard, Ticket, ShieldCheck, LogIn } from '@lucide/svelte';

	$: cart = $cartStore;
	let selectedItems = new Set<string>();
	let loading = true;
	let couponCode = '';
	let applyingCoupon = false;

	// Billing Details
	let billingName = '';
	let billingEmail = '';
	let billingPhone = '';

	// Payment Method
	let selectedPayment = 'qris'; // default

	// Helper to get product name safely
	function getProductName(item: CartItem): string {
		if (!item.product) return 'Unknown Product';
		if (typeof item.product.name === 'string') return item.product.name;
		// @ts-ignore - LocalizedString handling
		return item.product.name[$locale ?? 'id'] ?? item.product.name.en ?? 'Unknown Product';
	}

	function getProductPrice(item: CartItem): number {
		return item.product?.price ?? 0;
	}

	// derived values
	$: subtotal = cart.reduce((sum, i) => sum + getProductPrice(i) * i.quantity, 0);
	$: discount = $appliedCoupon?.discount_amount ?? 0;
	$: total = Math.max(0, subtotal - discount);

	$: if ($authUser) {
		// Reload cart for authenticated user
		cartStore.load();

		// Fetch accurate profile data from API (since it's in user_roles table, not metadata)
		// Only fetch if fields are empty to avoid overwriting user input
		if (!billingName || !billingPhone) {
			fetch('/api/profile')
				.then((res) => res.json())
				.then((data) => {
					// Always set email from authUser as fallback
					if (!billingEmail) billingEmail = $authUser?.email || data.email || '';

					// Set billing details from profile data
					if (!billingName && data.full_name) billingName = data.full_name;
					if (!billingPhone && data.phone_number) billingPhone = data.phone_number;
				})
				.catch((err) => console.error('Failed to load profile for billing', err));
		}
	}

	onMount(async () => {
		await cartStore.load();
		loading = false;
	});

	function toggleSelectAll() {
		if (selectedItems.size === cart.length) selectedItems.clear();
		else selectedItems = new Set(cart.map((i) => i.id));
		selectedItems = selectedItems;
	}

	function toggleSelectItem(id: string) {
		if (selectedItems.has(id)) selectedItems.delete(id);
		else selectedItems.add(id);
		selectedItems = selectedItems;
	}

	async function updateQuantity(item: CartItem, qty: number) {
		if (qty < 1) return;
		if (item.product && qty > item.product.stock) {
			toast.error($t('shop.stock') + `: ${item.product.stock}`);
			return;
		}
		const ok = await cartStore.updateQuantity(item.id, qty);
		if (!ok) toast.error('Failed to update quantity');
	}

	async function removeItem(item: CartItem) {
		if (await confirmDelete('item')) {
			const ok = await cartStore.removeItem(item.id);
			if (!ok) toast.error('Failed to remove item');
			else {
				if (selectedItems.has(item.id)) {
					selectedItems.delete(item.id);
					selectedItems = selectedItems;
				}
			}
		}
	}

	async function clearCart() {
		if (await confirmClearCart()) {
			await cartStore.clear();
			selectedItems.clear();
			selectedItems = selectedItems;
		}
	}

	async function applyCoupon() {
		if (!couponCode.trim()) return toast.error('Enter coupon code');
		if (!$authUser) return toast.error('Please login to use coupons');

		applyingCoupon = true;
		const success = await appliedCoupon.apply(
			couponCode.trim().toUpperCase(),
			subtotal,
			$authUser.id
		);
		if (success) couponCode = '';
		applyingCoupon = false;
	}

	async function startCheckout() {
		if (!$authUser) {
			toast.error('Please login to continue');
			goto('/login?redirect=/cart');
			return;
		}

		if (selectedItems.size === 0) return toast.error('Select at least one product');
		if (!billingName || !billingEmail || !billingPhone)
			return toast.error('Please complete billing details');

		// Re-validate selection
		const items = cart.filter((i) => selectedItems.has(i.id));

		const payload = {
			items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, note: i.note })),
			payment_method: selectedPayment,
			appliedCoupon: $appliedCoupon ?? null,
			user_id: $authUser.id, // Enforce authenticated user ID
			customer_name: billingName,
			customer_email: billingEmail,
			customer_phone: billingPhone,
			order_id: encodeOrderId(generateOrderId())
		};

		const res = await fetchWithCSRF('/api/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (res.ok) {
			const data = await res.json();
			// Clear checked items from cart store logic ideally, but for now clear store if all selected
			if (selectedItems.size === cart.length) await cartStore.clear();
			goto(`/payment/${data.order_id}`);
		} else {
			const data = await res.json();
			const errorMsg = data.error || 'Checkout failed';

			// Intercept specific min amount error
			if (
				typeof errorMsg === 'string' &&
				(errorMsg.includes('nominal terlalu kecil') || errorMsg.includes('Rp 10.000'))
			) {
				toast.error($t('payment.min_amount_warning'), 4000);
			} else {
				toast.error(errorMsg);
			}
		}
	}
</script>

<Navbar />
<PageHeader
	title={$t('cart.title')}
	breadcrumbs={[{ label: $t('nav.home'), href: '/' }, { label: $t('cart.title') }]}
/>

{#if $authLoading || loading}
	<div class="flex min-h-[50vh] items-center justify-center">
		<span class="loading loading-lg loading-spinner text-primary"></span>
	</div>
{:else}
	<div class="container mx-auto px-4 py-8 lg:py-12">
		{#if cart.length === 0}
			<div class="rounded-xl border border-base-200 bg-base-100 py-16 text-center shadow-sm">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-200"
				>
					<Ticket size={32} class="text-base-content/50" />
				</div>
				<h2 class="mb-2 text-2xl font-bold">{$t('cart.empty')}</h2>
				<p class="mb-6 text-base-content/70">{$t('cart.empty_subtitle')}</p>
				<a href="/shop" class="btn btn-primary">{$t('cart.start_shopping')}</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<!-- Left Column: Cart Items -->
				<div class="space-y-6 lg:col-span-2">
					<div class="card border border-base-200 bg-base-100 shadow-sm">
						<div class="card-body p-0">
							<div class="overflow-x-auto">
								<table class="table w-full">
									<thead>
										<tr class="bg-base-200/50">
											<th class="w-10">
												<input
													type="checkbox"
													class="checkbox checkbox-primary"
													checked={selectedItems.size === cart.length && cart.length > 0}
													on:change={toggleSelectAll}
												/>
											</th>
											<th>{$t('cart.product')}</th>
											<th class="text-center">{$t('cart.quantity')}</th>
											<th class="text-right">{$t('cart.total')}</th>
											<th class="w-10"></th>
										</tr>
									</thead>
									<tbody>
										{#each cart as item (item.id)}
											<tr class="hover:bg-base-50/50 transition-colors">
												<td>
													<input
														type="checkbox"
														class="checkbox checkbox-primary"
														checked={selectedItems.has(item.id)}
														on:change={() => toggleSelectItem(item.id)}
													/>
												</td>
												<td>
													<div class="flex items-center gap-3">
														{#if item.product?.images?.[0]}
															<div class="avatar">
																<div class="mask h-12 w-12 mask-squircle">
																	<img src={item.product.images[0]} alt={getProductName(item)} />
																</div>
															</div>
														{/if}
														<div>
															<div class="line-clamp-1 font-bold">{getProductName(item)}</div>
															<div class="text-sm opacity-50">
																{formatCurrency(getProductPrice(item))}
															</div>
														</div>
													</div>
												</td>
												<td class="text-center">
													<div class="join">
														<button
															class="btn join-item btn-xs"
															on:click={() => updateQuantity(item, item.quantity - 1)}>-</button
														>
														<input
															type="number"
															min="1"
															class="input input-xs join-item w-12 text-center"
															value={item.quantity}
															on:change={(e) => updateQuantity(item, +e.currentTarget.value)}
														/>
														<button
															class="btn join-item btn-xs"
															on:click={() => updateQuantity(item, item.quantity + 1)}>+</button
														>
													</div>
												</td>
												<td class="text-right font-medium">
													{formatCurrency(getProductPrice(item) * item.quantity)}
												</td>
												<td>
													<button
														class="btn text-error btn-ghost btn-xs"
														on:click={() => removeItem(item)}
													>
														<Trash2 size={16} />
													</button>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
						<div class="flex justify-end border-t border-base-200 p-4">
							<button class="btn gap-2 text-error btn-ghost btn-sm" on:click={clearCart}>
								<Trash2 size={16} />
								{$t('cart.clear_cart')}
							</button>
						</div>
					</div>

					<!-- Billing Details (Only if logged in) -->
					{#if $authUser}
						<div class="card border border-base-200 bg-base-100 shadow-sm">
							<div class="card-body">
								<h3 class="mb-4 card-title flex items-center gap-2 text-lg">
									<ShieldCheck size={20} class="text-primary" />
									{$t('cart.billing_info')}
								</h3>
								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="form-control flex flex-col gap-2">
										<label class="label" for="billingName">
											<span class="label-text">{$t('cart.full_name')}</span>
										</label>
										<input
											id="billingName"
											type="text"
											bind:value={billingName}
											class="input-bordered input w-full"
											placeholder="Nama Anda"
										/>
									</div>

									<div class="form-control flex flex-col gap-2">
										<label class="label" for="billingEmail">
											<span class="label-text">{$t('cart.email')}</span>
										</label>
										<input
											id="billingEmail"
											type="email"
											bind:value={billingEmail}
											class="input-bordered input w-full"
											placeholder="email@contoh.com"
										/>
									</div>
									<div class="form-control flex flex-col gap-2">
										<label class="label" for="billingPhone">
											<span class="label-text">{$t('cart.phone')}</span>
										</label>
										<div class="relative">
											<input
												id="billingPhone"
												type="tel"
												bind:value={billingPhone}
												class="input-bordered input w-full"
												placeholder="0812345678"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<div class="alert alert-warning shadow-sm">
							<LogIn size={24} />
							<div>
								<h3 class="font-bold">{$t('cart.login_required')}</h3>
								<div class="text-xs">{$t('cart.login_prompt')}</div>
							</div>
							<a href="/login?redirect=/cart" class="btn btn-sm">{$t('nav.login')}</a>
						</div>
					{/if}
				</div>

				<!-- Right Column: Summary & Payment -->
				<div class="space-y-6 lg:col-span-1">
					<div class="card sticky top-24 border border-base-200 bg-base-100 shadow-sm">
						<div class="card-body">
							<h3 class="mb-4 card-title text-lg">{$t('cart.order_summary')}</h3>

							<div class="mb-6 space-y-3">
								<div class="flex justify-between">
									<span class="text-base-content/70">{$t('cart.subtotal')}</span>
									<span class="font-medium">{formatCurrency(subtotal)}</span>
								</div>

								{#if $appliedCoupon}
									<div class="flex justify-between text-success">
										<span class="flex items-center gap-1">
											<Ticket size={14} />
											{$t('cart.coupon')} ({$appliedCoupon.coupon.code})
										</span>
										<span>-{formatCurrency(discount)}</span>
									</div>
								{/if}

								<div class="divider my-2"></div>

								<div class="flex items-center justify-between text-lg font-bold">
									<span>{$t('cart.total')}</span>
									<span class="text-primary">{formatCurrency(total)}</span>
								</div>
							</div>

							<!-- Coupon Input -->
							<div class="mb-6 join w-full">
								<input
									type="text"
									class="input-bordered input input-sm join-item w-full"
									placeholder={$t('cart.coupon_placeholder')}
									bind:value={couponCode}
								/>
								<button
									class="btn join-item btn-sm btn-primary"
									disabled={applyingCoupon || !$authUser}
									on:click={applyCoupon}
								>
									{$t('cart.apply')}
								</button>
							</div>

							<!-- Payment Method Selection -->
							<div class="form-control mb-6">
								<label class="label">
									<span class="label-text flex items-center gap-2 font-bold">
										<CreditCard size={16} />
										{$t('cart.payment_method')}
									</span>
								</label>
								<div class="join-vertical join w-full">
									<label
										class="btn join-item h-auto justify-start gap-3 border-base-300 bg-base-100 py-3 transition-all hover:bg-base-200 has-[:checked]:border-primary has-[:checked]:bg-primary/10"
									>
										<input
											type="radio"
											name="payment"
											value="qris"
											class="radio radio-sm radio-primary"
											bind:group={selectedPayment}
										/>
										<div class="text-left">
											<div class="font-bold">{$t('cart.qris_instant')}</div>
											<div class="text-xs opacity-70">{$t('payment.qris_desc')}</div>
										</div>
									</label>
									<label
										class="btn join-item h-auto justify-start gap-3 border-base-300 bg-base-100 py-3 transition-all hover:bg-base-200 has-[:checked]:border-primary has-[:checked]:bg-primary/10"
									>
										<input
											type="radio"
											name="payment"
											value="bni_va"
											class="radio radio-sm radio-primary"
											bind:group={selectedPayment}
										/>
										<div class="text-left">
											<div class="font-bold">{$t('cart.va')}</div>
											<div class="text-xs opacity-70">{$t('cart.va_desc')}</div>
										</div>
									</label>
								</div>
							</div>

							<button
								class="btn w-full shadow-lg transition-all duration-200 btn-lg btn-primary hover:-translate-y-0.5 hover:shadow-xl"
								disabled={!$authUser || selectedItems.size === 0}
								on:click={startCheckout}
							>
								{#if !$authUser}
									{$t('cart.login_to_checkout')}
								{:else}
									{$t('cart.checkout_now')}
								{/if}
							</button>

							{#if !$authUser}
								<p class="mt-2 text-center text-xs opacity-60">
									{$t('cart.guest_disabled')}
								</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
<Footer />
