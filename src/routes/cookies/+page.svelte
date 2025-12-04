<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { appConfig } from '$lib/config/app.config';

	let activeSection = $state('');

	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
			activeSection = id;
		}
	}
</script>

<svelte:head>
	<title>Kebijakan Cookie - AdverFI</title>
	<meta
		name="description"
		content="Kebijakan penggunaan cookie di platform AdverFI. Pelajari bagaimana kami menggunakan cookie untuk meningkatkan pengalaman Anda."
	/>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto px-4 py-8">
		<div class="breadcrumbs mb-4 text-sm">
			<ul>
				<li><a href="/">Beranda</a></li>
				<li>Kebijakan Cookie</li>
			</ul>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<!-- Table of Contents - Sidebar -->
			<div class="lg:col-span-1">
				<div class="card sticky top-4 bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="mb-4 text-lg font-bold">Daftar Isi</h3>
						<ul class="menu menu-sm">
							<li>
								<button onclick={() => scrollToSection('pendahuluan')}>1. Apa itu Cookie?</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('jenis-cookie')}>2. Jenis Cookie</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('mengelola')}>3. Mengelola Cookie</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('pihak-ketiga')}
									>4. Cookie Pihak Ketiga</button
								>
							</li>
							<li>
								<button onclick={() => scrollToSection('pembaruan')}>5. Pembaruan Kebijakan</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('kontak')}>6. Hubungi Kami</button>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Main Content -->
			<div class="lg:col-span-3">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body prose max-w-none">
						<h1 class="mb-2 text-4xl font-bold">Kebijakan Cookie</h1>
						<p class="mb-8 text-sm text-base-content/70">
							Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</p>

						<!-- 1. Apa itu Cookie? -->
						<section id="pendahuluan" class="mb-8">
							<h2 class="mb-4 text-2xl font-bold">1. Apa itu Cookie?</h2>
							<p class="mb-4">
								Cookie adalah file teks kecil yang disimpan di perangkat Anda ketika Anda
								mengunjungi website kami. Cookie membantu kami memberikan pengalaman yang lebih baik
								dengan mengingat preferensi Anda dan memahami bagaimana Anda menggunakan layanan
								kami.
							</p>
							<p class="mb-4">
								Dengan menggunakan platform AdverFI, Anda menyetujui penggunaan cookie sesuai dengan
								kebijakan ini.
							</p>
						</section>

						<!-- 2. Jenis Cookie -->
						<section id="jenis-cookie" class="mb-8">
							<h2 class="mb-4 text-2xl font-bold">2. Jenis Cookie yang Kami Gunakan</h2>

							<h3 class="mb-3 text-xl font-semibold">2.1 Cookie Penting (Essential Cookies)</h3>
							<p class="mb-4">
								Cookie ini diperlukan agar website dapat berfungsi dengan baik. Tanpa cookie ini,
								beberapa fitur tidak akan bekerja.
							</p>
							<ul class="mb-6 list-disc space-y-2 pl-6">
								<li>Menjaga sesi login Anda tetap aktif</li>
								<li>Menyimpan item di keranjang belanja</li>
								<li>Mengingat preferensi bahasa</li>
							</ul>

							<h3 class="mb-3 text-xl font-semibold">2.2 Cookie Analitik (Analytics Cookies)</h3>
							<p class="mb-4">
								Cookie ini membantu kami memahami bagaimana pengunjung berinteraksi dengan website
								kami.
							</p>
							<ul class="mb-6 list-disc space-y-2 pl-6">
								<li>Mengukur jumlah pengunjung</li>
								<li>Memahami halaman mana yang paling populer</li>
								<li>Mengidentifikasi masalah teknis</li>
							</ul>

							<h3 class="mb-3 text-xl font-semibold">2.3 Cookie Fungsional (Functional Cookies)</h3>
							<p class="mb-4">Cookie ini meningkatkan fungsionalitas dan personalisasi website.</p>
							<ul class="mb-6 list-disc space-y-2 pl-6">
								<li>Mengingat preferensi tampilan</li>
								<li>Menyimpan filter pencarian</li>
								<li>Personalisasi konten berdasarkan aktivitas Anda</li>
							</ul>

							<h3 class="mb-3 text-xl font-semibold">2.4 Cookie Pemasaran (Marketing Cookies)</h3>
							<p class="mb-4">
								Cookie ini digunakan untuk menampilkan iklan yang relevan dengan minat Anda.
							</p>
							<ul class="list-disc space-y-2 pl-6">
								<li>Menampilkan iklan yang relevan</li>
								<li>Membatasi frekuensi iklan yang sama</li>
								<li>Mengukur efektivitas kampanye iklan</li>
							</ul>
						</section>

						<!-- 3. Mengelola Cookie -->
						<section id="mengelola" class="mb-8">
							<h2 class="mb-4 text-2xl font-bold">3. Cara Mengelola Cookie</h2>
							<p class="mb-4">
								Anda memiliki kontrol penuh atas cookie yang disimpan di perangkat Anda. Anda dapat
								mengelola atau menghapus cookie sesuai keinginan.
							</p>

							<div class="mb-4 alert alert-warning">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6 shrink-0 stroke-current"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<span
									>Perlu diketahui bahwa menonaktifkan cookie tertentu dapat mempengaruhi
									fungsionalitas website dan pengalaman Anda.</span
								>
							</div>

							<h3 class="mb-3 text-xl font-semibold">Pengaturan Browser:</h3>
							<ul class="list-disc space-y-2 pl-6">
								<li>
									<strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other
									site data
								</li>
								<li>
									<strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
								</li>
								<li>
									<strong>Safari:</strong> Preferences → Privacy → Cookies and website data
								</li>
								<li>
									<strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies
									and site data
								</li>
							</ul>
						</section>

						<!-- 4. Cookie Pihak Ketiga -->
						<section id="pihak-ketiga" class="mb-8">
							<h2 class="mb-4 text-2xl font-bold">4. Cookie Pihak Ketiga</h2>
							<p class="mb-4">
								Kami menggunakan layanan pihak ketiga yang mungkin menempatkan cookie di perangkat
								Anda, termasuk:
							</p>
							<ul class="list-disc space-y-2 pl-6">
								<li>Google Analytics - untuk analisis traffic website</li>
								<li>Payment Gateway - untuk memproses pembayaran dengan aman</li>
								<li>Social Media Plugins - untuk integrasi media sosial</li>
							</ul>
						</section>

						<!-- 5. Pembaruan Kebijakan -->
						<section id="pembaruan" class="mb-8">
							<h2 class="mb-4 text-2xl font-bold">5. Pembaruan Kebijakan</h2>
							<p class="mb-4">
								Kami dapat memperbarui Kebijakan Cookie ini dari waktu ke waktu untuk mencerminkan
								perubahan dalam praktik kami atau karena alasan operasional, hukum, atau peraturan
								lainnya.
							</p>
							<p class="mb-4">
								Kami akan memberitahu Anda tentang perubahan material dengan memposting kebijakan
								yang diperbarui di halaman ini. Tanggal "Terakhir diperbarui" di bagian atas akan
								diperbarui sesuai dengan perubahan.
							</p>
						</section>

						<!-- 6. Kontak -->
						<section id="kontak" class="mb-8">
							<h2 class="mb-4 text-2xl font-bold">6. Hubungi Kami</h2>
							<p class="mb-4">
								Jika Anda memiliki pertanyaan tentang Kebijakan Cookie kami, silakan hubungi kami:
							</p>
							<div class="card bg-base-200">
								<div class="card-body">
									<p><strong>AdverFI</strong></p>
									<p>{appConfig.address}</p>
									<p>
										Email: <a href="mailto:{appConfig.supportEmail}" class="link"
											>{appConfig.supportEmail}</a
										>
									</p>
									<p>
										WhatsApp: <a
											href={appConfig.whatsapp}
											target="_blank"
											rel="noopener noreferrer"
											class="link">{appConfig.phone}</a
										>
									</p>
								</div>
							</div>
						</section>

						<div class="divider"></div>

						<div class="mt-8 flex gap-4">
							<a href="/terms-of-service" class="btn btn-outline">
								Syarat dan Ketentuan
								<ChevronRight size={16} />
							</a>
							<a href="/privacy-policy" class="btn btn-outline">
								Kebijakan Privasi
								<ChevronRight size={16} />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<Footer />
</div>
