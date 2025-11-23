<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product } from '$lib/types/types';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { SquarePen, PackagePlus } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';
	import { TriangleAlert, Box, CircleX } from '@lucide/svelte';

	let products = $state<Product[]>([]);
	let loading = $state(true);

	onMount(async () => {
		await loadProducts();
	});

	async function loadProducts() {
		try {
			const res = await fetch('/api/admin/products');
			const data = await res.json();
			products = data;
		} catch (error) {
			console.error('Failed to fetch products:', error);
		} finally {
			loading = false;
		}
	}

	async function updateProductStatus(product: Product, newStatus: 'active' | 'draft' | 'archived') {
		const originalStatus = product.status;
		product.status = newStatus;

		try {
			const res = await fetch(`/api/admin/products/${product.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});

			if (res.ok) {
				toast.success(`Status produk diubah menjadi ${newStatus}`);
			} else {
				// Revert if failed
				product.status = originalStatus;
				toast.error('Gagal mengubah status produk');
			}
		} catch (error) {
			console.error('Update status error:', error);
			product.status = originalStatus;
			toast.error('Terjadi kesalahan');
		}
	}
</script>

<div>
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Produk</h1>
		<a href="/products/add-new" class="btn btn-primary">
			<PackagePlus />
			Tambah Produk
		</a>
	</div>

	{#if loading}
		<div class="flex justify-center">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if products.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
			{#each products as product}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title">{product.name}</h2>
						<p class="text-base-content/70">{product.description}</p>
						<div class="my-2 space-y-2">
							<div class="flex items-center justify-between">
								{#if product.stock === 0}
									<span class="badge gap-1 font-semibold text-white badge-error">
										<CircleX size="16" />
										Stok Habis
									</span>
								{:else if product.stock < 5}
									<span class="badge gap-1 font-semibold badge-warning">
										<TriangleAlert size="16" />
										Stok Menipis: {product.stock}
									</span>
								{:else}
									<span class="badge gap-1 badge-ghost font-medium">
										<Box size="16" />
										Stok: {product.stock}
									</span>
								{/if}
							</div>

							{#if product.discount_percentage && product.discount_percentage > 0}
								<!-- Has discount -->
								<div class="flex flex-col gap-1">
									<div class="text-sm text-base-content/50 line-through">
										{formatCurrency(product.price)}
									</div>
									<div class="flex items-center gap-2 text-2xl font-bold text-error">
										{formatCurrency(product.price * (1 - product.discount_percentage / 100))}
										<span class="badge badge-sm badge-error">-{product.discount_percentage}%</span>
									</div>
								</div>
							{:else}
								<!-- No discount -->
								<div class="text-2xl font-bold text-primary">
									{formatCurrency(product.price)}
								</div>
							{/if}
						</div>

						<div class="mt-4 card-actions items-center justify-between">
							<div class="form-control">
								<select
									class="select-bordered select w-full max-w-xs select-xs"
									value={product.status || 'active'}
									onchange={(e) => updateProductStatus(product, e.currentTarget.value as any)}
								>
									<option value="active">Aktif</option>
									<option value="draft">Draft</option>
									<option value="archived">Arsip</option>
								</select>
							</div>
							<div class="flex gap-2">
								<a href="/products/{product.id}" class="btn btn-outline btn-sm">
									<SquarePen size="16" />
									Edit
								</a>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="alert alert-info">
			<span>Belum ada produk. Tambahkan produk pertama Anda!</span>
		</div>
	{/if}
</div>
