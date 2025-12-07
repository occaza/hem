<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_TURNSTILE_SITE_KEY, PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';

	type Props = {
		onVerify: (token: string) => void;
		onError?: () => void;
		onExpire?: () => void;
	};

	let { onVerify, onError, onExpire }: Props = $props();

	let widgetId: string | null = null;
	let containerRef: HTMLDivElement;

	onMount(() => {
		// Skip Turnstile if disabled (development mode)
		if (PUBLIC_TURNSTILE_ENABLED === 'false') {
			// Auto-verify with dummy token for development
			onVerify('dev-bypass-token');
			return;
		}

		// Load Turnstile script
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;
		script.onload = () => renderWidget();
		document.head.appendChild(script);

		return () => {
			// Cleanup
			if (widgetId && window.turnstile) {
				window.turnstile.remove(widgetId);
			}
		};
	});

	function renderWidget() {
		if (!window.turnstile || !containerRef) return;

		widgetId = window.turnstile.render(containerRef, {
			sitekey: PUBLIC_TURNSTILE_SITE_KEY,
			callback: (token: string) => {
				onVerify(token);
			},
			'error-callback': () => {
				onError?.();
			},
			'expired-callback': () => {
				onExpire?.();
			},
			theme: 'auto',
			size: 'normal'
		});
	}

	export function reset() {
		if (widgetId && window.turnstile) {
			window.turnstile.reset(widgetId);
		}
	}
</script>

<div bind:this={containerRef} class="flex justify-center"></div>

<style>
	:global(.cf-turnstile) {
		margin: 0 auto;
	}
</style>
