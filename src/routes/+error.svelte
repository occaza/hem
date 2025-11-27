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

<div class="flex min-h-screen flex-col bg-base-200 font-sans selection:bg-primary/30">
	<Navbar />

	<div class="relative flex flex-1 items-center justify-center overflow-hidden p-4">
		<!-- Animated Background -->
		<div class="absolute inset-0 overflow-hidden">
			<div
				class="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] animate-pulse rounded-full bg-primary/20 blur-[120px]"
			></div>
			<div
				class="absolute top-[40%] -right-[10%] h-[60vh] w-[60vh] animate-pulse rounded-full bg-secondary/20 blur-[100px]"
				style="animation-delay: 2s;"
			></div>
			<div
				class="absolute -bottom-[10%] left-[20%] h-[50vh] w-[50vh] animate-pulse rounded-full bg-accent/20 blur-[100px]"
				style="animation-delay: 4s;"
			></div>
		</div>

		<!-- Glass Card Content -->
		<div
			class="relative z-10 mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl md:p-12"
		>
			<!-- Status Code with Gradient & Glitch -->
			<div class="relative mb-2 select-none">
				<h1 class="text-[120px] leading-none font-black tracking-tighter md:text-[200px]">
					<span
						class="bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent"
					>
						{status}
					</span>
				</h1>
				<!-- Decorative Elements -->
				<div
					class="absolute top-1/2 left-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl"
				></div>
			</div>

			<!-- Error Message -->
			<h2 class="mb-4 text-3xl font-bold text-base-content md:text-4xl">
				Oops! {message}
			</h2>

			<p class="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-base-content/70">
				Sepertinya Anda tersesat di antah berantah digital. Halaman yang Anda cari mungkin telah
				berpindah dimensi atau tidak pernah ada.
			</p>

			<!-- Action Buttons -->
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<a
					href="/"
					class="group btn gap-3 border-none bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all btn-lg btn-primary hover:-translate-y-1 hover:shadow-primary/30"
				>
					<Home size={20} class="transition-transform group-hover:scale-110" />
					Kembali ke Beranda
				</a>
				<a
					href="/shop"
					class="group btn gap-3 border-base-content/20 btn-outline btn-lg hover:border-base-content/40 hover:bg-base-content/5"
				>
					<Search size={20} class="transition-transform group-hover:scale-110" />
					Cari Produk
				</a>
			</div>
		</div>
	</div>

	<Footer marginTop={false} />
</div>

<style>
	/* Smooth fade in animation */
	div {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
