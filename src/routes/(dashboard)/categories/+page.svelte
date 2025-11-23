<script lang="ts">
	import { onMount } from 'svelte';
	import type { Category } from '$lib/types/types';
	import { toast } from '$lib/stores/toast.store';
	import { SquarePen, Plus, Tag } from '@lucide/svelte';

	let categories = $state<Category[]>([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editingCategory = $state<Category | null>(null);

	// Form state
	let formData = $state({
		name: '',
		slug: '',
		icon: '',
		description: '',
		display_order: 0
	});

	onMount(async () => {
		await loadCategories();
	});

	async function loadCategories() {
		try {
			const res = await fetch('/api/admin/categories');
			const data = await res.json();
			categories = data;
		} catch (error) {
			console.error('Failed to fetch categories:', error);
			toast.error('Gagal memuat kategori');
		} finally {
			loading = false;
		}
	}

	function openAddModal() {
		editingCategory = null;
		formData = {
			name: '',
			slug: '',
			icon: '',
			description: '',
			display_order: categories.length
		};
		showModal = true;
	}

	function openEditModal(category: Category) {
		editingCategory = category;
		formData = {
			name: category.name,
			slug: category.slug,
			icon: category.icon || '',
			description: category.description || '',
			display_order: category.display_order
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingCategory = null;
	}

	function generateSlug() {
		formData.slug = formData.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	async function handleSubmit() {
		if (!formData.name || !formData.slug) {
			toast.error('Nama dan slug harus diisi');
			return;
		}

		try {
			const url = editingCategory
				? `/api/admin/categories/${editingCategory.id}`
				: '/api/admin/categories';

			const method = editingCategory ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (res.ok) {
				toast.success(editingCategory ? 'Kategori diperbarui' : 'Kategori ditambahkan');
				await loadCategories();
				closeModal();
			} else {
				const data = await res.json();
				toast.error(data.error || 'Gagal menyimpan kategori');
			}
		} catch (error) {
			console.error('Save category error:', error);
			toast.error('Terjadi kesalahan');
		}
	}

	async function toggleActive(category: Category) {
		const newStatus = !category.is_active;
		category.is_active = newStatus;

		try {
			const res = await fetch(`/api/admin/categories/${category.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ is_active: newStatus })
			});

			if (res.ok) {
				toast.success(`Kategori ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
			} else {
				category.is_active = !newStatus;
				toast.error('Gagal mengubah status');
			}
		} catch (error) {
			console.error('Toggle error:', error);
			category.is_active = !newStatus;
			toast.error('Terjadi kesalahan');
		}
	}
</script>

<div>
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Kategori Produk</h1>
		<button class="btn btn-primary" onclick={openAddModal}>
			<Plus />
			Tambah Kategori
		</button>
	</div>

	{#if loading}
		<div class="flex justify-center">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if categories.length}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each categories as category}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-2">
								{#if category.icon}
									<span class="text-2xl">{category.icon}</span>
								{:else}
									<Tag size="24" class="text-base-content/50" />
								{/if}
								<h2 class="card-title">{category.name}</h2>
							</div>
							<div class="badge badge-sm">{category.display_order}</div>
						</div>

						{#if category.description}
							<p class="text-sm text-base-content/70">{category.description}</p>
						{/if}

						<div class="text-xs text-base-content/50">
							Slug: <code class="rounded bg-base-200 px-1">{category.slug}</code>
						</div>

						<div class="mt-4 card-actions items-center justify-between">
							<div class="form-control">
								<label class="label cursor-pointer gap-2">
									<span class="label-text text-xs">
										{category.is_active ? 'Aktif' : 'Nonaktif'}
									</span>
									<input
										type="checkbox"
										class="toggle toggle-sm toggle-success"
										checked={category.is_active}
										onchange={() => toggleActive(category)}
									/>
								</label>
							</div>
							<button class="btn btn-outline btn-sm" onclick={() => openEditModal(category)}>
								<SquarePen size="16" />
								Edit
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="alert alert-info">
			<span>Belum ada kategori. Tambahkan kategori pertama Anda!</span>
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal-open modal">
		<div class="modal-box">
			<h3 class="text-lg font-bold">
				{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
			</h3>

			<form class="py-4" onsubmit|preventDefault={handleSubmit}>
				<div class="form-control">
					<label class="label">
						<span class="label-text">Nama Kategori *</span>
					</label>
					<input
						type="text"
						class="input-bordered input"
						bind:value={formData.name}
						oninput={generateSlug}
						required
					/>
				</div>

				<div class="form-control mt-4">
					<label class="label">
						<span class="label-text">Slug *</span>
					</label>
					<input type="text" class="input-bordered input" bind:value={formData.slug} required />
				</div>

				<div class="form-control mt-4">
					<label class="label">
						<span class="label-text">Icon (Emoji)</span>
					</label>
					<input type="text" class="input-bordered input" bind:value={formData.icon} />
					<label class="label">
						<span class="label-text-alt">Contoh: 🎮 📱 💻</span>
					</label>
				</div>

				<div class="form-control mt-4">
					<label class="label">
						<span class="label-text">Deskripsi</span>
					</label>
					<textarea class="textarea-bordered textarea" bind:value={formData.description}></textarea>
				</div>

				<div class="form-control mt-4">
					<label class="label">
						<span class="label-text">Urutan Tampilan</span>
					</label>
					<input
						type="number"
						class="input-bordered input"
						bind:value={formData.display_order}
						min="0"
					/>
				</div>

				<div class="modal-action">
					<button type="button" class="btn" onclick={closeModal}>Batal</button>
					<button type="submit" class="btn btn-primary">Simpan</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={closeModal}></div>
	</div>
{/if}
