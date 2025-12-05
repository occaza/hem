<script lang="ts">
	import { goto } from '$app/navigation';
	import { getSupabaseClient } from '$lib/client/supabase';
	import { onMount } from 'svelte';
	import Turnstile from '$lib/components/ui/Turnstile.svelte';

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

		// Verify Turnstile token first (DISABLED for localhost development)
		// if (!turnstileToken) {
		// 	error = 'Silakan selesaikan verifikasi keamanan';
		// 	loading = false;
		// 	return;
		// }

		// DISABLED for localhost development
		// try {
		// 	const verifyRes = await fetch('/api/auth/verify-turnstile', {
		// 		method: 'POST',
		// 		headers: { 'Content-Type': 'application/json' },
		// 		body: JSON.stringify({ token: turnstileToken })
		// 	});

		// 	if (!verifyRes.ok) {
		// 		error = 'Verifikasi keamanan gagal. Silakan coba lagi.';
		// 		loading = false;
		// 		turnstileToken = '';
		// 		turnstileRef?.reset();
		// 		return;
		// 	}
		// } catch (err) {
		// 	error = 'Terjadi kesalahan pada verifikasi keamanan';
		// 	loading = false;
		// 	turnstileToken = '';
		// 	turnstileRef?.reset();
		// 	return;
		// }

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
					error = lookupData.error || 'Username tidak ditemukan';
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
					error = 'Email/Username atau password salah';
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
					error = 'Gagal menyimpan session';
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login gagal';
			turnstileToken = '';
			turnstileRef?.reset();
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - adverFI</title>
</svelte:head>

<div class="flex min-h-screen w-full items-center justify-center bg-base-200 px-4 py-8">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-center text-2xl font-bold">Login</h2>

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
						<span class="label-text">Email atau Username</span>
					</label>
					<input
						id="identifier"
						name="identifier"
						type="text"
						placeholder="Email atau Username"
						class="input-bordered input w-full"
						autocomplete="username"
						bind:value={identifier}
						required
					/>
				</div>

				<div class="form-control mt-4 flex flex-col gap-2">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="••••••••"
						class="input-bordered input w-full"
						autocomplete="current-password"
						bind:value={password}
						required
					/>
				</div>
				<div class="my-2 label">
					<a href="/forgot-password" class="label-text-alt link link-primary link-hover">
						Lupa password?
					</a>
				</div>

				<!-- Turnstile Widget (DISABLED for localhost) -->
				<!-- <div class="form-control mt-4">
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
				</div> -->
				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{#if loading}
							<span class="loading loading-sm loading-spinner"></span>
							Loading...
						{:else}
							Login
						{/if}
					</button>
				</div>
			</form>

			<div class="text-center text-sm">
				<span class="text-base-content/70">Belum punya akun?</span>
				<a href="/register" class="ml-1 link link-primary">Register</a>
			</div>

			<div class="mt-2 text-center text-sm">
				<a href="/" class="link">Kembali ke Beranda</a>
			</div>
		</div>
	</div>
</div>
