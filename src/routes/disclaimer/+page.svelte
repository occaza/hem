<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
</script>

<svelte:head>
	<title>Disclaimer - AdverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto px-4 py-8">
		<div class="breadcrumbs mb-4 text-sm">
			<ul>
				<li><a href="/">Beranda</a></li>
				<li>Disclaimer</li>
			</ul>
		</div>

		<div class="mx-auto max-w-4xl">
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body prose max-w-none">
					<h1 class="mb-2 text-4xl font-bold">Disclaimer</h1>
					<p class="mb-8 text-sm text-base-content/70">
						Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>

					<div class="mb-8 alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="h-6 w-6 shrink-0 stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span>
							Harap baca disclaimer ini dengan seksama sebelum menggunakan layanan AdverFI.
						</span>
					</div>

					<!-- Pendahuluan -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">Pendahuluan</h2>
						<p class="mb-4">
							Disclaimer ini berlaku untuk seluruh konten, produk, dan layanan yang tersedia di
							platform AdverFI. Dengan mengakses dan menggunakan platform kami, Anda mengakui bahwa
							Anda telah membaca, memahami, dan menyetujui disclaimer ini.
						</p>
					</section>

					<!-- Batasan Tanggung Jawab Umum -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">1. Batasan Tanggung Jawab Umum</h2>
						<p class="mb-4">
							Informasi yang disediakan di platform AdverFI hanya untuk tujuan informasi umum.
							Meskipun kami berusaha menjaga informasi tetap akurat dan terkini, kami tidak
							memberikan jaminan atau representasi apa pun, tersurat maupun tersirat, tentang
							kelengkapan, keakuratan, keandalan, kesesuaian, atau ketersediaan platform atau
							informasi yang terkandung di dalamnya.
						</p>
						<p class="mb-4">
							<strong>AdverFI tidak bertanggung jawab atas:</strong>
						</p>
						<ul class="list-disc space-y-2 pl-6">
							<li>Kerugian atau kerusakan yang timbul dari penggunaan platform kami</li>
							<li>Gangguan layanan, kesalahan teknis, atau downtime</li>
							<li>Kehilangan data atau informasi</li>
							<li>Kerugian finansial akibat transaksi di platform</li>
							<li>Keputusan yang dibuat berdasarkan informasi di platform</li>
						</ul>
					</section>

					<!-- Produk Digital -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">2. Produk dan Layanan Digital</h2>
						<p class="mb-4">
							Produk digital yang dijual melalui platform AdverFI disediakan "sebagaimana adanya"
							tanpa jaminan apa pun, baik tersurat maupun tersirat.
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
							<span><strong>Tidak Ada Jaminan Hasil</strong></span>
						</div>

						<p class="mb-4">Kami tidak menjamin bahwa:</p>
						<ul class="list-disc space-y-2 pl-6">
							<li>Produk akan memenuhi kebutuhan atau ekspektasi spesifik Anda</li>
							<li>Produk akan menghasilkan hasil tertentu</li>
							<li>Produk bebas dari kesalahan atau bug</li>
							<li>Layanan akan tersedia tanpa gangguan atau aman sepenuhnya</li>
						</ul>
					</section>

					<!-- Konten Pihak Ketiga -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">3. Konten dan Link Pihak Ketiga</h2>
						<p class="mb-4">
							Platform kami mungkin berisi link ke website atau layanan pihak ketiga yang tidak
							dimiliki atau dikendalikan oleh AdverFI.
						</p>
						<p class="mb-4">
							AdverFI tidak memiliki kontrol atas, dan tidak bertanggung jawab atas konten,
							kebijakan privasi, atau praktik dari website atau layanan pihak ketiga mana pun. Anda
							mengakui dan setuju bahwa AdverFI tidak bertanggung jawab, baik secara langsung maupun
							tidak langsung, atas kerusakan atau kerugian yang disebabkan atau diduga disebabkan
							oleh penggunaan konten, Item, atau layanan pihak ketiga.
						</p>
					</section>

					<!-- Akurasi Informasi -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">4. Akurasi Informasi Produk</h2>
						<p class="mb-4">
							Kami berusaha untuk menyediakan deskripsi produk yang akurat. Namun, kami tidak
							menjamin bahwa deskripsi produk, harga, atau konten lain di platform adalah akurat,
							lengkap, dapat diandalkan, terkini, atau bebas dari kesalahan.
						</p>
						<p class="mb-4">
							Jika produk yang Anda beli tidak sesuai dengan deskripsi, silakan hubungi kami di
							support@adverfi.id untuk penyelesaian.
						</p>
					</section>

					<!-- Keamanan -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">5. Keamanan dan Virus</h2>
						<p class="mb-4">
							Meskipun kami mengambil langkah-langkah keamanan yang wajar, kami tidak menjamin bahwa
							platform kami akan aman atau bebas dari bug atau virus.
						</p>
						<p class="mb-4">
							Anda bertanggung jawab untuk mengkonfigurasi teknologi informasi, program komputer,
							dan platform Anda sendiri untuk mengakses platform kami. Anda harus menggunakan
							perangkat lunak anti-virus Anda sendiri.
						</p>
					</section>

					<!-- Perubahan Tanpa Pemberitahuan -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">6. Perubahan Tanpa Pemberitahuan</h2>
						<p class="mb-4">
							AdverFI berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian mana pun
							dari platform, produk, atau layanan kapan saja tanpa pemberitahuan sebelumnya.
						</p>
						<p class="mb-4">
							Kami juga berhak untuk mengubah disclaimer ini sewaktu-waktu. Perubahan akan berlaku
							segera setelah dipublikasikan di platform.
						</p>
					</section>

					<!-- Hukum yang Berlaku -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">7. Hukum yang Berlaku</h2>
						<p class="mb-4">
							Disclaimer ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.
							Setiap perselisihan yang timbul sehubungan dengan disclaimer ini akan tunduk pada
							yurisdiksi eksklusif pengadilan Indonesia.
						</p>
					</section>

					<!-- Kontak -->
					<section class="mb-8">
						<h2 class="mb-4 text-2xl font-bold">8. Pertanyaan dan Kontak</h2>
						<p class="mb-4">
							Jika Anda memiliki pertanyaan tentang Disclaimer ini, silakan hubungi kami:
						</p>
						<div class="card bg-base-200">
							<div class="card-body">
								<p><strong>AdverFI</strong></p>
								<p>Gatak, Sukoharjo</p>
								<p>
									Email: <a href="mailto:support@adverfi.id" class="link">support@adverfi.id</a>
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
	<Footer />
</div>
