<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_TELEGRAM_BOT_USERNAME } from '$env/static/public';
	import { toast } from '$lib/stores/toast.store';

	let loading = $state(false);
	let container: HTMLDivElement;

	onMount(() => {
		if (!PUBLIC_TELEGRAM_BOT_USERNAME) {
			console.error('PUBLIC_TELEGRAM_BOT_USERNAME is not set');
			return;
		}

		// Define global callback
		(window as any).onTelegramAuth = async (user: any) => {
			loading = true;
			try {
				const res = await fetch('/api/auth/telegram', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(user)
				});

				const data = await res.json();

				if (res.ok) {
					toast.success('Login successful!');
					// Redirect to home or previous page
					window.location.href = '/';
				} else {
					console.error('Login failed:', data.error);
					toast.error(data.error || 'Login failed');
				}
			} catch (e) {
				console.error('Login error:', e);
				toast.error('An error occurred during login');
			} finally {
				loading = false;
			}
		};

		// Inject script
		const script = document.createElement('script');
		script.src = 'https://telegram.org/js/telegram-widget.js?22';
		// HARDCODED FOR DEBUGGING
		script.setAttribute('data-telegram-login', 'bebboot_bot');
		script.setAttribute('data-size', 'large');
		script.setAttribute('data-radius', '10');
		script.setAttribute('data-onauth', 'onTelegramAuth(user)');
		script.setAttribute('data-request-access', 'write');
		script.async = true;

		if (container) {
			container.appendChild(script);
		}
	});
</script>

<div class="flex flex-col items-center justify-center gap-2">
	{#if loading}
		<div class="flex items-center gap-2 text-primary">
			<span class="loading loading-sm loading-spinner"></span>
			<span>Logging in...</span>
		</div>
	{/if}

	<div bind:this={container} class:opacity-50={loading} class:pointer-events-none={loading}>
		<!-- Telegram widget will be rendered here -->
	</div>

	{#if !PUBLIC_TELEGRAM_BOT_USERNAME}
		<div class="text-xs text-error">Bot username not configured</div>
	{/if}
</div>
