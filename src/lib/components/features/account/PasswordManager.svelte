<script lang="ts">
	import { Lock, Loader2 } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';
	import { t } from 'svelte-i18n';

	let oldPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordLoading = $state(false);

	async function handleUpdatePassword() {
		if (!oldPassword.trim()) {
			toast.error($t('account.password_manager.error.old_required'));
			return;
		}

		if (!newPassword.trim()) {
			toast.error($t('account.password_manager.error.new_required'));
			return;
		}

		if (newPassword === oldPassword) {
			toast.error($t('account.password_manager.error.same_password'));
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error($t('account.password_manager.error.mismatch'));
			return;
		}

		if (newPassword.length < 6) {
			toast.error($t('account.password_manager.error.min_length'));
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
				toast.error(data.error || $t('account.password_manager.error.generic'));
			}
		} catch (err) {
			toast.error($t('account.password_manager.error.error_occurred'));
		} finally {
			passwordLoading = false;
		}
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="mb-6 text-xl font-bold">{$t('account.password_manager.title')}</h2>

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
					<span class="label-text font-medium"
						>{$t('account.password_manager.old_password_label')}</span
					>
				</label>
				<div class="relative">
					<input
						id="old_password"
						type="password"
						name="old_password"
						autocomplete="current-password"
						class="input-bordered input w-full pl-10 focus:input-primary"
						placeholder={$t('account.password_manager.old_password_placeholder')}
						bind:value={oldPassword}
					/>
					<div class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
						<Lock class="h-5 w-5 text-base-content/40" />
					</div>
				</div>
			</div>

			<div class="form-control">
				<label class="label" for="new_password">
					<span class="label-text font-medium"
						>{$t('account.password_manager.new_password_label')}</span
					>
				</label>
				<div class="relative">
					<input
						id="new_password"
						type="password"
						name="new_password"
						autocomplete="new-password"
						class="input-bordered input w-full pl-10 focus:input-primary"
						placeholder={$t('account.password_manager.new_password_placeholder')}
						bind:value={newPassword}
					/>
					<div class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
						<Lock class="h-5 w-5 text-base-content/40" />
					</div>
				</div>
			</div>

			<div class="form-control">
				<label class="label" for="confirm_password">
					<span class="label-text font-medium"
						>{$t('account.password_manager.confirm_password_label')}</span
					>
				</label>
				<div class="relative">
					<input
						id="confirm_password"
						type="password"
						name="confirm_password"
						autocomplete="new-password"
						class="input-bordered input w-full pl-10 focus:input-primary"
						placeholder={$t('account.password_manager.confirm_password_placeholder')}
						bind:value={confirmPassword}
					/>
					<div class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
						<Lock class="h-5 w-5 text-base-content/40" />
					</div>
				</div>
			</div>

			<div class="pt-4">
				<button type="submit" class="btn btn-primary" disabled={passwordLoading}>
					{#if passwordLoading}
						<Loader2 class="animate-spin" size={20} />
						{$t('account.password_manager.updating')}
					{:else}
						{$t('account.password_manager.update_button')}
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
