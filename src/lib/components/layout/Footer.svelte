<script lang="ts">
	import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from '@lucide/svelte';
	import LanguageSwitcher from '$lib/components/ui/LanguageSwitcher.svelte';
	import { t } from 'svelte-i18n';
</script>

<footer class=" bg-neutral pt-10 text-base-300">
	<div class="container mx-auto px-4">
		<div class="mb-10 footer grid-cols-1 gap-10 md:grid-cols-4">
			<!-- Brand Section -->
			<aside class="col-span-1 md:col-span-1">
				<div class="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
					<span class="text-3xl">🛒</span>
					<span>AdverFI</span>
				</div>
				<p class="mb-4 text-base-300">
					{$t('footer.description')}
				</p>
				<div class="flex gap-4">
					<a
						href="https://facebook.com"
						target="_blank"
						rel="noreferrer"
						class="btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary"
					>
						<Facebook size={18} />
					</a>
					<a
						href="https://twitter.com"
						target="_blank"
						rel="noreferrer"
						class="btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary"
					>
						<Twitter size={18} />
					</a>
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noreferrer"
						class="btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary"
					>
						<Instagram size={18} />
					</a>
				</div>
			</aside>

			<!-- Quick Links -->
			<nav>
				<h6 class="footer-title mb-4 text-lg text-base-300 opacity-100">{$t('footer.menu')}</h6>
				<a href="/" class="mb-2 link link-hover transition-colors hover:text-primary"
					>{$t('nav.home')}</a
				>
				<a href="/shop" class="mb-2 link link-hover transition-colors hover:text-primary"
					>{$t('nav.shop')}</a
				>
				<a href="/cart" class="mb-2 link link-hover transition-colors hover:text-primary"
					>{$t('nav.cart')}</a
				>
				<a
					href="/account?tab=orders"
					class="mb-2 link link-hover transition-colors hover:text-primary"
					>{$t('account.my_orders')}</a
				>
			</nav>

			<!-- Support -->
			<nav>
				<h6 class="footer-title mb-4 text-lg text-base-300 opacity-100">{$t('footer.help')}</h6>
				<a href="/faq" class="mb-2 link link-hover transition-colors hover:text-primary">FAQ</a>
				<a
					href="/terms-of-service"
					class="mb-2 link link-hover transition-colors hover:text-primary">{$t('footer.terms')}</a
				>
				<a href="/privacy-policy" class="mb-2 link link-hover transition-colors hover:text-primary"
					>{$t('footer.privacy')}</a
				>
				<a href="/contact" class="mb-2 link link-hover transition-colors hover:text-primary"
					>{$t('footer.contact')}</a
				>
				<a href="/disclaimer" class="mb-2 link link-hover transition-colors hover:text-primary"
					>Disclaimer</a
				>
			</nav>

			<!-- Contact -->
			<nav>
				<h6 class="footer-title mb-4 text-lg text-base-300 opacity-100">{$t('footer.contact')}</h6>
				<div class="mb-3 flex items-start gap-3">
					<MapPin size={20} class="mt-1 flex-shrink-0 text-primary" />
					<span class="text-base-300">Gatak, Sukoharjo</span>
				</div>
				<div class="mb-3 flex items-center gap-3">
					<Phone size={20} class="flex-shrink-0 text-primary" />
					<a
						href="https://wa.me/6281616666202"
						target="_blank"
						rel="noopener noreferrer"
						class="link text-base-300 transition-colors hover:text-primary"
					>
						+62 816-1666-202
					</a>
				</div>
				<div class="mb-3 flex items-center gap-3">
					<Mail size={20} class="flex-shrink-0 text-primary" />
					<span class="text-base-300">support@adverfi.id</span>
				</div>
			</nav>
		</div>

		<!-- Copyright -->
		<div class="bg-neutral py-6">
			<div
				class="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row"
			>
				<p class="text-center text-sm text-neutral-content/60 md:text-left">
					© {new Date().getFullYear()} <span class="font-bold text-primary">AdverFI</span>. All
					rights reserved.
				</p>
				<div class="flex items-center gap-4">
					<LanguageSwitcher />
					<div class="flex gap-6 text-sm font-medium text-neutral-content/60">
						<a href="/terms-of-service" class="transition-colors hover:text-primary">Terms</a>
						<a href="/privacy-policy" class="transition-colors hover:text-primary">Privacy</a>
						<a href="/cookies" class="transition-colors hover:text-primary">Cookies</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
