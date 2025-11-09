<!-- src/lib/components/product/ProductCard.svelte -->
<script lang="ts">
	import type { Product } from '$lib/types/types';
	import { formatCurrency } from '$lib/utils/format.utils';

	type Props = {
		product: Product;
		onBuy: (product: Product) => void;
	};

	let { product, onBuy }: Props = $props();
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{product.name}</h2>
		<p class="text-base-content/70">{product.description}</p>
		<div class="my-2 text-2xl font-bold text-primary">
			{formatCurrency(product.price)}
		</div>
		<div class="card-actions justify-end">
			<button class="btn btn-block btn-primary" onclick={() => onBuy(product)}>
				Beli Sekarang
			</button>
		</div>
	</div>
</div>
