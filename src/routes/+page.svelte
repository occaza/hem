<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { t } from 'svelte-i18n';
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

	$: features = [
		{
			icon: Zap,
			title: $t('features.fast.title'),
			description: $t('features.fast.description'),
			gradient: 'from-yellow-400 to-orange-500'
		},
		{
			icon: LockKeyhole,
			title: $t('features.secure.title'),
			description: $t('features.secure.description'),
			gradient: 'from-blue-400 to-cyan-500'
		},
		{
			icon: TabletSmartphone,
			title: $t('features.support.title'),
			description: $t('features.support.description'),
			gradient: 'from-purple-400 to-pink-500'
		}
	];
</script>

<svelte:head>
	<title>adverFI - Platform Belanja Digital Terpercaya</title>
</svelte:head>

<div class="h-screen snap-y snap-proximity overflow-y-scroll scroll-smooth font-sans">
	<Navbar />

	<!-- Hero Section -->
	<div
		class="relative -mt-16 flex min-h-screen snap-start items-center justify-center overflow-hidden pt-16"
	>
		<!-- Background Image with Overlay -->
		<div class="hero-bg"></div>
		<div class="hero-overlay"></div>

		<div class="relative z-10 w-full px-4 pt-24 pb-20 text-center text-base-100">
			<div class="mx-auto max-w-5xl" class:fade-in-up={heroVisible}>
				<div
					class="mb-6 inline-flex items-center gap-2 rounded-full border border-base-100/30 bg-base-100/10 px-6 py-2 backdrop-blur-md"
				>
					<Sparkles size={20} class="text-primary" />
					<span class="text-sm font-medium">{$t('hero.badge')}</span>
				</div>

				<h1 class="mb-6 text-3xl leading-tight font-black md:text-4xl lg:text-5xl xl:text-6xl">
					<span class="text-base-100 drop-shadow-lg">{$t('hero.title')}</span>
				</h1>

				<p
					class="mx-auto mb-10 max-w-3xl text-lg font-medium text-base-100/95 drop-shadow-md md:text-xl lg:text-xl"
				>
					{$t('hero.subtitle')}
				</p>

				<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
					<a href="/shop" class="group btn gap-3 btn-lg btn-primary">
						<ShoppingBag size={24} />
						<span>{$t('hero.cta')}</span>
						<ArrowRight size={20} class="transition-transform group-hover:translate-x-1" />
					</a>
					<!--  -->
				</div>

				<!-- Stats -->
				<div class="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
					<div class="stat-card">
						<div class="text-3xl font-black text-base-100 md:text-4xl">10+</div>
						<div class="mt-1 text-sm text-base-100/90 md:text-base">{$t('stats.products')}</div>
					</div>
					<div class="stat-card">
						<div class="text-3xl font-black text-base-100 md:text-4xl">500+</div>
						<div class="mt-1 text-sm text-base-100/90 md:text-base">{$t('stats.customers')}</div>
					</div>
					<div class="stat-card">
						<div class="text-3xl font-black text-base-100 md:text-4xl">24/7</div>
						<div class="mt-1 text-sm text-base-100/90 md:text-base">{$t('stats.support')}</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div
		id="features"
		class="relative snap-start overflow-hidden bg-gradient-to-b from-base-100 to-base-200 py-24"
	>
		<div class="relative z-10 container mx-auto px-4">
			<div class="mb-20 text-center" class:fade-in-up={featuresVisible}>
				<div class="mb-4 inline-block">
					<span class="text-sm font-bold tracking-wider text-primary uppercase"
						>{$t('features.subtitle')}</span
					>
				</div>
				<h2 class="mb-6 text-4xl font-black md:text-5xl lg:text-6xl">
					{$t('features.title')}
				</h2>
				<p class="mx-auto max-w-2xl text-lg text-base-content/70 md:text-xl">
					{$t('features.description')}
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
	<div class="relative snap-start overflow-hidden bg-primary py-24">
		<div class="relative z-10 container mx-auto px-4 text-center">
			<div class="mx-auto max-w-4xl">
				<h2 class="mb-6 text-4xl font-black md:text-5xl lg:text-6xl">
					{$t('cta.title')}
				</h2>
				<p class="mx-auto mb-10 max-w-2xl text-lg text-base-content/90 md:text-xl">
					{$t('cta.subtitle')}
				</p>
				<a href="/shop" class="group btn gap-2 btn-lg btn-primary">
					<ShoppingBag size={24} />
					<span>{$t('cta.button')}</span>
					<ArrowRight size={20} class="transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div class="snap-start">
		<Footer />
	</div>
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
