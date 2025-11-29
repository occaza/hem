<script lang="ts">
	import type { Category } from '$lib/types/types';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';

	type Props = {
		categories: Category[];
		selectedCategory: string | null;
		minPrice: number | null;
		maxPrice: number | null;
		onSelectCategory: (slug: string | null) => void;
		onApplyFilter: (min: number | null, max: number | null) => void;
	};

	let {
		categories,
		selectedCategory,
		minPrice = null,
		maxPrice = null,
		onSelectCategory,
		onApplyFilter
	}: Props = $props();

	let localMin = $state(minPrice);
	let localMax = $state(maxPrice);
	let isOpen = $state(false);

	function handleApply() {
		onApplyFilter(localMin, localMax);
	}

	function handleReset() {
		localMin = null;
		localMax = null;
		onApplyFilter(null, null);
		onSelectCategory(null);
	}

	function toggleFilter() {
		isOpen = !isOpen;
	}
</script>

<div class="card h-fit bg-base-100 shadow-sm">
	<!-- Toggle Button for Tablet/Mobile -->
	<button
		class="btn w-full justify-between btn-ghost lg:hidden"
		onclick={toggleFilter}
		aria-label="Toggle filter"
	>
		<span class="text-lg font-bold">Filter</span>
		{#if isOpen}
			<ChevronUp size={20} />
		{:else}
			<ChevronDown size={20} />
		{/if}
	</button>

	<!-- Filter Content -->
	<div class="card-body p-4 {isOpen ? 'block' : 'hidden lg:block'}">
		<div class="mb-4 hidden items-center justify-between lg:flex">
			<h3 class="text-lg font-bold">Filter</h3>
			{#if selectedCategory || localMin || localMax}
				<button class="btn text-error btn-ghost btn-xs" onclick={handleReset}> Reset </button>
			{/if}
		</div>

		<!-- Categories -->
		<div class="mb-6">
			<h4 class="mb-2 text-sm font-semibold">Kategori</h4>
			<div class="flex flex-col gap-1">
				<button
					class="btn justify-start btn-sm {selectedCategory === null ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => onSelectCategory(null)}
				>
					Semua Produk
				</button>
				{#each categories as category}
					<button
						class="btn justify-start btn-sm {selectedCategory === category.slug
							? 'btn-primary'
							: 'btn-ghost'}"
						onclick={() => onSelectCategory(category.slug)}
					>
						{category.name}
					</button>
				{/each}
			</div>
		</div>

		<div class="divider my-2"></div>

		<!-- Price Range -->
		<div>
			<h4 class="mb-2 text-sm font-semibold">Harga</h4>
			<div class="space-y-3">
				<div class="form-control">
					<label class="label py-1" for="min-price">
						<span class="label-text text-xs">Minimum</span>
					</label>
					<label class="input-bordered input input-sm flex items-center gap-2">
						<span class="text-xs text-base-content/50">Rp</span>
						<input
							type="number"
							id="min-price"
							name="min_price"
							autocomplete="off"
							class="grow"
							placeholder="0"
							bind:value={localMin}
						/>
					</label>
				</div>
				<div class="form-control">
					<label class="label py-1" for="max-price">
						<span class="label-text text-xs">Maksimum</span>
					</label>
					<label class="input-bordered input input-sm flex items-center gap-2">
						<span class="text-xs text-base-content/50">Rp</span>
						<input
							type="number"
							id="max-price"
							name="max_price"
							autocomplete="off"
							class="grow"
							placeholder="Max"
							bind:value={localMax}
						/>
					</label>
				</div>
				<button class="btn mt-2 btn-block btn-sm btn-primary" onclick={handleApply}>
					Terapkan
				</button>
			</div>
		</div>
	</div>
</div>
