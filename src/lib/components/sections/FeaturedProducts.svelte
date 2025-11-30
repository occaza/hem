<script lang="ts">
	import ProductCard from '$lib/components/features/products/ProductCard.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import type { Product } from '$lib/types/types';

	interface Props {
		products: Product[];
		title?: string;
		description?: string;
		showViewAll?: boolean;
	}

	let {
		products,
		title = 'Produk unggulan',
		description = 'Jelajahi produk digital terpopuler kami',
		showViewAll = true
	}: Props = $props();
</script>

<section class="bg-base-100 py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 flex items-end justify-between">
			<div class="max-w-xl">
				<h2 class="mb-3 text-3xl font-bold">{title}</h2>
				<p class="text-base-content/60">
					{description}
				</p>
			</div>
			{#if showViewAll}
				<a href="/shop" class="btn gap-2 btn-ghost">
					Lihat Semua
					<ArrowRight size={18} />
				</a>
			{/if}
		</div>

		{#if products && products.length > 0}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{#each products as product}
					<ProductCard {product} />
				{/each}
			</div>
		{:else}
			<div class="rounded-2xl border border-base-300 bg-base-200 p-12 text-center">
				<p class="text-base-content/60">Belum ada produk tersedia</p>
			</div>
		{/if}
	</div>
</section>
