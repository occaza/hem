<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let name = $state('');
	let description = $state('');
	let price = $state(0);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');

	const productId = $derived($page.params.id);

	onMount(async () => {
		try {
			const res = await fetch(`/api/admin/products/${productId}`);
			if (res.ok) {
				const data = await res.json();
				name = data.name;
				description = data.description;
				price = data.price;
			} else {
				error = 'Produk tidak ditemukan';
			}
		} catch (err) {
			error = 'Gagal memuat produk';
		} finally {
			loading = false;
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!name || !description || price <= 0) {
			error = 'Semua field harus diisi dengan benar';
			return;
		}

		saving = true;

		try {
			const res = await fetch(`/api/admin/products/${productId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, description, price })
			});

			if (res.ok) {
				goto('/products');
			} else {
				const data = await res.json();
				error = data.error || 'Gagal mengupdate produk';
			}
		} catch (err) {
			error = 'Terjadi kesalahan';
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<div class="mb-8">
		<a href="/products" class="btn btn-ghost btn-sm">
			<span>←</span>
			Kembali
		</a>
	</div>

	{#if loading}
		<div class="flex justify-center">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if error && !name}
		<div class="alert alert-error">
			<span>{error}</span>
		</div>
	{:else}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-2xl">Edit Produk</h2>

				{#if error}
					<div class="alert alert-error">
						<span>{error}</span>
					</div>
				{/if}

				<form onsubmit={handleSubmit}>
					<div class="form-control">
						<label class="label" for="name">
							<span class="label-text">Nama Produk</span>
						</label>
						<input
							id="name"
							type="text"
							placeholder="Contoh: Paket Hosting Premium"
							class="input-bordered input"
							bind:value={name}
							required
						/>
					</div>

					<div class="form-control mt-4">
						<label class="label" for="description">
							<span class="label-text">Deskripsi</span>
						</label>
						<textarea
							id="description"
							placeholder="Deskripsi produk..."
							class="textarea-bordered textarea h-24"
							bind:value={description}
							required
						></textarea>
					</div>

					<div class="form-control mt-4">
						<label class="label" for="price">
							<span class="label-text">Harga (Rp)</span>
						</label>
						<input
							id="price"
							type="number"
							placeholder="50000"
							class="input-bordered input"
							bind:value={price}
							min="0"
							step="1000"
							required
						/>
						<label class="label" for="price">
							<span class="label-text-alt">Masukkan harga dalam Rupiah</span>
						</label>
					</div>

					<div class="mt-6 card-actions justify-end">
						<a href="/products" class="btn btn-ghost">Batal</a>
						<button type="submit" class="btn btn-primary" disabled={saving}>
							{#if saving}
								<span class="loading loading-sm loading-spinner"></span>
								Menyimpan...
							{:else}
								Update Produk
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
