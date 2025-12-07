<script lang="ts">
	import type { Product } from '$lib/types/types';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { toast } from '$lib/stores/toast.store';
	import { appliedCoupon } from '$lib/stores/coupon.store';
	import { authUser } from '$lib/stores/auth.store';
	import { t } from 'svelte-i18n';
	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';
	import { locale } from 'svelte-i18n';
	import { getLocalizedText } from '$lib/utils/localization.utils';

	type PaymentMethod = {
		value: string;
		label: string;
		icon: string;
	};

	type Props = {
		product: Product;
		paymentMethods: PaymentMethod[];
		isCartCheckout?: boolean;
		itemCount?: number;
		totalAmount?: number;
		onClose: () => void;
		onSelectQRIS: () => void;
		onSelectOther: (method: string) => void;
	};

	let {
		product,
		paymentMethods,
		isCartCheckout = false,
		itemCount = 1,
		totalAmount,
		onClose,
		onSelectQRIS,
		onSelectOther
	}: Props = $props();

	let selectedMethod = $state('');
	let couponCode = $state('');
	let applyingCoupon = $state(false);

	const user = $derived($authUser);

	const qrisMethod = $derived(PAYMENT_METHODS.find((m) => m.value === 'qris'));
	const otherMethods = $derived(paymentMethods.filter((m) => m.value !== 'qris'));

	// Gunakan totalAmount kalau ada, kalau tidak pakai product.price
	const baseAmount = $derived(totalAmount || product.price);
	const discountAmount = $derived($appliedCoupon ? $appliedCoupon.discount_amount : 0);
	// Jika isCartCheckout, baseAmount sudah dikurangi diskon di parent component
	const displayAmount = $derived(
		isCartCheckout ? baseAmount : Math.max(0, baseAmount - discountAmount)
	);

	async function handleApplyCoupon() {
		if (!couponCode.trim()) {
			toast.error($t('cart.error.enter_coupon'));
			return;
		}

		if (!user) {
			toast.error($t('cart.error.login_coupon'));
			return;
		}

		applyingCoupon = true;
		const success = await appliedCoupon.apply(couponCode.trim().toUpperCase(), baseAmount, user.id);

		if (success) {
			couponCode = '';
		}
		applyingCoupon = false;
	}

	function handleRemoveCoupon() {
		appliedCoupon.remove();
	}

	function handleContinue() {
		if (!selectedMethod || selectedMethod === '') {
			toast.error($t('payment.error.select_method'));
			return;
		}
		onSelectOther(selectedMethod);
	}

	function selectMethod(value: string) {
		if (displayAmount < 10000 && value !== 'qris') {
			toast.error($t('payment.min_amount_warning'), 4000);
			return;
		}
		selectedMethod = value;
	}
</script>

<div class="modal-open modal">
	<div class="modal-box max-w-md">
		<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm" onclick={onClose}>
			✕
		</button>

		<h3 class="mb-4 text-lg font-bold">{$t('payment.select_method')}</h3>

		<!-- Product Summary -->
		<div class="mb-3 rounded-lg bg-base-200 p-4">
			<div class="text-sm text-base-content/70">
				{isCartCheckout
					? `${$t('cart.total_shopping')} (${itemCount} ${$t('cart.item')})`
					: $t('cart.product')}:
			</div>
			{#if !isCartCheckout}
				<div class="font-semibold">{getLocalizedText(product.name, $locale)}</div>
			{/if}
			<div class="mt-2 text-xl font-bold text-primary">
				{formatCurrency(displayAmount)}
			</div>
			{#if $appliedCoupon && !isCartCheckout}
				<div class="mt-2 flex items-center justify-between text-sm text-success">
					<span>{$t('cart.coupon_applied')}: {$appliedCoupon.coupon.code}</span>
					<button class="font-bold hover:underline" onclick={handleRemoveCoupon}>
						{$t('cart.remove')}
					</button>
				</div>
				<div class="text-right text-sm text-success">
					- {formatCurrency(discountAmount)}
				</div>
			{/if}
		</div>

		{#if !isCartCheckout}
			<div class="mb-3 flex gap-2">
				<input
					type="text"
					placeholder={$t('cart.coupon_placeholder')}
					class="input-bordered input input-sm w-full"
					bind:value={couponCode}
				/>
				<button
					class="btn btn-sm btn-primary"
					onclick={handleApplyCoupon}
					disabled={applyingCoupon}
				>
					{#if applyingCoupon}
						<span class="loading loading-xs loading-spinner"></span>
					{/if}
					{$t('cart.apply')}
				</button>
			</div>
		{/if}

		<button class="btn mb-2 btn-block btn-lg btn-primary" onclick={onSelectQRIS}>
			{#if qrisMethod?.icon}
				<img src={qrisMethod.icon} alt="QRIS" class="h-6 w-auto object-contain" />
			{:else}
				<span class="text-lg">📱</span>
			{/if}
			<div class="text-left">
				<div class="font-bold">{qrisMethod?.label || 'QRIS'}</div>
				<div class="text-xs opacity-70">{$t('payment.qris_desc')}</div>
			</div>
		</button>

		<div class="divider text-xs">{$t('payment.or_select_other')}</div>

		{#if displayAmount < 10000}
			<div class="mb-4 alert text-sm alert-warning">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span>{$t('payment.min_amount_warning')}</span>
			</div>
		{/if}

		<!-- Grid of Payment Methods -->
		<div class="mb-3 grid grid-cols-3 gap-2">
			{#each otherMethods as method}
				<button
					class="btn h-auto flex-col gap-2 border-2 p-2 transition-all hover:border-primary {selectedMethod ===
					method.value
						? 'border-primary bg-primary/10'
						: 'border-base-300 bg-base-100'}"
					onclick={() => selectMethod(method.value)}
					disabled={displayAmount < 10000}
				>
					<img src={method.icon} alt={method.label} class="h-8 w-auto object-contain" />
					<span class="text-xs font-medium">{method.label}</span>
				</button>
			{/each}
		</div>

		<button
			class="btn btn-block btn-outline"
			onclick={handleContinue}
			disabled={!selectedMethod || selectedMethod === '' || displayAmount < 10000}
		>
			{$t('payment.continue_payment')}
		</button>
	</div>
</div>
