<script lang="ts">
	import type { Category } from '$lib/types/types';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';

	type Props = {
		categories: Category[];
		selectedCategory: string | null;
		minPrice: number | null;
		maxPrice: number | null;
		availability: string[];
		onSelectCategory: (slug: string | null) => void;
		onApplyFilter: (min: number | null, max: number | null) => void;
		onToggleAvailability: (status: string) => void;
	};

	let {
		categories,
		selectedCategory,
		minPrice = null,
		maxPrice = null,
		availability = [],
		onSelectCategory,
		onApplyFilter,
		onToggleAvailability
	}: Props = $props();

	let localMin = $state(minPrice);
	let localMax = $state(maxPrice);
	let isOpen = $state(false);

	function handleApply() {
		onApplyFilter(localMin, localMax);
	}

	function toggleFilter() {
		isOpen = !isOpen;
	}
</script>

<div class="h-fit">
	<!-- Mobile Toggle -->
	<button
		class="btn mb-4 w-full justify-between btn-outline lg:hidden"
		onclick={toggleFilter}
		aria-label="Toggle filter"
	>
		<span class="text-lg font-bold">Filter Options</span>
		{#if isOpen}
			<ChevronUp size={20} />
		{:else}
			<ChevronDown size={20} />
		{/if}
	</button>

	<!-- Filter Content -->
	<div class="{isOpen ? 'block' : 'hidden lg:block'} space-y-8">
		<h3 class="mb-4 hidden text-xl font-bold lg:block">Filter Options</h3>

		<!-- Categories -->
		<div>
			<h4 class="mb-4 text-base font-bold">By Category</h4>
			<div class="flex flex-col gap-3">
				<label class="group flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						class="checkbox rounded-none checkbox-sm checkbox-primary"
						checked={selectedCategory === null}
						onchange={() => onSelectCategory(null)}
					/>
					<span class="text-base-content/70 transition-colors group-hover:text-primary"
						>All Products</span
					>
				</label>
				{#each categories as category}
					<label class="group flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							class="checkbox rounded-none checkbox-sm checkbox-primary"
							checked={selectedCategory === category.slug}
							onchange={() => onSelectCategory(category.slug)}
						/>
						<span class="text-base-content/70 transition-colors group-hover:text-primary"
							>{category.name}</span
						>
					</label>
				{/each}
			</div>
		</div>

		<div class="divider"></div>

		<!-- Price Range -->
		<div>
			<h4 class="mb-4 text-base font-bold">Price</h4>
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<div class="relative w-full">
						<span class="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-base-content/50"
							>Rp</span
						>
						<input
							type="number"
							class="input-bordered input input-sm w-full pl-8"
							placeholder="Min"
							bind:value={localMin}
						/>
					</div>
					<span class="text-base-content/50">-</span>
					<div class="relative w-full">
						<span class="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-base-content/50"
							>Rp</span
						>
						<input
							type="number"
							class="input-bordered input input-sm w-full pl-8"
							placeholder="Max"
							bind:value={localMax}
						/>
					</div>
				</div>
				<button class="btn w-full rounded-full btn-sm btn-primary" onclick={handleApply}>
					Apply Price
				</button>
			</div>
		</div>

		<div class="divider"></div>

		<!-- Availability -->
		<div>
			<h4 class="mb-4 text-base font-bold">Availability</h4>
			<div class="flex flex-col gap-3">
				<label class="group flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						class="checkbox rounded-none checkbox-sm checkbox-primary"
						checked={availability.includes('in_stock')}
						onchange={() => onToggleAvailability('in_stock')}
					/>
					<span class="text-base-content/70 transition-colors group-hover:text-primary"
						>In Stock</span
					>
				</label>
				<label class="group flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						class="checkbox rounded-none checkbox-sm checkbox-primary"
						checked={availability.includes('out_of_stock')}
						onchange={() => onToggleAvailability('out_of_stock')}
					/>
					<span class="text-base-content/70 transition-colors group-hover:text-primary"
						>Out of Stock</span
					>
				</label>
			</div>
		</div>
	</div>
</div>
