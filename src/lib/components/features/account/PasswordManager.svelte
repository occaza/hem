<script lang="ts">
	import { Lock, Loader2 } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';

	let oldPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordLoading = $state(false);

	async function handleUpdatePassword() {
		if (!oldPassword.trim()) {
			toast.error('Password lama harus diisi');
			return;
		}

		if (!newPassword.trim()) {
			toast.error('Password baru harus diisi');
			return;
		}

		if (newPassword === oldPassword) {
			toast.error('Password baru tidak boleh sama dengan password lama');
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error('Password tidak cocok');
			return;
		}

		if (newPassword.length < 6) {
			toast.error('Password minimal 6 karakter');
			return;
		}

		passwordLoading = true;

		try {
			const res = await fetch('/api/profile/update-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					old_password: oldPassword,
					new_password: newPassword
				})
			});

			const data = await res.json();

			if (res.ok) {
				toast.success(data.message);
				oldPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				toast.error(data.error || 'Gagal update password');
			}
		} catch (err) {
			toast.error('Terjadi kesalahan');
		} finally {
			passwordLoading = false;
		}
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="mb-6 text-xl font-bold">Password Manager</h2>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleUpdatePassword();
			}}
			class="max-w-md space-y-6"
		>
			<!-- Hidden username field for accessibility -->
			<input type="text" name="username" autocomplete="username" class="hidden" />

			<div class="form-control">
				<label class="label" for="old_password">
					<span class="label-text font-medium">Old Password</span>
				</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Lock class="h-5 w-5 text-base-content/40" />
					</div>
					<input
						id="old_password"
						type="password"
						name="old_password"
						autocomplete="current-password"
						class="input-bordered input w-full pl-10 focus:input-primary"
						placeholder="••••••••"
						bind:value={oldPassword}
					/>
				</div>
			</div>

			<div class="form-control">
				<label class="label" for="new_password">
					<span class="label-text font-medium">New Password</span>
				</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Lock class="h-5 w-5 text-base-content/40" />
					</div>
					<input
						id="new_password"
						type="password"
						name="new_password"
						autocomplete="new-password"
						class="input-bordered input w-full pl-10 focus:input-primary"
						placeholder="••••••••"
						bind:value={newPassword}
					/>
				</div>
			</div>

			<div class="form-control">
				<label class="label" for="confirm_password">
					<span class="label-text font-medium">Confirm Password</span>
				</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Lock class="h-5 w-5 text-base-content/40" />
					</div>
					<input
						id="confirm_password"
						type="password"
						name="confirm_password"
						autocomplete="new-password"
						class="input-bordered input w-full pl-10 focus:input-primary"
						placeholder="••••••••"
						bind:value={confirmPassword}
					/>
				</div>
			</div>

			<div class="pt-4">
				<button type="submit" class="btn btn-primary" disabled={passwordLoading}>
					{#if passwordLoading}
						<Loader2 class="animate-spin" size={20} />
						Updating...
					{:else}
						Update Password
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
