<script lang="ts">
	import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from '@lucide/svelte';
</script>

<footer class="mt-24 bg-base-300 pt-10 text-base-content">
	<div class="container mx-auto px-4">
		<div class="mb-10 footer grid-cols-1 gap-10 md:grid-cols-4">
			<!-- Brand Section -->
			<aside class="col-span-1 md:col-span-1">
				<div class="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
					<span class="text-3xl">🛒</span>
					<span>AdverFI</span>
				</div>
				<p class="mb-4 text-base-content/70">
					Platform jual beli akun digital terpercaya, aman, dan cepat. Solusi terbaik untuk
					kebutuhan digital marketing Anda.
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
				<h6 class="footer-title mb-4 text-lg text-base-content opacity-100">Menu</h6>
				<a href="/" class="mb-2 link link-hover transition-colors hover:text-primary">Beranda</a>
				<a href="/shop" class="mb-2 link link-hover transition-colors hover:text-primary">Belanja</a
				>
				<a href="/cart" class="mb-2 link link-hover transition-colors hover:text-primary"
					>Keranjang</a
				>
				<a href="/my-orders" class="mb-2 link link-hover transition-colors hover:text-primary"
					>Pesanan Saya</a
				>
			</nav>

			<!-- Support -->
			<nav>
				<h6 class="footer-title mb-4 text-lg text-base-content opacity-100">Bantuan</h6>
				<a href="/faq" class="mb-2 link link-hover transition-colors hover:text-primary">FAQ</a>
				<a
					href="/terms-of-service"
					class="mb-2 link link-hover transition-colors hover:text-primary">Syarat & Ketentuan</a
				>
				<a href="/privacy-policy" class="mb-2 link link-hover transition-colors hover:text-primary"
					>Kebijakan Privasi</a
				>
				<a href="/contact" class="mb-2 link link-hover transition-colors hover:text-primary"
					>Hubungi Kami</a
				>
				<a href="/disclaimer" class="mb-2 link link-hover transition-colors hover:text-primary"
					>Disclaimer</a
				>
			</nav>

			<!-- Contact -->
			<nav>
				<h6 class="footer-title mb-4 text-lg text-base-content opacity-100">Kontak</h6>
				<div class="mb-3 flex items-start gap-3">
					<MapPin size={20} class="mt-1 flex-shrink-0 text-primary" />
					<span class="text-base-content/80">Jl. Digital No. 123, Jakarta Selatan, Indonesia</span>
				</div>
				<div class="mb-3 flex items-center gap-3">
					<Phone size={20} class="flex-shrink-0 text-primary" />
					<span class="text-base-content/80">+62 812-3456-7890</span>
				</div>
				<div class="mb-3 flex items-center gap-3">
					<Mail size={20} class="flex-shrink-0 text-primary" />
					<span class="text-base-content/80">support@adverfi.id</span>
				</div>
			</nav>
		</div>
	</div>

	<!-- Copyright -->
	<div class="bg-base-300 py-6">
		<div
			class="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row"
		>
			<p class="text-center text-sm text-base-content/60 md:text-left">
				© {new Date().getFullYear()} <span class="font-bold text-primary">AdverFI</span>. All
				rights reserved.
			</p>
			<div class="flex gap-6 text-sm font-medium text-base-content/60">
				<a href="/terms-of-service" class="transition-colors hover:text-primary">Terms</a>
				<a href="/privacy-policy" class="transition-colors hover:text-primary">Privacy</a>
				<a href="/cookies" class="transition-colors hover:text-primary">Cookies</a>
			</div>
		</div>
	</div>
</footer>
