<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Product } from '$lib/types/types';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { calculateDiscountedPrice, isDiscountActive, isInStock } from '$lib/utils/product.utils';
	import { cartStore } from '$lib/stores/cart.store';
	import { authUser } from '$lib/stores/auth.store';
	import { ShoppingBag } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';
	import { confirmLogin } from '$lib/utils/swal.utils';
	import { t, locale } from 'svelte-i18n';
	import { getLocalizedText } from '$lib/utils/localization.utils';

	type Props = {
		product: Product;
		onBuy?: (product: Product) => void;
		showAddToCart?: boolean;
	};

	let { product, onBuy, showAddToCart = false }: Props = $props();

	let addingToCart = $state(false);
	const user = $derived($authUser);

	const hasDiscount = $derived(isDiscountActive(product));
	const finalPrice = $derived(calculateDiscountedPrice(product));
	const inStock = $derived(isInStock(product));

	const productImage = $derived(
		product.images && Array.isArray(product.images) && product.images.length > 0
			? product.images[0]
			: 'https://placehold.co/400x300?text=No+Image'
	);

	async function handleAddToCart(e: Event) {
		e.stopPropagation();
		if (!user) {
			const confirmed = await confirmLogin($t('shop.confirm_login_action'));
			if (confirmed) {
				goto('/login');
			}
			return;
		}

		addingToCart = true;
		const success = await cartStore.addItem(product, 1);
		if (success) {
			toast.success($t('shop.success_add_to_cart'));
		} else {
			toast.error($t('shop.error_add_to_cart'));
		}
		addingToCart = false;
	}

	function handleCardClick() {
		const identifier = product.slug || product.id;
		goto(`/shop/${identifier}`);
	}
</script>

<div
	class="group relative cursor-pointer transition-all duration-300"
	onclick={handleCardClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleCardClick()}
>
	<!-- Image Container -->
	<div class="relative mb-3 aspect-square overflow-hidden rounded-lg bg-base-200">
		<img
			src={productImage}
			alt={getLocalizedText(product.name, $locale)}
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
			loading="lazy"
		/>

		<!-- Badges -->
		<div class="absolute top-3 left-3 flex flex-col gap-2">
			{#if hasDiscount && product.discount_percentage}
				<span class="badge border-none font-bold text-white badge-secondary">
					{product.discount_percentage}% {$t('shop.off')}
				</span>
			{/if}
			{#if !inStock}
				<span class="badge font-bold text-white badge-neutral">{$t('shop.out_of_stock')}</span>
			{/if}
		</div>

		<!-- Hover Actions -->
		<div
			class="absolute top-3 right-3 flex translate-x-10 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
		>
			{#if inStock}
				<button
					class="btn btn-circle border-none bg-white text-base-content shadow-sm btn-sm hover:bg-primary hover:text-white"
					onclick={handleAddToCart}
					disabled={addingToCart}
				>
					{#if addingToCart}
						<span class="loading loading-xs loading-spinner"></span>
					{:else}
						<ShoppingBag size={16} />
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<!-- Content -->
	<div class="space-y-1">
		{#if product.categories && product.categories.length > 0}
			<div class="text-xs text-base-content/60">{product.categories[0].name}</div>
		{/if}

		<h3 class="font-medium text-base-content transition-colors group-hover:text-primary">
			{getLocalizedText(product.name, $locale)}
		</h3>

		<div class="flex items-center gap-2">
			{#if hasDiscount}
				<span class="font-medium text-base-content">{formatCurrency(finalPrice)}</span>
				<span class="text-sm text-base-content/40 line-through"
					>{formatCurrency(product.price)}</span
				>
			{:else}
				<span class="font-medium text-base-content">{formatCurrency(product.price)}</span>
			{/if}
		</div>
	</div>
</div>
