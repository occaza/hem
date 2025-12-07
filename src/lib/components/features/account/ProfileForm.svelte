<script lang="ts">
	import { Camera, Loader2 } from '@lucide/svelte';
	import { uploadAvatar, deleteAvatar } from '$lib/utils/avatar.utils';
	import { toast } from '$lib/stores/toast.store';
	import { confirmDelete } from '$lib/utils/swal.utils';

	let { data } = $props();

	let profile = $state({
		full_name: data.user.full_name || '',
		username: data.user.username || '',
		email: data.user.email || '',
		phone_number: data.user.phone_number || '',
		avatar_url: data.user.avatar_url || '',
		bio: data.user.bio || ''
	});

	let uploadingAvatar = $state(false);
	let saving = $state(false);

	// Avatar Handling
	async function handleAvatarUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || !input.files[0]) return;

		const file = input.files[0];
		uploadingAvatar = true;

		const result = await uploadAvatar(file, data.user.id);

		if (result.success && result.url) {
			profile.avatar_url = result.url;
			await saveProfile(true); // Auto save after upload
		} else {
			toast.error(result.error || 'Upload gagal');
		}

		uploadingAvatar = false;
	}

	async function handleRemoveAvatar() {
		const confirmed = await confirmDelete('foto profile');
		if (!confirmed) return;

		uploadingAvatar = true;
		await deleteAvatar(data.user.id);
		profile.avatar_url = '';
		await saveProfile(true);
		uploadingAvatar = false;
	}

	// Profile Update
	async function saveProfile(silent = false) {
		if (!silent) saving = true;

		try {
			const res = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(profile)
			});

			if (res.ok) {
				if (!silent) toast.success('Profile berhasil diupdate');
			} else {
				const data = await res.json();
				toast.error(data.error || 'Gagal update profile');
			}
		} catch (err) {
			toast.error('Terjadi kesalahan');
		} finally {
			saving = false;
		}
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<!-- Avatar Section -->
		<div class="mb-8 flex flex-col items-center">
			<div class="group relative">
				<div class="avatar">
					<div class="w-32 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
						{#if profile.avatar_url}
							<img src={profile.avatar_url} alt="Avatar" />
						{:else}
							<div
								class="grid h-full w-full place-items-center bg-neutral text-4xl font-bold text-neutral-content"
							>
								{profile.full_name?.charAt(0) || 'U'}
							</div>
						{/if}
					</div>
				</div>
				<label
					class="btn absolute right-0 bottom-0 btn-circle cursor-pointer shadow-lg btn-sm btn-primary"
					class:loading={uploadingAvatar}
				>
					{#if !uploadingAvatar}
						<Camera size={16} />
					{/if}
					<input
						type="file"
						class="hidden"
						accept="image/*"
						onchange={handleAvatarUpload}
						disabled={uploadingAvatar}
					/>
				</label>
			</div>
			{#if profile.avatar_url}
				<button
					class="btn mt-2 text-error btn-ghost btn-xs"
					onclick={handleRemoveAvatar}
					disabled={uploadingAvatar}
				>
					Hapus Foto
				</button>
			{/if}
		</div>

		<!-- Form -->
		<form
			onsubmit={(e) => {
				e.preventDefault();
				saveProfile();
			}}
			class="space-y-6"
		>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="form-control">
					<label class="label" for="full_name">
						<span class="label-text font-medium">Full Name *</span>
					</label>
					<input
						id="full_name"
						type="text"
						class="input-bordered input w-full focus:input-primary"
						bind:value={profile.full_name}
						placeholder="John Doe"
					/>
				</div>

				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text font-medium">Email *</span>
					</label>
					<input
						id="email"
						type="email"
						class="input-bordered input w-full bg-base-200"
						value={profile.email}
						readonly
					/>
				</div>

				<div class="form-control">
					<label class="label" for="phone">
						<span class="label-text font-medium">Phone Number *</span>
					</label>
					<input
						id="phone"
						type="tel"
						class="input-bordered input w-full focus:input-primary"
						bind:value={profile.phone_number}
						placeholder="+62..."
					/>
				</div>

				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text font-medium">Username *</span>
					</label>
					<input
						id="username"
						type="text"
						class="input-bordered input w-full focus:input-primary"
						bind:value={profile.username}
						placeholder="username"
					/>
				</div>
			</div>

			<div class="form-control flex flex-col">
				<label class="label" for="bio">
					<span class="label-text font-medium">Bio</span>
				</label>
				<textarea
					id="bio"
					class="textarea-bordered textarea h-24 w-full resize-none focus:textarea-primary"
					bind:value={profile.bio}
					placeholder="Self reminder"
				></textarea>
			</div>

			<div class="pt-4">
				<button type="submit" class="btn px-8 btn-primary" disabled={saving}>
					{#if saving}
						<Loader2 class="animate-spin" size={20} />
						Saving...
					{:else}
						Update Changes
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
