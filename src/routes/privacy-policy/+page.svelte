<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';

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
	<title>Kebijakan Privasi - AdverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto px-4 py-8">
		<div class="breadcrumbs text-sm mb-4">
			<ul>
				<li><a href="/">Beranda</a></li>
				<li>Kebijakan Privasi</li>
			</ul>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- Table of Contents - Sidebar -->
			<div class="lg:col-span-1">
				<div class="card bg-base-100 shadow-xl sticky top-4">
					<div class="card-body">
						<h3 class="font-bold text-lg mb-4">Daftar Isi</h3>
						<ul class="menu menu-sm">
							<li>
								<button onclick={() => scrollToSection('pendahuluan')}>1. Pendahuluan</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('data-dikumpulkan')}>
									2. Data yang Dikumpulkan
								</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('penggunaan-data')}>
									3. Penggunaan Data
								</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('penyimpanan')}>
									4. Penyimpanan dan Keamanan
								</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('cookies')}>5. Cookies</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('berbagi-data')}>6. Berbagi Data</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('hak-pengguna')}>7. Hak Pengguna</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('perubahan')}>
									8. Perubahan Kebijakan
								</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('kontak')}>9. Kontak</button>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Main Content -->
			<div class="lg:col-span-3">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body prose max-w-none">
						<h1 class="text-4xl font-bold mb-2">Kebijakan Privasi</h1>
						<p class="text-sm text-base-content/70 mb-8">
							Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</p>

						<!-- 1. Pendahuluan -->
						<section id="pendahuluan" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">1. Pendahuluan</h2>
							<p class="mb-4">
								AdverFI berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda.
								Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan,
								menyimpan, dan melindungi informasi pribadi Anda saat menggunakan platform kami.
							</p>
							<p class="mb-4">
								Dengan menggunakan layanan AdverFI, Anda menyetujui pengumpulan dan penggunaan
								informasi sesuai dengan kebijakan ini.
							</p>
						</section>

						<!-- 2. Data yang Dikumpulkan -->
						<section id="data-dikumpulkan" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">2. Data yang Dikumpulkan</h2>
							<p class="mb-4">Kami mengumpulkan berbagai jenis informasi untuk memberikan layanan terbaik:</p>

							<h3 class="text-xl font-semibold mb-3">2.1 Informasi yang Anda Berikan</h3>
							<ul class="list-disc pl-6 space-y-2 mb-4">
								<li><strong>Informasi Akun:</strong> Nama lengkap, email, nomor telepon</li>
								<li><strong>Informasi Pembayaran:</strong> Metode pembayaran yang dipilih</li>
								<li><strong>Informasi Transaksi:</strong> Riwayat pembelian dan pesanan</li>
								<li><strong>Komunikasi:</strong> Pesan yang Anda kirim kepada kami</li>
							</ul>

							<h3 class="text-xl font-semibold mb-3">2.2 Informasi yang Dikumpulkan Otomatis</h3>
							<ul class="list-disc pl-6 space-y-2">
								<li><strong>Data Teknis:</strong> Alamat IP, jenis browser, sistem operasi</li>
								<li><strong>Data Penggunaan:</strong> Halaman yang dikunjungi, waktu akses</li>
								<li><strong>Cookies:</strong> Data yang disimpan di perangkat Anda</li>
							</ul>
						</section>

						<!-- 3. Penggunaan Data -->
						<section id="penggunaan-data" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">3. Penggunaan Data</h2>
							<p class="mb-4">Kami menggunakan data yang dikumpulkan untuk:</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>Menyediakan dan mengelola layanan platform</li>
								<li>Memproses transaksi dan pembayaran</li>
								<li>Mengirim konfirmasi pesanan dan notifikasi penting</li>
								<li>Memberikan dukungan pelanggan</li>
								<li>Meningkatkan pengalaman pengguna</li>
								<li>Mencegah penipuan dan aktivitas ilegal</li>
								<li>Mematuhi kewajiban hukum</li>
								<li>Mengirim informasi promosi (dengan persetujuan Anda)</li>
							</ul>
						</section>

						<!-- 4. Penyimpanan dan Keamanan -->
						<section id="penyimpanan" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">4. Penyimpanan dan Keamanan Data</h2>
							<p class="mb-4">
								Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk
								melindungi data pribadi Anda dari akses tidak sah, kehilangan, atau penyalahgunaan.
							</p>

							<h3 class="text-xl font-semibold mb-3">Langkah Keamanan:</h3>
							<ul class="list-disc pl-6 space-y-2 mb-4">
								<li>Enkripsi data saat transmisi (SSL/TLS)</li>
								<li>Penyimpanan password terenkripsi</li>
								<li>Akses terbatas ke data pribadi</li>
								<li>Monitoring keamanan secara berkala</li>
								<li>Backup data secara rutin</li>
							</ul>

							<p class="mb-4">
								<strong>Periode Penyimpanan:</strong> Kami menyimpan data pribadi Anda selama akun
								Anda aktif atau selama diperlukan untuk memberikan layanan. Data dapat disimpan
								lebih lama jika diperlukan untuk mematuhi kewajiban hukum.
							</p>
						</section>

						<!-- 5. Cookies -->
						<section id="cookies" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">5. Cookies dan Teknologi Pelacakan</h2>
							<p class="mb-4">
								Kami menggunakan cookies dan teknologi serupa untuk meningkatkan pengalaman Anda
								di platform kami.
							</p>

							<h3 class="text-xl font-semibold mb-3">Jenis Cookies:</h3>
							<ul class="list-disc pl-6 space-y-2 mb-4">
								<li>
									<strong>Cookies Esensial:</strong> Diperlukan untuk fungsi dasar platform (login,
									keranjang belanja)
								</li>
								<li>
									<strong>Cookies Analitik:</strong> Membantu kami memahami bagaimana pengguna
									berinteraksi dengan platform
								</li>
								<li>
									<strong>Cookies Preferensi:</strong> Menyimpan pilihan dan pengaturan Anda
								</li>
							</ul>

							<p class="mb-4">
								Anda dapat mengatur browser Anda untuk menolak cookies, namun beberapa fitur
								platform mungkin tidak berfungsi dengan baik.
							</p>
						</section>

						<!-- 6. Berbagi Data -->
						<section id="berbagi-data" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">6. Berbagi Data dengan Pihak Ketiga</h2>
							<p class="mb-4">
								Kami tidak menjual data pribadi Anda. Namun, kami dapat membagikan informasi dalam
								situasi berikut:
							</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>
									<strong>Penyedia Layanan:</strong> Payment gateway, hosting, email service
								</li>
								<li>
									<strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum atau proses hukum
								</li>
								<li>
									<strong>Perlindungan Hak:</strong> Untuk melindungi hak, properti, atau keamanan
									AdverFI dan pengguna
								</li>
								<li>
									<strong>Dengan Persetujuan:</strong> Dalam kasus lain dengan persetujuan eksplisit
									Anda
								</li>
							</ul>
						</section>

						<!-- 7. Hak Pengguna -->
						<section id="hak-pengguna" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">7. Hak Pengguna atas Data Pribadi</h2>
							<p class="mb-4">Anda memiliki hak untuk:</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>
									<strong>Akses:</strong> Meminta salinan data pribadi yang kami simpan tentang Anda
								</li>
								<li>
									<strong>Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat
								</li>
								<li>
									<strong>Penghapusan:</strong> Meminta penghapusan data pribadi Anda (dengan
									pengecualian tertentu)
								</li>
								<li>
									<strong>Pembatasan:</strong> Membatasi pemrosesan data pribadi Anda
								</li>
								<li>
									<strong>Portabilitas:</strong> Menerima data Anda dalam format yang dapat dibaca
									mesin
								</li>
								<li>
									<strong>Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu
								</li>
							</ul>

							<p class="mt-4">
								Untuk menggunakan hak-hak ini, silakan hubungi kami di support@adverfi.id
							</p>
						</section>

						<!-- 8. Perubahan Kebijakan -->
						<section id="perubahan" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">8. Perubahan Kebijakan Privasi</h2>
							<p class="mb-4">
								Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk
								mencerminkan perubahan dalam praktik kami atau untuk alasan operasional, hukum,
								atau regulasi lainnya.
							</p>
							<p class="mb-4">
								Perubahan signifikan akan kami beritahukan melalui email atau pemberitahuan di
								platform. Tanggal "Terakhir diperbarui" di bagian atas akan diperbarui sesuai
								dengan perubahan.
							</p>
						</section>

						<!-- 9. Kontak -->
						<section id="kontak" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">9. Hubungi Kami</h2>
							<p class="mb-4">
								Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait privasi dan
								data pribadi Anda, silakan hubungi kami:
							</p>
							<div class="card bg-base-200">
								<div class="card-body">
									<p><strong>AdverFI</strong></p>
									<p>Gatak, Sukoharjo</p>
									<p>
										Email: <a href="mailto:support@adverfi.id" class="link">support@adverfi.id</a>
									</p>
									<p class="mt-2 text-sm text-base-content/70">
										Kami akan merespons permintaan Anda dalam waktu 14 hari kerja.
									</p>
								</div>
							</div>
						</section>

						<div class="divider"></div>

						<div class="flex gap-4 mt-8">
							<a href="/terms-of-service" class="btn btn-outline">
								Syarat dan Ketentuan
								<ChevronRight size={16} />
							</a>
							<a href="/disclaimer" class="btn btn-outline">
								Disclaimer
								<ChevronRight size={16} />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
