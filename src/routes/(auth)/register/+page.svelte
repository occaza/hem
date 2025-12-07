<script lang="ts">
	import { goto } from '$app/navigation';
	import { getSupabaseClient } from '$lib/client/supabase';
	import { Eye, EyeOff } from '@lucide/svelte';
	import Turnstile from '$lib/components/ui/Turnstile.svelte';
	import { fetchWithCSRF } from '$lib/utils/csrf.utils';
	import { t } from 'svelte-i18n';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let fullName = $state('');
	let username = $state('');
	let phoneNumber = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);
	let successMessage = $state('');
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let turnstileToken = $state('');
	let turnstileRef: any = $state(null);

	function toTitleCase(str: string) {
		return str.replace(/\w\S*/g, (txt) => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	async function handleRegister() {
		loading = true;
		error = '';

		// Verify Turnstile token first
		if (!turnstileToken) {
			error = $t('auth.register.error.turnstile_required');
			loading = false;
			return;
		}

		try {
			const verifyRes = await fetch('/api/auth/verify-turnstile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: turnstileToken })
			});

			if (!verifyRes.ok) {
				error = $t('auth.register.error.turnstile_failed');
				loading = false;
				turnstileToken = '';
				turnstileRef?.reset();
				return;
			}
		} catch (err) {
			error = $t('auth.register.error.turnstile_failed');
			loading = false;
			turnstileToken = '';
			turnstileRef?.reset();
			return;
		}

		if (!fullName.trim()) {
			error = $t('auth.register.error.full_name_required');
			loading = false;
			return;
		}

		// Auto-capitalize Full Name
		fullName = toTitleCase(fullName);

		if (!username.trim()) {
			error = $t('auth.register.error.username_required');
			loading = false;
			return;
		}

		if (username.includes(' ')) {
			error = $t('auth.register.error.username_no_space');
			loading = false;
			return;
		}

		if (!phoneNumber.trim()) {
			error = $t('auth.register.error.phone_required');
			loading = false;
			return;
		}

		if (!/^[0-9+\-\s()]+$/.test(phoneNumber)) {
			error = $t('auth.register.error.phone_invalid');
			loading = false;
			return;
		}

		if (password !== confirmPassword) {
			error = $t('auth.register.error.password_mismatch');
			loading = false;
			return;
		}

		if (password.length < 6) {
			error = $t('auth.register.error.password_min_length');
			loading = false;
			return;
		}

		try {
			const res = await fetchWithCSRF('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password,
					full_name: fullName.trim(),
					username: username.trim(),
					phone_number: phoneNumber.trim()
				})
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || $t('auth.register.error.generic');
				return;
			}

			success = true;
			successMessage = data.message;

			// Redirect setelah 5 detik
			setTimeout(() => {
				goto('/login');
			}, 5000);
		} catch (err) {
			error = err instanceof Error ? err.message : $t('auth.register.error.generic');
			turnstileToken = '';
			turnstileRef?.reset();
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('auth.register.page_title')}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-200 px-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body space-y-4">
			<h2 class="card-title text-center text-2xl font-bold">{$t('auth.register.title')}</h2>

			{#if success}
				<div class="alert alert-success">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div>
						<div class="font-bold">{$t('auth.register.success_title')}</div>
						<div class="text-sm">{successMessage}</div>
						<div class="mt-2 text-xs text-success-content/70">
							{$t('auth.register.redirect_msg')}
						</div>
					</div>
				</div>

				<div class="text-center">
					<p class="text-sm text-base-content/70">{$t('auth.register.no_email_msg')}</p>
					<p class="text-xs text-base-content/50">{$t('auth.register.check_spam_msg')}</p>
				</div>
			{:else}
				{#if error}
					<div class="alert alert-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{error}</span>
					</div>
				{/if}

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleRegister();
					}}
					class="space-y-4"
				>
					<div class="form-control">
						<label class="label" for="fullName">
							<span class="label-text">{$t('auth.register.full_name_label')}</span>
						</label>
						<input
							id="fullName"
							type="text"
							placeholder={$t('auth.register.full_name_placeholder')}
							class="input-bordered input w-full"
							bind:value={fullName}
							autocomplete="name"
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="username">
							<span class="label-text">{$t('auth.register.username_label')}</span>
						</label>
						<input
							id="username"
							type="text"
							placeholder={$t('auth.register.username_placeholder')}
							class="input-bordered input w-full"
							bind:value={username}
							autocomplete="username"
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="phoneNumber">
							<span class="label-text">{$t('auth.register.phone_label')}</span>
						</label>
						<input
							id="phoneNumber"
							type="tel"
							placeholder={$t('auth.register.phone_placeholder')}
							class="input-bordered input w-full"
							autocomplete="tel"
							bind:value={phoneNumber}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="email">
							<span class="label-text">{$t('auth.register.email_label')}</span>
						</label>
						<input
							id="email"
							type="email"
							placeholder={$t('auth.register.email_placeholder')}
							class="input-bordered input w-full"
							autocomplete="email"
							bind:value={email}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="password">
							<span class="label-text">{$t('auth.register.password_label')}</span>
						</label>

						<div class="relative flex items-center">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder={$t('auth.register.password_placeholder')}
								class="input-bordered input w-full pr-12"
								autocomplete="new-password"
								bind:value={password}
								required
							/>

							<button
								type="button"
								class="btn absolute right-3 btn-circle btn-ghost btn-xs"
								onclick={() => (showPassword = !showPassword)}
							>
								{#if showPassword}
									<EyeOff size="16" />
								{:else}
									<Eye size="16" />
								{/if}
							</button>
						</div>

						<div class="label">
							<span class="label-text-alt">{$t('auth.register.password_min_length')}</span>
						</div>
					</div>

					<div class="form-control">
						<label class="label" for="confirmPassword">
							<span class="label-text">{$t('auth.register.confirm_password_label')}</span>
						</label>

						<div class="relative">
							<input
								id="confirmPassword"
								type={showConfirm ? 'text' : 'password'}
								placeholder={$t('auth.register.password_placeholder')}
								class="input-bordered input w-full pr-12"
								autocomplete="new-password"
								bind:value={confirmPassword}
								required
							/>

							<button
								type="button"
								class="btn absolute top-1/2 right-2 -translate-y-1/2 btn-ghost btn-xs"
								onclick={() => (showConfirm = !showConfirm)}
							>
								{#if showConfirm}
									<EyeOff size="16" />
								{:else}
									<Eye size="16" />
								{/if}
							</button>
						</div>
					</div>

					<!-- Turnstile Widget -->
					<div class="form-control">
						<Turnstile
							bind:this={turnstileRef}
							onVerify={(token) => (turnstileToken = token)}
							onError={() => {
								turnstileToken = '';
								error = $t('auth.register.error.turnstile_failed');
							}}
							onExpire={() => {
								turnstileToken = '';
							}}
						/>
					</div>

					<button
						type="submit"
						class="btn w-full btn-primary"
						disabled={loading || !turnstileToken}
					>
						{#if loading}
							<span class="loading loading-sm loading-spinner"></span>
							{$t('auth.register.loading')}
						{:else}
							{$t('auth.register.submit_button')}
						{/if}
					</button>
				</form>

				<div class="divider">{$t('auth.register.or_divider')}</div>

				<div class="text-center text-sm">
					<span class="text-base-content/70">{$t('auth.register.already_have_account')}</span>
					<a href="/login" class="ml-1 link link-primary">{$t('auth.register.login_link')}</a>
				</div>
			{/if}

			<div class="text-center text-sm">
				<a href="/" class="link">{$t('auth.register.back_home')}</a>
			</div>
		</div>
	</div>
</div>
