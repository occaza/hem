<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/auth.store';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toast from '$lib/components/common/Toast.svelte';

	let { children } = $props();

	onMount(() => {
		authUser.initialize();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main data-theme="light">
	<Toast />
	{@render children()}
</main>
