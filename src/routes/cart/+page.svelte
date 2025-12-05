<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, slide } from 'svelte/transition';

	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { cartStore, cartCount } from '$lib/stores/cart.store';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { calculateDiscountedPrice } from '$lib/utils/product.utils';
	import FeaturesSection from '$lib/components/features/shop/FeaturesSection.svelte';
	import { appliedCoupon } from '$lib/stores/coupon.store';
	import type { CartItem } from '$lib/types/types';
	import {
		Trash2,
		NotebookPen,
		PackageOpen,
		ShoppingCart,
		Loader2,
		CreditCard,
		Wallet,
		QrCode,
		Store,
		ShieldCheck,
		ChevronRight,
		ChevronLeft,
		Building2
	} from '@lucide/svelte';
	import { authUser, authLoading } from '$lib/stores/auth.store';
	import { toast } from '$lib/stores/toast.store';
	import { confirmClearCart, confirmDelete } from '$lib/utils/swal.utils';
	import { t, locale } from 'svelte-i18n';
	import { getLocalizedText } from '$lib/utils/localization.utils';
	import { generateOrderId, encodeOrderId } from '$lib/utils/order.utils';
	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';

	const user = $derived($authUser);

	let cart = $state<CartItem[]>([]);
	let selectedItems = $state<Set<string>>(new Set());
	let cartLoading = $state(true);
	let loading = $derived($authLoading || cartLoading);
	let couponCode = $state('');
	let applyingCoupon = $state(false);
	let editingNote = $state<string | null>(null);
	let tempNotes = $state<Record<string, string>>({});

	// Checkout State
	let checkoutStep = $state(0); // 0: Cart, 1: Checkout (Billing + Payment)
	let processing = $state(false);
	let billingDetails = $state({
		fullName: '',
		email: '',
		phone: ''
	});
	let selectedPaymentMethod = $state('qris');
	let showVABanks = $state(false);

	// Get payment methods from constants
	const qrisMethod = PAYMENT_METHODS.find((m) => m.value === 'qris');
	const vaBanks = PAYMENT_METHODS.filter((m) => m.value.endsWith('_va'));

	$effect(() => {
		cart = $cartStore;
	});

	$effect(() => {
		if (user) {
			cartStore.load();
			// Auto-fill billing details if user is logged in
			if (checkoutStep === 0) {
				billingDetails.fullName = user.user_metadata?.full_name || '';
				billingDetails.email = user.email || '';
				billingDetails.phone = user.user_metadata?.phone || '';
			}
		}
	});

	onMount(async () => {
		await cartStore.load();
		cartLoading = false;
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

	function startCheckout() {
		if (selectedItems.size === 0) {
			toast.error($t('cart.error.select_product'));
			return;
		}
		checkoutStep = 1;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function prevStep() {
		if (checkoutStep > 0) {
			checkoutStep = 0;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function toggleVABanks() {
		showVABanks = !showVABanks;
		if (showVABanks && !vaBanks.some((b) => b.value === selectedPaymentMethod)) {
			// Don't auto-select, let user choose
		} else if (!showVABanks && selectedPaymentMethod !== 'qris') {
			// If closing and a VA was selected, maybe keep it or reset?
			// Let's keep it selected but hide the list if they click the header again?
			// Actually, clicking the main VA button should just toggle visibility.
		}
	}

	function selectVA(code: string) {
		selectedPaymentMethod = code;
	}

	async function confirmPayment() {
		if (!billingDetails.fullName || !billingDetails.email || !billingDetails.phone) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (
			selectedPaymentMethod !== 'qris' &&
			!vaBanks.some((b) => b.value === selectedPaymentMethod)
		) {
			toast.error('Please select a specific bank for Virtual Account');
			return;
		}

		processing = true;
		try {
			// Use order.utils to generate and encode order ID
			const rawOrderId = generateOrderId();
			const orderId = encodeOrderId(rawOrderId);

			const checkoutItems = cart.filter((item) => selectedItems.has(item.id));

			const payload = {
				order_id: orderId,
				items: checkoutItems.map((item) => ({
					product_id: item.product?.id || '',
					quantity: item.quantity,
					note: item.note
				})),
				user_id: user?.id || 'guest',
				payment_method: selectedPaymentMethod,
				coupon_code: $appliedCoupon?.coupon.code,
				discount_amount: discountAmount,
				billing_details: billingDetails
			};

			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();

			if (res.ok) {
				cartStore.clear();
				appliedCoupon.clear();
				// Redirect to payment page instead of success page
				goto(`/payment/${data.order_id}`);
			} else {
				toast.error(data.error || 'Checkout failed');
			}
		} catch (error) {
			console.error(error);
			toast.error('System error occurred');
		} finally {
			processing = false;
		}
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
</script>

<svelte:head>
	<title>{$t('cart.title')} - adverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<Navbar />

	<PageHeader
		title={checkoutStep === 0 ? $t('cart.title') : 'Checkout'}
		breadcrumbs={[
			{ label: $t('nav.home'), href: '/' },
			{ label: $t('cart.title'), href: '/cart' },
			...(checkoutStep > 0 ? [{ label: 'Checkout' }] : [])
		]}
	/>

	<div class="container mx-auto px-4 py-8">
		{#if loading}
			<div class="flex justify-center py-20">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{:else if cart.length === 0 && checkoutStep === 0}
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
				<!-- Left Column: Cart Items OR Checkout Form -->
				<div class="space-y-6 lg:col-span-2">
					{#if checkoutStep === 0}
						<!-- Step 0: Cart Items -->
						<div class="overflow-x-auto" in:fade={{ duration: 200 }}>
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
																	src={item.product.images?.[0] ||
																		'https://via.placeholder.com/200'}
																	alt={getLocalizedText(item.product.name, $locale)}
																/>
															</div>
														</div>
														<div>
															<div class="font-bold">
																{getLocalizedText(item.product.name, $locale)}
															</div>
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
						<div
							class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
							in:fade
						>
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

							<button
								class="btn text-base-content/70 btn-ghost hover:text-error"
								onclick={clearCart}
							>
								{$t('cart.clear_cart')}
							</button>
						</div>
					{:else if checkoutStep === 1}
						<!-- Step 1: Checkout (Billing + Payment) -->
						<div in:fade={{ duration: 200 }}>
							<button
								class="mb-6 flex items-center gap-2 text-sm font-medium text-base-content/60 hover:text-primary"
								onclick={prevStep}
							>
								<ChevronLeft size={16} />
								Back to Cart
							</button>

							<!-- Billing Details -->
							<div class="card mb-6 border border-base-200 bg-base-100 shadow-sm">
								<div class="card-body">
									<h2 class="mb-6 text-xl font-bold text-base-content">Billing Details</h2>
									<div class="grid gap-6 md:grid-cols-2">
										<div class="form-control md:col-span-2">
											<label class="label" for="fullName">
												<span class="label-text font-medium"
													>Full Name <span class="text-error">*</span></span
												>
											</label>
											<input
												type="text"
												id="fullName"
												bind:value={billingDetails.fullName}
												placeholder="Ex. John Doe"
												class="input-bordered input w-full rounded-xl bg-base-200/50 focus:border-primary focus:bg-base-100"
											/>
										</div>

										<div class="form-control">
											<label class="label" for="email">
												<span class="label-text font-medium"
													>Email Address <span class="text-error">*</span></span
												>
											</label>
											<input
												type="email"
												id="email"
												bind:value={billingDetails.email}
												placeholder="email@example.com"
												class="input-bordered input w-full rounded-xl bg-base-200/50 focus:border-primary focus:bg-base-100"
											/>
										</div>

										<div class="form-control">
											<label class="label" for="phone">
												<span class="label-text font-medium"
													>Phone Number <span class="text-error">*</span></span
												>
											</label>
											<input
												type="tel"
												id="phone"
												bind:value={billingDetails.phone}
												placeholder="08123456789"
												class="input-bordered input w-full rounded-xl bg-base-200/50 focus:border-primary focus:bg-base-100"
											/>
										</div>
									</div>
								</div>
							</div>

							<!-- Payment Method -->
							<div class="card border border-base-200 bg-base-100 shadow-sm">
								<div class="card-body">
									<h2 class="mb-6 text-xl font-bold text-base-content">Select Payment Method</h2>
									<div class="space-y-4">
										<!-- QRIS -->
										<button
											class="flex w-full cursor-pointer items-center justify-between rounded-2xl border p-5 transition-all hover:border-primary hover:bg-base-200/30 {selectedPaymentMethod ===
											'qris'
												? 'border-primary bg-primary/5 ring-1 ring-primary'
												: 'border-base-200'}"
											onclick={() => {
												selectedPaymentMethod = 'qris';
												showVABanks = false;
											}}
										>
											<div class="flex items-center gap-4">
												<div
													class="flex h-6 w-6 items-center justify-center rounded-full border border-base-300 {selectedPaymentMethod ===
													'qris'
														? 'border-primary bg-primary'
														: 'bg-base-100'}"
												>
													{#if selectedPaymentMethod === 'qris'}
														<div class="h-2.5 w-2.5 rounded-full bg-white"></div>
													{/if}
												</div>
												<div class="text-left">
													<span class="block font-bold">{qrisMethod?.label || 'QRIS'}</span>
													<span class="text-sm text-base-content/60">E-Wallet & Mobile Banking</span
													>
												</div>
											</div>
											{#if qrisMethod?.icon}
												<img src={qrisMethod.icon} alt="QRIS" class="h-7 w-auto object-contain" />
											{:else}
												<QrCode size={28} class="text-base-content/40" />
											{/if}
										</button>

										<!-- Virtual Account -->
										<div
											class="overflow-hidden rounded-2xl border border-base-200 transition-all {showVABanks ||
											selectedPaymentMethod.endsWith('_va')
												? 'border-primary bg-primary/5 ring-1 ring-primary'
												: ''}"
										>
											<button
												class="flex w-full cursor-pointer items-center justify-between p-5 hover:bg-base-200/30"
												onclick={toggleVABanks}
											>
												<div class="flex items-center gap-4">
													<div
														class="flex h-6 w-6 items-center justify-center rounded-full border border-base-300 {selectedPaymentMethod.endsWith(
															'_va'
														)
															? 'border-primary bg-primary'
															: 'bg-base-100'}"
													>
														{#if selectedPaymentMethod.endsWith('_va')}
															<div class="h-2.5 w-2.5 rounded-full bg-white"></div>
														{/if}
													</div>
													<div class="text-left">
														<span class="block font-bold">Virtual Account</span>
														<span class="text-sm text-base-content/60">Bank Transfer & Retail</span>
													</div>
												</div>
												<Store size={28} class="text-base-content/40" />
											</button>

											{#if showVABanks}
												<div class="border-t border-base-200 bg-base-100 p-2" transition:slide>
													<div class="grid gap-2">
														{#each vaBanks as bank}
															<button
																class="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-base-200 {selectedPaymentMethod ===
																bank.value
																	? 'bg-primary/10 text-primary'
																	: ''}"
																onclick={() => selectVA(bank.value)}
															>
																<img
																	src={bank.icon}
																	alt={bank.label}
																	class="h-6 w-auto object-contain"
																/>
																<span class="font-medium">{bank.label}</span>
																{#if selectedPaymentMethod === bank.value}
																	<div class="ml-auto text-primary">
																		<ShieldCheck size={18} />
																	</div>
																{/if}
															</button>
														{/each}
													</div>
												</div>
											{/if}
										</div>
									</div>

									{#if selectedPaymentMethod.endsWith('_va')}
										<div
											class="mt-4 flex items-center gap-3 rounded-xl bg-info/10 p-4 text-sm text-info"
										>
											<Store size={18} />
											<span>Minimal pembayaran Rp10.000 untuk Virtual Account.</span>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Order Summary (Right Column) -->
				<div class="lg:col-span-1">
					<div class="card sticky top-24 border border-base-200 bg-base-100">
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

							<!-- Dynamic Action Button -->
							{#if checkoutStep === 0}
								<button
									class="btn mt-6 w-full rounded-full btn-primary"
									onclick={startCheckout}
									disabled={selectedItems.size === 0}
								>
									{$t('cart.checkout')}
								</button>
							{:else}
								<button
									class="btn mt-6 w-full rounded-full btn-primary"
									onclick={confirmPayment}
									disabled={processing}
								>
									{#if processing}
										<Loader2 class="animate-spin" />
										Processing...
									{:else}
										Confirm Payment
									{/if}
								</button>
							{/if}
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
