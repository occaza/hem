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
	<title>Syarat dan Ketentuan - AdverFI</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto px-4 py-8">
		<div class="breadcrumbs text-sm mb-4">
			<ul>
				<li><a href="/">Beranda</a></li>
				<li>Syarat dan Ketentuan</li>
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
								<button onclick={() => scrollToSection('definisi')}>2. Definisi</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('layanan')}>3. Layanan Kami</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('akun')}>4. Akun Pengguna</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('pembayaran')}>5. Pembayaran</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('refund')}>6. Kebijakan Refund</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('tanggung-jawab')}>
									7. Batasan Tanggung Jawab
								</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('perubahan')}>8. Perubahan Layanan</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('hukum')}>9. Hukum yang Berlaku</button>
							</li>
							<li>
								<button onclick={() => scrollToSection('kontak')}>10. Kontak</button>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Main Content -->
			<div class="lg:col-span-3">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body prose max-w-none">
						<h1 class="text-4xl font-bold mb-2">Syarat dan Ketentuan</h1>
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
								Selamat datang di AdverFI. Dengan mengakses dan menggunakan platform kami, Anda
								setuju untuk terikat dengan Syarat dan Ketentuan berikut. Harap baca dengan
								seksama sebelum menggunakan layanan kami.
							</p>
							<p class="mb-4">
								Jika Anda tidak setuju dengan syarat dan ketentuan ini, mohon untuk tidak
								menggunakan layanan kami.
							</p>
						</section>

						<!-- 2. Definisi -->
						<section id="definisi" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">2. Definisi</h2>
							<ul class="list-disc pl-6 space-y-2">
								<li>
									<strong>"Platform"</strong> mengacu pada website AdverFI dan semua layanan yang
									disediakan.
								</li>
								<li>
									<strong>"Pengguna"</strong> adalah setiap individu yang mengakses atau menggunakan
									Platform.
								</li>
								<li>
									<strong>"Produk Digital"</strong> adalah barang atau layanan digital yang dijual
									melalui Platform.
								</li>
								<li><strong>"Kami"</strong> atau <strong>"AdverFI"</strong> mengacu pada penyedia layanan.</li>
							</ul>
						</section>

						<!-- 3. Layanan Kami -->
						<section id="layanan" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">3. Layanan Kami</h2>
							<p class="mb-4">
								AdverFI adalah platform marketplace digital yang menyediakan berbagai produk dan
								layanan digital. Kami bertindak sebagai perantara antara penjual dan pembeli.
							</p>
							<p class="mb-4">Layanan yang kami sediakan meliputi:</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>Platform jual beli produk digital</li>
								<li>Sistem pembayaran yang aman</li>
								<li>Layanan pelanggan dan dukungan teknis</li>
								<li>Perlindungan data pengguna</li>
							</ul>
						</section>

						<!-- 4. Akun Pengguna -->
						<section id="akun" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">4. Akun Pengguna</h2>
							<p class="mb-4">
								Untuk menggunakan layanan tertentu, Anda harus membuat akun. Anda bertanggung
								jawab untuk:
							</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>Memberikan informasi yang akurat dan lengkap saat registrasi</li>
								<li>Menjaga kerahasiaan password dan informasi akun Anda</li>
								<li>Semua aktivitas yang terjadi di bawah akun Anda</li>
								<li>Segera memberitahu kami jika terjadi penggunaan tidak sah atas akun Anda</li>
							</ul>
							<p class="mt-4">
								Kami berhak menangguhkan atau menghapus akun yang melanggar syarat dan ketentuan
								ini.
							</p>
						</section>

						<!-- 5. Pembayaran -->
						<section id="pembayaran" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">5. Pembayaran</h2>
							<p class="mb-4">
								Semua transaksi di Platform harus dilakukan melalui metode pembayaran yang telah
								disediakan. Dengan melakukan pembayaran, Anda menyetujui bahwa:
							</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>Harga yang tertera sudah termasuk pajak yang berlaku</li>
								<li>Pembayaran harus dilakukan dalam waktu yang ditentukan</li>
								<li>Transaksi yang sudah dibayar tidak dapat dibatalkan secara sepihak</li>
								<li>Kami menggunakan gateway pembayaran pihak ketiga yang aman</li>
							</ul>
						</section>

						<!-- 6. Kebijakan Refund -->
						<section id="refund" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">6. Kebijakan Refund</h2>
							<div class="alert alert-warning mb-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="stroke-current shrink-0 h-6 w-6"
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
								<span><strong>Penting:</strong> Kebijakan No Refund</span>
							</div>
							<p class="mb-4">
								Secara umum, <strong>kami tidak menerima permintaan refund</strong> untuk produk
								digital yang telah dibeli, karena sifat produk digital yang tidak dapat
								dikembalikan.
							</p>
							<p class="mb-4">
								<strong>Pengecualian:</strong> Refund hanya dapat diproses jika ada perjanjian
								khusus antara admin AdverFI dan pembeli, dalam kasus-kasus tertentu seperti:
							</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>Produk yang diterima tidak sesuai dengan deskripsi</li>
								<li>Terjadi kesalahan teknis dalam pengiriman produk</li>
								<li>Produk tidak dapat digunakan sama sekali</li>
							</ul>
							<p class="mt-4">
								Untuk mengajukan permintaan refund khusus, silakan hubungi support@adverfi.id
								dengan menyertakan bukti dan penjelasan lengkap.
							</p>
						</section>

						<!-- 7. Batasan Tanggung Jawab -->
						<section id="tanggung-jawab" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">7. Batasan Tanggung Jawab</h2>
							<p class="mb-4">
								AdverFI tidak bertanggung jawab atas kerugian yang timbul dari:
							</p>
							<ul class="list-disc pl-6 space-y-2">
								<li>Penggunaan atau ketidakmampuan menggunakan layanan kami</li>
								<li>Kesalahan, kelalaian, atau ketidakakuratan konten</li>
								<li>Gangguan atau penghentian layanan sementara</li>
								<li>Virus atau malware yang mungkin ditransmisikan melalui Platform</li>
								<li>Kerugian tidak langsung, insidental, atau konsekuensial</li>
							</ul>
							<p class="mt-4">
								Tanggung jawab kami terbatas pada jumlah yang Anda bayarkan untuk produk atau
								layanan tertentu.
							</p>
						</section>

						<!-- 8. Perubahan Layanan -->
						<section id="perubahan" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">8. Perubahan Layanan dan Syarat</h2>
							<p class="mb-4">
								Kami berhak untuk mengubah, memodifikasi, atau menghentikan layanan (atau bagian
								darinya) kapan saja dengan atau tanpa pemberitahuan sebelumnya.
							</p>
							<p class="mb-4">
								Syarat dan Ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan akan berlaku
								segera setelah dipublikasikan di Platform. Penggunaan berkelanjutan atas layanan
								kami setelah perubahan berarti Anda menyetujui syarat yang diperbarui.
							</p>
						</section>

						<!-- 9. Hukum yang Berlaku -->
						<section id="hukum" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">9. Hukum yang Berlaku</h2>
							<p class="mb-4">
								Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik
								Indonesia. Setiap perselisihan yang timbul akan diselesaikan melalui pengadilan
								yang berwenang di Indonesia.
							</p>
							<p class="mb-4">
								Platform ini tunduk pada Undang-Undang Informasi dan Transaksi Elektronik (UU ITE)
								dan peraturan terkait lainnya yang berlaku di Indonesia.
							</p>
						</section>

						<!-- 10. Kontak -->
						<section id="kontak" class="mb-8">
							<h2 class="text-2xl font-bold mb-4">10. Kontak</h2>
							<p class="mb-4">
								Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi
								kami:
							</p>
							<div class="card bg-base-200">
								<div class="card-body">
									<p><strong>AdverFI</strong></p>
									<p>Gatak, Sukoharjo</p>
									<p>Email: <a href="mailto:support@adverfi.id" class="link">support@adverfi.id</a></p>
								</div>
							</div>
						</section>

						<div class="divider"></div>

						<div class="flex gap-4 mt-8">
							<a href="/privacy-policy" class="btn btn-outline">
								Kebijakan Privasi
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
