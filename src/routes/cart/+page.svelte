<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { cartStore, cartCount } from '$lib/stores/cart.store';
	import { generateOrderId, encodeOrderId } from '$lib/utils/order.utils';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { calculateDiscountedPrice } from '$lib/utils/product.utils';
	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';
	import MethodSelectorModal from '$lib/components/features/payment/MethodSelectorModal.svelte';
	import PaymentModal from '$lib/components/features/payment/PaymentModal.svelte';
	import FeaturesSection from '$lib/components/features/shop/FeaturesSection.svelte';
	import { appliedCoupon } from '$lib/stores/coupon.store';
	import type { CartItem } from '$lib/types/types';
	import { Trash2, NotebookPen, PackageOpen, ShoppingCart } from '@lucide/svelte';
	import { authUser, authLoading } from '$lib/stores/auth.store';
	import { toast } from '$lib/stores/toast.store';
	import { confirmClearCart, confirmDelete } from '$lib/utils/swal.utils';
	import { t } from 'svelte-i18n';

	const user = $derived($authUser);

	let cart = $state<CartItem[]>([]);
	let selectedItems = $state<Set<string>>(new Set());
	let cartLoading = $state(true);
	let loading = $derived($authLoading || cartLoading);
	let checkoutLoading = $state(false);
	let couponCode = $state('');
	let applyingCoupon = $state(false);
	let showPayment = $state(false);
	let showMethodSelector = $state(false);
	let selectedMethod = $state('qris');
	let paymentData = $state<any>(null);
	let qrImageUrl = $state('');
	let pollingInterval = $state<any>(null);
	let isSimulating = $state(false);
	let editingNote = $state<string | null>(null);
	let tempNotes = $state<Record<string, string>>({});

	$effect(() => {
		cart = $cartStore;
	});

	$effect(() => {
		if (user) {
			cartStore.load();
		}
	});

	onMount(async () => {
		await cartStore.load();
		cartLoading = false;
	});

	$effect(() => {
		return () => {
			if (pollingInterval) clearInterval(pollingInterval);
		};
	});

	const allSelected = $derived(cart.length > 0 && selectedItems.size === cart.length);

	function toggleSelectAll() {
		if (allSelected) {
			selectedItems = new Set();
		} else {
			selectedItems = new Set(cart.map((item) => item.id));
		}
	}

	function toggleSelectItem(itemId: string) {
		const newSet = new Set(selectedItems);
		if (newSet.has(itemId)) {
			newSet.delete(itemId);
		} else {
			newSet.add(itemId);
		}
		selectedItems = newSet;
	}

	async function updateQuantity(item: CartItem, newQuantity: number) {
		if (newQuantity < 1) return;
		const success = await cartStore.updateQuantity(item.id, newQuantity);
		if (!success) {
			toast.error($t('cart.error.update_quantity'));
		}
	}

	async function removeItem(item: CartItem) {
		const confirmed = await confirmDelete('item dari keranjang');
		if (!confirmed) return;

		const success = await cartStore.removeItem(item.id);
		if (!success) {
			toast.error($t('cart.error.remove_item'));
		} else {
			selectedItems.delete(item.id);
			toast.success($t('cart.success.remove_item'));
		}
	}

	async function clearCart() {
		const confirmed = await confirmClearCart();
		if (!confirmed) return;

		const success = await cartStore.clear();
		if (success) {
			selectedItems = new Set();
		}
	}

	async function handleApplyCoupon() {
		if (!couponCode.trim()) {
			toast.error($t('cart.error.enter_coupon'));
			return;
		}

		applyingCoupon = true;

		let userId = localStorage.getItem('cart_user_id');
		if (!userId) {
			userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			localStorage.setItem('cart_user_id', userId);
		}

		const success = await appliedCoupon.apply(
			couponCode.trim().toUpperCase(),
			subtotalAmount,
			userId
		);

		if (success) {
			couponCode = '';
		}

		applyingCoupon = false;
	}

	function handleRemoveCoupon() {
		appliedCoupon.remove();
	}

	function handleCheckout() {
		if (selectedItems.size === 0) {
			toast.error($t('cart.error.select_product'));
			return;
		}
		showMethodSelector = true;
	}

	async function updateNote(itemId: string) {
		try {
			const note = tempNotes[itemId] || '';

			const res = await fetch(`/api/cart/${itemId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ note })
			});

			if (res.ok) {
				await cartStore.load();
				editingNote = null;
			} else {
				const data = await res.json();
				toast.error($t('cart.error.save_note') + ': ' + (data.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Update note error:', error);
			toast.error($t('common.error'));
		}
	}

	function startEditNote(item: CartItem) {
		editingNote = item.id;
		tempNotes[item.id] = item.note || '';
	}

	function cancelEditNote() {
		editingNote = null;
		tempNotes = {};
	}

	async function processCheckout(method: string) {
		if (!user) return;

		selectedMethod = method;
		checkoutLoading = true;
		showMethodSelector = false;

		try {
			const selectedCartItems = cart.filter((item) => selectedItems.has(item.id));

			const orderId = generateOrderId();
			const encodedOrderId = encodeOrderId(orderId);

			const totalAmount = selectedCartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);

			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: selectedCartItems.map((item) => ({
						product_id: item.product_id,
						quantity: item.quantity,
						note: item.note || null
					})),
					order_id: encodedOrderId,
					payment_method: method,
					user_id: user.id,
					coupon_code: $appliedCoupon?.coupon.code,
					discount_amount: discountAmount
				})
			});

			const data = await res.json();

			if (!res.ok || data.error) {
				toast.error(data.error || $t('payment.error.create_transaction'));
				checkoutLoading = false;
				return;
			}

			for (const itemId of selectedItems) {
				await cartStore.removeItem(itemId);
			}
			selectedItems = new Set();

			goto(`/payment/${encodedOrderId}`);
		} catch (error) {
			console.error('Checkout error:', error);
			toast.error($t('payment.error.checkout'));
			checkoutLoading = false;
		}
	}

	function handleSelectQRIS() {
		processCheckout('qris');
	}

	function handleSelectOther(method: string) {
		processCheckout(method);
	}

	function startPolling(orderId: string) {
		pollingInterval = setInterval(async () => {
			try {
				const res = await fetch('/api/check-payment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ order_id: orderId })
				});

				const data = await res.json();

				if (data.status === 'completed') {
					clearInterval(pollingInterval);

					for (const itemId of selectedItems) {
						await cartStore.removeItem(itemId);
					}
					selectedItems = new Set();

					window.location.href = `/success?order_id=${orderId}`;
				}
			} catch (error) {
				console.error('Polling error:', error);
			}
		}, 3000);

		setTimeout(() => {
			if (pollingInterval) clearInterval(pollingInterval);
		}, 600000);
	}

	function closePayment() {
		if (pollingInterval) clearInterval(pollingInterval);
		showPayment = false;
		paymentData = null;
		qrImageUrl = '';
	}

	function closeMethodSelector() {
		showMethodSelector = false;
	}

	async function simulatePayment() {
		if (!paymentData || isSimulating) return;

		isSimulating = true;

		try {
			const res = await fetch('/api/simulate-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					order_id: paymentData.order_id,
					amount: paymentData.amount
				})
			});

			if (res.ok) {
				toast.success($t('payment.success_msg.simulation'));
			} else {
				const data = await res.json();
				toast.error(data.error || $t('payment.error.simulation'));
				isSimulating = false;
			}
		} catch (error) {
			console.error('Simulate error:', error);
			toast.error($t('payment.error.simulation_error'));
			isSimulating = false;
		}
	}

	function getItemSubtotal(item: CartItem): number {
		if (!item.product) return 0;
		const price = calculateDiscountedPrice(item.product);
		return price * item.quantity;
	}

	const subtotalAmount = $derived(
		cart
			.filter((item) => selectedItems.has(item.id))
			.reduce((sum, item) => sum + getItemSubtotal(item), 0)
	);

	const discountAmount = $derived($appliedCoupon ? $appliedCoupon.discount_amount : 0);
	const totalAmount = $derived(subtotalAmount - discountAmount);
	const dummyProduct = $derived({
		id: 'CART_CHECKOUT',
		name:
			selectedItems.size > 1
				? 'Multi Product'
				: cart.find((item) => selectedItems.has(item.id))?.product?.name || 'Product',
		price: totalAmount,
		description: `${selectedItems.size} produk dipilih`,
		stock: 999,
		status: 'active' as const
	});
</script>

<svelte:head>
	<title>{$t('cart.title')} - adverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<Navbar />

	<PageHeader
		title={$t('cart.title')}
		breadcrumbs={[{ label: $t('nav.home'), href: '/' }, { label: $t('cart.title') }]}
	/>

	<div class="container mx-auto px-4 py-8">
		{#if loading}
			<div class="flex justify-center py-20">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{:else if cart.length === 0}
			<div class="mx-auto max-w-2xl">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center py-16 text-center">
						<div class="mb-6">
							<PackageOpen size={150} />
						</div>
						<h2 class="mb-2 text-2xl font-bold">{$t('cart.empty_title')}</h2>
						<p class="mb-8 text-base-content/70">{$t('cart.empty_subtitle')}</p>
						<a href="/shop" class="btn btn-lg btn-primary">
							<span><ShoppingCart /></span>
							{$t('cart.start_shopping')}
						</a>
					</div>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<!-- Cart Items Table (Left Column) -->
				<div class="lg:col-span-2">
					<div class="overflow-x-auto">
						<table class="table w-full">
							<!-- Head -->
							<thead class="bg-primary/10 text-base-content">
								<tr>
									<th class="w-12"></th>
									<!-- Delete Button -->
									<th>
										<div class="flex items-center gap-4">
											<label>
												<input
													type="checkbox"
													class="checkbox checkbox-sm checkbox-primary"
													checked={allSelected}
													onchange={toggleSelectAll}
												/>
											</label>
											<span>{$t('cart.product')}</span>
										</div>
									</th>
									<th>{$t('cart.price')}</th>
									<th>{$t('cart.quantity')}</th>
									<th>{$t('cart.subtotal')}</th>
								</tr>
							</thead>
							<tbody>
								{#each cart as item}
									{#if item.product}
										<tr class="border-b border-base-200">
											<!-- Delete Action -->
											<td>
												<button
													class="btn text-base-content/50 btn-ghost btn-xs hover:text-error"
													onclick={() => removeItem(item)}
												>
													<Trash2 size={16} />
												</button>
											</td>

											<!-- Product Info -->
											<td>
												<div class="flex items-center gap-4">
													<label>
														<input
															type="checkbox"
															class="checkbox checkbox-sm checkbox-primary"
															checked={selectedItems.has(item.id)}
															onchange={() => toggleSelectItem(item.id)}
														/>
													</label>
													<div class="avatar">
														<div class="h-16 w-16 rounded-lg border border-base-300">
															<img
																src={item.product.images?.[0] || 'https://via.placeholder.com/200'}
																alt={item.product.name}
															/>
														</div>
													</div>
													<div>
														<div class="font-bold">{item.product.name}</div>
														<div class="text-xs text-base-content/50">
															{item.product.categories?.[0]?.name || 'Product'}
														</div>
														<!-- Note Section -->
														<div class="mt-1">
															{#if editingNote === item.id}
																<div class="flex gap-1">
																	<input
																		type="text"
																		class="input-bordered input input-xs w-full max-w-[150px]"
																		placeholder={$t('cart.note_placeholder')}
																		bind:value={tempNotes[item.id]}
																	/>
																	<button
																		class="btn btn-square btn-xs btn-primary"
																		onclick={() => updateNote(item.id)}
																	>
																		✓
																	</button>
																	<button
																		class="btn btn-square btn-ghost btn-xs"
																		onclick={cancelEditNote}
																	>
																		✕
																	</button>
																</div>
															{:else}
																<button
																	class="flex items-center gap-1 text-xs text-base-content/50 hover:text-primary"
																	onclick={() => startEditNote(item)}
																>
																	<NotebookPen size={12} />
																	{item.note || $t('cart.add_note')}
																</button>
															{/if}
														</div>
													</div>
												</div>
											</td>

											<!-- Price -->
											<td class="font-medium">
												{#if item.product.discount_percentage}
													<div class="flex flex-col">
														<span>{formatCurrency(calculateDiscountedPrice(item.product))}</span>
														<span class="text-xs text-base-content/50 line-through">
															{formatCurrency(item.product.price)}
														</span>
													</div>
												{:else}
													{formatCurrency(item.product.price)}
												{/if}
											</td>

											<!-- Quantity -->
											<td>
												<div class="join rounded-lg border border-base-300">
													<button
														class="btn join-item px-2 btn-ghost btn-sm"
														onclick={() => updateQuantity(item, item.quantity - 1)}
														disabled={item.quantity <= 1}
													>
														−
													</button>
													<input
														type="text"
														class="join-item w-10 border-none bg-transparent text-center text-sm focus:outline-none"
														value={item.quantity}
														readonly
													/>
													<button
														class="btn join-item px-2 btn-ghost btn-sm"
														onclick={() => updateQuantity(item, item.quantity + 1)}
														disabled={item.product && item.quantity >= item.product.stock}
													>
														+
													</button>
												</div>
												{#if item.product.stock < item.quantity}
													<div class="mt-1 text-xs text-error">
														{$t('shop.stock')}: {item.product.stock}
													</div>
												{/if}
											</td>

											<!-- Subtotal -->
											<td class="font-bold">
												{formatCurrency(getItemSubtotal(item))}
											</td>
										</tr>
									{/if}
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Coupon & Clear Cart -->
					<div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex gap-2">
							<input
								type="text"
								placeholder={$t('cart.coupon_placeholder')}
								class="input-bordered input w-full max-w-xs rounded-full"
								bind:value={couponCode}
							/>
							<button
								class="btn rounded-full px-8 btn-primary"
								onclick={handleApplyCoupon}
								disabled={applyingCoupon}
							>
								{#if applyingCoupon}
									<span class="loading loading-xs loading-spinner"></span>
								{/if}
								{$t('cart.apply_coupon')}
							</button>
						</div>

						<button class="btn text-base-content/70 btn-ghost hover:text-error" onclick={clearCart}>
							{$t('cart.clear_cart')}
						</button>
					</div>
				</div>

				<!-- Order Summary (Right Column) -->
				<div class="lg:col-span-1">
					<div class="card border border-base-200 bg-base-100">
						<div class="card-body">
							<h2 class="mb-4 card-title text-lg font-bold">{$t('cart.order_summary')}</h2>

							<div class="space-y-3 text-sm">
								<div class="flex justify-between">
									<span class="text-base-content/70">{$t('cart.items')}</span>
									<span class="font-medium">{selectedItems.size}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-base-content/70">{$t('cart.sub_total')}</span>
									<span class="font-medium">{formatCurrency(subtotalAmount)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-base-content/70">{$t('cart.fee')}</span>
									<span class="">{$t('cart.fee_note')}</span>
								</div>
								{#if $appliedCoupon}
									<div class="flex justify-between text-success">
										<span>{$t('cart.coupon_discount')}</span>
										<span class="font-medium">-{formatCurrency(discountAmount)}</span>
									</div>
									<div class="flex justify-end">
										<button class="text-xs text-error hover:underline" onclick={handleRemoveCoupon}>
											{$t('cart.remove_coupon')}
										</button>
									</div>
								{/if}
							</div>

							<div class="divider my-4"></div>

							<div class="flex justify-between text-lg font-bold">
								<span>{$t('cart.total')}</span>
								<span>{formatCurrency(totalAmount)}</span>
							</div>

							<button
								class="btn mt-6 w-full rounded-full btn-primary"
								onclick={handleCheckout}
								disabled={checkoutLoading || selectedItems.size === 0}
							>
								{#if checkoutLoading}
									<span class="loading loading-spinner"></span>
								{/if}
								{$t('cart.checkout')}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Features Section -->
	<div class="mt-12">
		<FeaturesSection />
	</div>

	<Footer />
</div>

{#if showMethodSelector && dummyProduct}
	<MethodSelectorModal
		product={dummyProduct}
		paymentMethods={[...PAYMENT_METHODS]}
		isCartCheckout={true}
		itemCount={selectedItems.size}
		{totalAmount}
		onClose={closeMethodSelector}
		onSelectQRIS={handleSelectQRIS}
		onSelectOther={handleSelectOther}
	/>
{/if}
{#if showPayment && paymentData && dummyProduct}
	<PaymentModal
		product={dummyProduct}
		{paymentData}
		{qrImageUrl}
		{isSimulating}
		isCartCheckout={true}
		onClose={closePayment}
		onSimulate={simulatePayment}
	/>
{/if}
