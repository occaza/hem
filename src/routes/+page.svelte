<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import {
		Zap,
		LockKeyhole,
		TabletSmartphone,
		Sparkles,
		ShoppingBag,
		ArrowRight
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	let heroVisible = false;
	let featuresVisible = false;

	onMount(() => {
		setTimeout(() => (heroVisible = true), 100);

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						featuresVisible = true;
					}
				});
			},
			{ threshold: 0.2 }
		);

		const featuresSection = document.querySelector('#features');
		if (featuresSection) observer.observe(featuresSection);

		return () => observer.disconnect();
	});

	const features = [
		{
			icon: Zap,
			title: 'Pembayaran Cepat',
			description: 'Proses checkout dalam hitungan detik dengan berbagai metode pembayaran',
			gradient: 'from-yellow-400 to-orange-500'
		},
		{
			icon: LockKeyhole,
			title: 'Aman & Terpercaya',
			description: 'Keamanan data dan transaksi Anda terjamin dengan enkripsi tingkat tinggi',
			gradient: 'from-blue-400 to-cyan-500'
		},
		{
			icon: TabletSmartphone,
			title: 'Multi Platform',
			description: 'Akses dari mana saja, kapan saja melalui desktop atau mobile',
			gradient: 'from-purple-400 to-pink-500'
		}
	];
</script>

