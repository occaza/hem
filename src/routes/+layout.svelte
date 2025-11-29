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
	<!-- Favicon -->
	<link rel="icon" type="image/svg+xml" href={favicon} />

	<!-- Primary Meta Tags -->
	<meta name="title" content="adverFI - Platform Belanja Digital Terpercaya" />
	<meta
		name="description"
		content="Platform terpercaya untuk membeli produk digital dengan proses pembayaran yang simpel, aman, dan instan. Belanja mudah, cepat, dan terpercaya."
	/>
	<meta
		name="keywords"
		content="belanja digital, produk digital, pembayaran online, toko online, e-commerce"
	/>
	<meta name="robots" content="index, follow" />
	<meta name="language" content="Indonesian" />
	<meta name="author" content="adverFI" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://jualfb.vercel.app/" />
	<meta property="og:title" content="adverFI - Platform Belanja Digital Terpercaya" />
	<meta
		property="og:description"
		content="Platform terpercaya untuk membeli produk digital dengan proses pembayaran yang simpel, aman, dan instan."
	/>
	<meta property="og:image" content="https://jualfb.vercel.app/pexels-johnpet-2115257.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="adverFI" />
	<meta property="og:locale" content="id_ID" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://jualfb.vercel.app/" />
	<meta property="twitter:title" content="adverFI - Platform Belanja Digital Terpercaya" />
	<meta
		property="twitter:description"
		content="Platform terpercaya untuk membeli produk digital dengan proses pembayaran yang simpel, aman, dan instan."
	/>
	<meta property="twitter:image" content="https://jualfb.vercel.app/pexels-johnpet-2115257.jpg" />

	<!-- Additional SEO -->
	<link rel="canonical" href="https://jualfb.vercel.app/" />
</svelte:head>

<main data-theme="light">
	<Toast />
	{@render children()}
</main>
