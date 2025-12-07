<script lang="ts">
	import { goto } from '$app/navigation';
	import { getSupabaseClient } from '$lib/client/supabase';
	import { onMount } from 'svelte';
	import Turnstile from '$lib/components/ui/Turnstile.svelte';
	import { t } from 'svelte-i18n';

	let identifier = $state(''); // Email or Username
	let password = $state('');
	let loading = $state(false);
	let error = $state('');
	let turnstileToken = $state('');
	let turnstileRef: any = $state(null);

	onMount(async () => {
		const supabase = getSupabaseClient();
		const {
			data: { session }
		} = await supabase.auth.getSession();

		// Jika sesi sudah ada, redirect ke halaman yang sesuai
		if (session) {
			// Cek role user
			const res = await fetch('/api/profile');
			if (res.ok) {
				const profile = await res.json();
				if (profile.role === 'superadmin') {
					await goto('/dashboard');
				} else {
					await goto('/account');
				}
			} else if (res.status === 401) {
				// Session mismatch (client has session but server cookies are gone)
				// Clear client session
				await supabase.auth.signOut();
			}
		}
	});

	async function handleLogin() {
		loading = true;
		error = '';

		// Verify Turnstile token first
		if (!turnstileToken) {
			error = 'Silakan selesaikan verifikasi keamanan';
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
				error = 'Verifikasi keamanan gagal. Silakan coba lagi.';
				loading = false;
				turnstileToken = '';
				turnstileRef?.reset();
				return;
			}
		} catch (err) {
			error = 'Terjadi kesalahan pada verifikasi keamanan';
			loading = false;
			turnstileToken = '';
			turnstileRef?.reset();
			return;
		}

		try {
			// 1. Lookup Email jika input bukan email
			let emailToLogin = identifier;

			if (!identifier.includes('@')) {
				const lookupRes = await fetch('/api/auth/lookup-email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ identifier })
				});

				const lookupData = await lookupRes.json();

				if (!lookupRes.ok) {
					error = lookupData.error || $t('auth.login.error.user_not_found');
					loading = false;
					return;
				}

				emailToLogin = lookupData.email;
			}

			// 2. Login dengan Email
			const supabase = getSupabaseClient();

			const { data, error: authError } = await supabase.auth.signInWithPassword({
				email: emailToLogin,
				password
			});

			if (authError) {
				error = authError.message;
				if (error === 'Invalid login credentials') {
					error = $t('auth.login.error.invalid_credentials');
				}
				return;
			}

			if (data.session) {
				// Simpan tokens ke cookies via server endpoint
				const res = await fetch('/api/auth/session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						access_token: data.session.access_token,
						refresh_token: data.session.refresh_token
					})
				});

				if (res.ok) {
					// Cek role untuk redirect
					const profileRes = await fetch('/api/profile');
					if (profileRes.ok) {
						const profile = await profileRes.json();
						// Jika superadmin, ke dashboard. Jika user biasa, ke shop
						if (profile.role === 'superadmin') {
							goto('/dashboard');
						} else {
							goto('/account');
						}
					} else {
						// Fallback ke shop jika gagal cek role
						goto('/account');
					}
				} else {
					error = $t('auth.login.error.save_session');
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : $t('auth.login.error.generic');
			turnstileToken = '';
			turnstileRef?.reset();
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('auth.login.page_title')}</title>
</svelte:head>

<div class="flex min-h-screen w-full items-center justify-center bg-base-200 px-4 py-8">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-center text-2xl font-bold">
				{$t('auth.login.title')}
			</h2>

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
					handleLogin();
				}}
			>
				<div class="form-control flex flex-col gap-2">
					<label class="label" for="identifier">
						<span class="label-text">{$t('auth.login.identifier_label')}</span>
					</label>
					<input
						id="identifier"
						name="identifier"
						type="text"
						placeholder={$t('auth.login.identifier_placeholder')}
						class="input-bordered input w-full"
						autocomplete="username"
						bind:value={identifier}
						required
					/>
				</div>

				<div class="form-control mt-4 flex flex-col gap-2">
					<label class="label" for="password">
						<span class="label-text">{$t('auth.login.password_label')}</span>
					</label>
					<input
						id="password"
						name="password"
						type="password"
						placeholder={$t('auth.login.password_placeholder')}
						class="input-bordered input w-full"
						autocomplete="current-password"
						bind:value={password}
						required
					/>
				</div>
				<div class="my-2 label">
					<a href="/forgot-password" class="label-text-alt link link-primary link-hover">
						{$t('auth.login.forgot_password')}
					</a>
				</div>

				<!-- Turnstile Widget -->
				<div class="form-control mt-4">
					<Turnstile
						bind:this={turnstileRef}
						onVerify={(token) => (turnstileToken = token)}
						onError={() => {
							turnstileToken = '';
							error = 'Verifikasi keamanan gagal';
						}}
						onExpire={() => {
							turnstileToken = '';
						}}
					/>
				</div>
				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{#if loading}
							<span class="loading loading-sm loading-spinner"></span>
							{$t('auth.login.loading')}
						{:else}
							{$t('auth.login.submit_button')}
						{/if}
					</button>
				</div>
			</form>

			<div class="text-center text-sm">
				<span class="text-base-content/70">{$t('auth.login.no_account')}</span>
				<a href="/register" class="ml-1 link link-primary">{$t('auth.login.register_link')}</a>
			</div>

			<div class="mt-2 text-center text-sm">
				<a href="/" class="link">{$t('auth.login.back_home')}</a>
			</div>
		</div>
	</div>
</div>
