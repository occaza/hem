<script lang="ts">
	import type { Category } from '$lib/types/types';
	import { ChevronDown, ChevronUp, BadgePercent } from '@lucide/svelte';
	import { t } from 'svelte-i18n';

	type Props = {
		categories: Category[];
		selectedCategory: string | null;
		minPrice: number | null;
		maxPrice: number | null;
		availability: string[];
		onDiscount: boolean;
		onSelectCategory: (slug: string | null) => void;
		onApplyFilter: (min: number | null, max: number | null) => void;
		onToggleAvailability: (status: string) => void;
		onToggleDiscount: () => void;
	};

	let {
		categories,
		selectedCategory,
		minPrice = null,
		maxPrice = null,
		availability = [],
		onDiscount = false,
		onSelectCategory,
		onApplyFilter,
		onToggleAvailability,
		onToggleDiscount
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
		<span class="text-lg font-bold">{$t('shop.filter')}</span>
		{#if isOpen}
			<ChevronUp size={20} />
		{:else}
			<ChevronDown size={20} />
		{/if}
	</button>

	<!-- Filter Content -->
	<div class="{isOpen ? 'block' : 'hidden lg:block'} space-y-8">
		<h3 class="mb-4 hidden text-xl font-bold lg:block">{$t('shop.filter')}</h3>

		<!-- Categories -->
		<div>
			<h4 class="mb-4 text-base font-bold">{$t('shop.by_category')}</h4>
			<div class="flex flex-col gap-3">
				<label class="group flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						class="checkbox rounded-none checkbox-sm checkbox-primary"
						checked={selectedCategory === null}
						onchange={() => onSelectCategory(null)}
					/>
					<span class="text-base-content/70 transition-colors group-hover:text-primary"
						>{$t('shop.all_products')}</span
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

		<!-- Discount -->
		<div>
			<h4 class="mb-4 text-base font-bold">{$t('shop.promo')}</h4>
			<div class="flex flex-col gap-3">
				<label class="group flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						class="checkbox rounded-none checkbox-sm checkbox-primary"
						checked={onDiscount}
						onchange={onToggleDiscount}
					/>
					<BadgePercent size={18} class="text-primary" />
					<span class="text-base-content/70 transition-colors group-hover:text-primary"
						>{$t('shop.on_discount')}</span
					>
				</label>
			</div>
		</div>

		<div class="divider"></div>

		<!-- Price Range -->
		<div>
			<h4 class="mb-4 text-base font-bold">{$t('shop.price')}</h4>
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<div class="relative w-full">
						<span class="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-base-content/50"
							>Rp</span
						>
						<input
							type="number"
							class="input-bordered input input-sm w-full pl-8"
							placeholder={$t('shop.min')}
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
							placeholder={$t('shop.max')}
							bind:value={localMax}
						/>
					</div>
				</div>
				<button class="btn w-full rounded-full btn-sm btn-primary" onclick={handleApply}>
					{$t('shop.apply_price')}
				</button>
			</div>
		</div>

		<div class="divider"></div>

		<!-- Availability -->
		<div>
			<h4 class="mb-4 text-base font-bold">{$t('shop.availability')}</h4>
			<div class="flex flex-col gap-3">
				<label class="group flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						class="checkbox rounded-none checkbox-sm checkbox-primary"
						checked={availability.includes('in_stock')}
						onchange={() => onToggleAvailability('in_stock')}
					/>
					<span class="text-base-content/70 transition-colors group-hover:text-primary"
						>{$t('shop.in_stock')}</span
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
						>{$t('shop.out_of_stock')}</span
					>
				</label>
			</div>
		</div>
	</div>
</div>
