<script lang="ts">
	import { fetchWithCSRF } from '$lib/utils/csrf.utils';
	import { t } from 'svelte-i18n';

	let email = $state('');
	let loading = $state(false);
	let success = $state(false);
	let error = $state('');

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const res = await fetchWithCSRF('/api/auth/request-reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await res.json();

			if (res.ok) {
				success = true;
			} else {
				error = data.error || $t('common.error');
			}
		} catch (err) {
			error = $t('common.error') + '. ' + $t('contact.form.error');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('auth.forgot_password.page_title')}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-200">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-center text-2xl font-bold">{$t('auth.forgot_password.title')}</h2>

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
						<div class="font-bold">{$t('auth.forgot_password.success_title')}</div>
						<div class="text-sm">{$t('auth.forgot_password.success_desc')}</div>
					</div>
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

				<p class="text-sm text-base-content/70">
					{$t('auth.forgot_password.instruction')}
				</p>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					<div class="form-control flex flex-col">
						<label class="label" for="email">
							<span class="label-text">{$t('auth.forgot_password.email_label')}</span>
						</label>
						<input
							id="email"
							type="email"
							placeholder={$t('auth.forgot_password.email_placeholder')}
							class="input-bordered input"
							autocomplete="email"
							bind:value={email}
							required
						/>
					</div>

					<div class="form-control mt-6">
						<button type="submit" class="btn btn-primary" disabled={loading}>
							{#if loading}
								<span class="loading loading-sm loading-spinner"></span>
								{$t('auth.forgot_password.sending')}
							{:else}
								{$t('auth.forgot_password.submit_button')}
							{/if}
						</button>
					</div>
				</form>
			{/if}

			<div class="divider"></div>

			<div class="text-center text-sm">
				<span class="text-base-content/70">{$t('auth.forgot_password.remember_password')}</span>
				<a href="/login" class="ml-1 link link-primary">{$t('auth.forgot_password.login_link')}</a>
			</div>

			<div class="mt-2 text-center text-sm">
				<a href="/" class="link">{$t('auth.forgot_password.back_home')}</a>
			</div>
		</div>
	</div>
</div>