<svelte:head>
	<title>adverFI - Platform Belanja Digital Terpercaya</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="font-inter min-h-screen">
	<Navbar />

	<!-- Hero Section -->
	<div class="relative -mt-16 flex min-h-screen items-center justify-center overflow-hidden pt-16">
		<!-- Background Image with Overlay -->
		<div class="hero-bg"></div>
		<div class="hero-overlay"></div>

		<div class="relative z-10 w-full px-4 pt-24 pb-20 text-center text-base-100">
			<div class="mx-auto max-w-5xl" class:fade-in-up={heroVisible}>
				<div
					class="mb-6 inline-flex items-center gap-2 rounded-full border border-base-100/30 bg-base-100/10 px-6 py-2 backdrop-blur-md"
				>
					<Sparkles size={20} class="text-primary" />
					<span class="text-sm font-medium">Platform Digital Terpercaya</span>
				</div>

				<h1 class="mb-6 text-3xl leading-tight font-black md:text-4xl lg:text-5xl xl:text-6xl">
					<span class="text-base-100 drop-shadow-lg">Belanja Online</span><br />
					<span class="text-base-100 drop-shadow-lg">Lebih Mudah & Cepat</span>
				</h1>

				<p
					class="mx-auto mb-10 max-w-3xl text-lg font-medium text-base-100/95 drop-shadow-md md:text-xl lg:text-xl"
				>
					Platform terpercaya untuk membeli produk digital dengan proses pembayaran yang simpel,
					aman, dan instan
				</p>

				<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
					<a href="/shop" class="group btn gap-3 btn-lg btn-primary">
						<ShoppingBag size={24} />
						<span>Mulai Belanja Sekarang</span>
						<ArrowRight size={20} class="transition-transform group-hover:translate-x-1" />
					</a>
					<!--  -->
				</div>

				<!-- Stats -->
				<div class="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
					<div class="stat-card">
						<div class="text-3xl font-black text-base-100 md:text-4xl">1000+</div>
						<div class="mt-1 text-sm text-base-100/90 md:text-base">Produk Digital</div>
					</div>
					<div class="stat-card">
						<div class="text-3xl font-black text-base-100 md:text-4xl">5000+</div>
						<div class="mt-1 text-sm text-base-100/90 md:text-base">Pelanggan Puas</div>
					</div>
					<div class="stat-card">
						<div class="text-3xl font-black text-base-100 md:text-4xl">24/7</div>
						<div class="mt-1 text-sm text-base-100/90 md:text-base">Layanan Support</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div
		id="features"
		class="relative overflow-hidden bg-gradient-to-b from-base-100 to-base-200 py-24"
	>
		<div class="relative z-10 container mx-auto px-4">
			<div class="mb-20 text-center" class:fade-in-up={featuresVisible}>
				<div class="mb-4 inline-block">
					<span class="text-sm font-bold tracking-wider text-primary uppercase"
						>Keunggulan Kami</span
					>
				</div>
				<h2 class="mb-6 text-4xl font-black md:text-5xl lg:text-6xl">
					Kenapa Pilih <span class="gradient-text">Kami?</span>
				</h2>
				<p class="mx-auto max-w-2xl text-lg text-base-content/70 md:text-xl">
					Pengalaman berbelanja yang lebih baik dengan fitur unggulan yang dirancang untuk
					kenyamanan Anda
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
				{#each features as feature, i}
					<div
						class="feature-card group"
						class:fade-in-up={featuresVisible}
						style="animation-delay: {i * 150}ms"
					>
						<div class="feature-card-inner">
							<!-- Icon with gradient background -->
							<div class="relative mb-6">
								<div class="icon-wrapper bg-gradient-to-br {feature.gradient}">
									<feature.icon size={32} class="relative z-10 text-white" strokeWidth={2.5} />
								</div>
								<div class="icon-glow bg-gradient-to-br {feature.gradient}"></div>
							</div>

							<h3
								class="group-hover:gradient-text mb-4 text-2xl font-bold transition-all duration-300 md:text-3xl"
							>
								{feature.title}
							</h3>
							<p class="leading-relaxed text-base-content/70">
								{feature.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="relative overflow-hidden bg-primary py-24">
		<div class="relative z-10 container mx-auto px-4 text-center">
			<div class="mx-auto max-w-4xl">
				<h2 class="mb-6 text-4xl font-black md:text-5xl lg:text-6xl">
					Siap Untuk <span class="text-success">Belanja?</span>
				</h2>
				<p class="mx-auto mb-10 max-w-2xl text-lg text-base-content/90 md:text-xl">
					Jelajahi koleksi produk digital kami dan nikmati kemudahan berbelanja dengan sistem
					pembayaran yang aman dan cepat
				</p>
				<a href="/shop" class="group btn gap-2 btn-lg btn-primary">
					<ShoppingBag size={24} />
					<span>Lihat Semua Produk</span>
					<ArrowRight size={20} class="transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<Footer />
</div>

<style>
	:global(body) {
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	/* Hero Section with Image Background */
	.hero-bg {
		position: absolute;
		inset: 0;
		background-image: url('/pexels-chris-f-38966-5696974.jpg');
		background-size: cover;
		background-position: center;
		z-index: 0;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.5),
			rgba(0, 0, 0, 0.6) 50%,
			rgba(0, 0, 0, 0.7)
		);
		z-index: 1;
	}

	/* Stats Card */
	.stat-card {
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
	}

	.stat-card:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-5px);
	}

	/* Feature Cards */
	.feature-card {
		height: 100%;
		opacity: 0;
		transform: translateY(30px);
	}

	.feature-card.fade-in-up {
		animation: fadeInUp 0.6s ease forwards;
	}

	.feature-card-inner {
		height: 100%;
		padding: 2.5rem;
		background: oklch(var(--b2));
		border-radius: 1.5rem;
		border: 1px solid oklch(var(--bc) / 0.1);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.feature-card:hover .feature-card-inner {
		transform: translateY(-10px);
		background: oklch(var(--b3));
		border-color: oklch(var(--bc) / 0.2);
		box-shadow: 0 20px 60px -10px oklch(var(--b1) / 0.3);
	}

	/* Icon Styling */
	.icon-wrapper {
		position: relative;
		width: 80px;
		height: 80px;
		border-radius: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
		transition: all 0.3s ease;
	}

	.icon-glow {
		position: absolute;
		width: 80px;
		height: 80px;
		border-radius: 1.25rem;
		opacity: 0;
		filter: blur(20px);
		transition: opacity 0.3s ease;
	}

	.feature-card:hover .icon-glow {
		opacity: 0.6;
	}

	.feature-card:hover .icon-wrapper {
		transform: scale(1.1) rotate(5deg);
	}

	/* Animations */
	.fade-in-up {
		animation: fadeInUp 0.8s ease forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
