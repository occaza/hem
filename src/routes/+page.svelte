<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product } from '$lib/types/types';

	let products: Product[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const res = await fetch('/api/products');
			const data = await res.json();
			products = data;
		} catch (error) {
			console.error('Failed to fetch products:', error);
		} finally {
			loading = false;
		}
	});

	async function checkout(productId: string) {
		const orderId = `ORDER_${Date.now()}`;

		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ product_id: productId, order_id: orderId })
			});

			const data = await res.json();

			if (data.redirectUrl) {
				window.location.href = data.redirectUrl;
			} else {
				alert('Gagal membuat transaksi. Silakan coba lagi.');
			}
		} catch (error) {
			console.error('Checkout error:', error);
			alert('Terjadi kesalahan. Silakan coba lagi.');
		}
	}
</script>

<main>
	<h1>Produk Kami</h1>

	{#if loading}
		<p>Memuat produk...</p>
	{:else if products.length}
		<div class="products">
			{#each products as product}
				<div class="product-card">
					<h2>{product.name}</h2>
					<p class="description">{product.description}</p>
					<p class="price">Rp{product.price.toLocaleString('id-ID')}</p>
					<button on:click={() => checkout(product.id)}>Beli Sekarang</button>
				</div>
			{/each}
		</div>
	{:else}
		<p>Tidak ada produk tersedia.</p>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
	}

	.products {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.product-card {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 1.5rem;
		transition: box-shadow 0.2s;
	}

	.product-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.product-card h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
	}

	.description {
		color: #666;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.price {
		font-size: 1.5rem;
		font-weight: bold;
		color: #2563eb;
		margin-bottom: 1rem;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover {
		background: #1d4ed8;
	}

	button:active {
		background: #1e40af;
	}
</style>
