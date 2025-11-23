<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product } from '$lib/types/types';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { SquarePen, Trash2, PackagePlus } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';

	let products = $state<Product[]>([]);
	let loading = $state(true);
	let deleteLoading = $state<string | null>(null);

	onMount(async () => {
		await loadProducts();
	});

	async function loadProducts() {
		try {
			const res = await fetch('/api/products');
			const data = await res.json();
			products = data;
		} catch (error) {
			console.error('Failed to fetch products:', error);
		} finally {
			loading = false;
		}
	}

	async function deleteProduct(id: string) {
		if (!confirm('Yakin ingin menghapus produk ini?')) return;

		deleteLoading = id;
		try {
			const res = await fetch(`/api/admin/products/${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				await loadProducts();
			} else {
				toast.error('Gagal menghapus produk');
			}
		} catch (error) {
			console.error('Delete error:', error);
			toast.error('Terjadi kesalahan');
		} finally {
			deleteLoading = null;
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
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line
												x1="9"
												y1="9"
												x2="15"
												y2="15"
											/></svg
										>
										Stok Habis
									</span>
								{:else if product.stock < 5}
									<span class="badge gap-1 font-semibold badge-warning">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path
												d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
											/><line x1="12" y1="9" x2="12" y2="13" /><line
												x1="12"
												y1="17"
												x2="12.01"
												y2="17"
											/></svg
										>
										Stok Menipis: {product.stock}
									</span>
								{:else}
									<span class="badge gap-1 badge-ghost font-medium">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path
												d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
											/><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line
												x1="12"
												y1="22.08"
												x2="12"
												y2="12"
											/></svg
										>
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
						<div class="card-actions justify-end">
							<a href="/products/{product.id}" class="btn btn-outline btn-sm">
								<SquarePen size="16" />
								Edit
							</a>
							<button
								class="btn btn-sm btn-error"
								onclick={() => deleteProduct(product.id)}
								disabled={deleteLoading === product.id}
							>
								{#if deleteLoading === product.id}
									<span class="loading loading-sm loading-spinner"></span>
								{:else}
									<Trash2 size="16" />
									Hapus
								{/if}
							</button>
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
