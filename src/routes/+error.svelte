<script lang="ts">
	import { page } from '$app/stores';
	import { Home, ArrowLeft, Search } from '@lucide/svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	const status = $derived($page.status);
	const message = $derived($page.error?.message || 'Halaman tidak ditemukan');
</script>

<svelte:head>
	<title>{status} - AdverFI</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-base-200">
	<Navbar />

	<div class="relative flex flex-1 items-center justify-center overflow-hidden">
		<!-- Background Elements -->
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			<div
				class="absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl"
			></div>
			<div
				class="absolute top-1/2 -right-24 h-80 w-80 animate-pulse rounded-full bg-secondary/20 blur-3xl"
				style="animation-delay: 1s;"
			></div>
			<div
				class="absolute -bottom-24 left-1/2 h-96 w-96 animate-pulse rounded-full bg-accent/20 blur-3xl"
				style="animation-delay: 2s;"
			></div>
		</div>

		<div class="relative z-10 container mx-auto px-4 text-center">
			<div class="mx-auto max-w-2xl">
				<!-- 404 Glitch Effect -->
				<h1
					class="relative inline-block text-[150px] leading-none font-black select-none md:text-[500px]"
				>
					<span
						class="animate-gradient bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
					>
						{status}
					</span>
					<span
						class="animate-glitch-1 absolute top-0 left-0 -ml-1 text-primary/30"
						aria-hidden="true">{status}</span
					>
					<span
						class="animate-glitch-2 absolute top-0 left-0 ml-1 text-secondary/30"
						aria-hidden="true">{status}</span
					>
				</h1>

				<h2 class="mt-[-20px] mb-6 text-3xl font-bold md:text-4xl">
					Oops! {message}
				</h2>

				<p class="mx-auto mb-10 max-w-lg text-lg text-base-content/70">
					Sepertinya Anda tersesat di dunia digital. Halaman yang Anda cari mungkin telah
					dipindahkan, dihapus, atau tidak pernah ada.
				</p>

				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						href="/"
						class="btn gap-2 shadow-lg transition-all btn-lg btn-primary hover:-translate-y-1 hover:shadow-primary/50"
					>
						<Home size={20} />
						Kembali ke Beranda
					</a>
					<a href="/shop" class="btn gap-2 btn-outline btn-lg hover:bg-base-content/5">
						<Search size={20} />
						Cari Produk
					</a>
				</div>
			</div>
		</div>
	</div>

	<Footer />
</div>

<style>
	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.animate-gradient {
		background-size: 200% auto;
		animation: gradient 4s linear infinite;
	}

	@keyframes glitch-1 {
		0% {
			transform: translate(0);
		}
		20% {
			transform: translate(-2px, 2px);
		}
		40% {
			transform: translate(-2px, -2px);
		}
		60% {
			transform: translate(2px, 2px);
		}
		80% {
			transform: translate(2px, -2px);
		}
		100% {
			transform: translate(0);
		}
	}

	@keyframes glitch-2 {
		0% {
			transform: translate(0);
		}
		20% {
			transform: translate(2px, -2px);
		}
		40% {
			transform: translate(2px, 2px);
		}
		60% {
			transform: translate(-2px, -2px);
		}
		80% {
			transform: translate(-2px, 2px);
		}
		100% {
			transform: translate(0);
		}
	}

	.animate-glitch-1 {
		animation: glitch-1 2.5s infinite linear alternate-reverse;
	}

	.animate-glitch-2 {
		animation: glitch-2 3s infinite linear alternate-reverse;
	}
</style>
