<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { Mail, Phone, MapPin, Send, MessageSquare } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';
	import { appConfig } from '$lib/config/app.config';
	import Turnstile from '$lib/components/ui/Turnstile.svelte';

	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let isSubmitting = $state(false);
	let turnstileToken = $state('');
	let turnstileRef: any = $state(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!name || !email || !subject || !message) {
			toast.error('Mohon lengkapi semua field');
			return;
		}

		if (message.length < 10) {
			toast.error('Pesan minimal 10 karakter');
			return;
		}

		if (!turnstileToken) {
			toast.error('Silakan selesaikan verifikasi keamanan');
			return;
		}

		isSubmitting = true;

		try {
			// Verify turnstile first
			const verifyRes = await fetch('/api/auth/verify-turnstile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: turnstileToken })
			});

			if (!verifyRes.ok) {
				toast.error('Verifikasi keamanan gagal. Silakan coba lagi.');
				isSubmitting = false;
				turnstileToken = '';
				turnstileRef?.reset();
				return;
			}

			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, subject, message })
			});

			const data = await res.json();

			if (!res.ok) {
				toast.error(data.error || 'Gagal mengirim pesan');
				return;
			}

			toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
			name = '';
			email = '';
			subject = '';
			message = '';
			turnstileToken = '';
			turnstileRef?.reset();
		} catch (error) {
			console.error('Submit error:', error);
			toast.error('Terjadi kesalahan. Silakan coba lagi.');
			turnstileToken = '';
			turnstileRef?.reset();
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Hubungi Kami - AdverFI</title>
	<meta
		name="description"
		content="Hubungi tim AdverFI untuk pertanyaan, dukungan, atau kerjasama. Kami siap membantu Anda 24/7."
	/>
</svelte:head>

<Navbar />

<div class="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-24">
	<div class="container mx-auto px-4 pb-20">
		<!-- Header -->
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold md:text-5xl">Hubungi Kami</h1>
			<p class="mx-auto max-w-2xl text-lg text-base-content/70">
				Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda 24/7
			</p>
		</div>

		<div class="mx-auto max-w-6xl">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<!-- Contact Information Cards -->
				<div class="space-y-6 lg:col-span-1">
					<!-- Email Card -->
					<div
						class="card border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl transition-transform hover:scale-105"
					>
						<div class="card-body">
							<div class="mb-3 flex items-center gap-3">
								<div class="rounded-full bg-primary/20 p-3">
									<Mail size={24} class="text-primary" />
								</div>
								<h3 class="text-xl font-bold">Email</h3>
							</div>
							<p class="text-base-content/80">Kirim email ke:</p>
							<a href="mailto:support@adverfi.id" class="link text-lg font-semibold text-primary">
								support@adverfi.id
							</a>
							<p class="mt-2 text-sm text-base-content/60">Kami akan membalas dalam 24 jam</p>
						</div>
					</div>

					<!-- Phone Card -->
					<div
						class="card border border-success/30 bg-gradient-to-br from-success/10 to-success/5 shadow-xl transition-transform hover:scale-105"
					>
						<div class="card-body">
							<div class="mb-3 flex items-center gap-3">
								<div class="rounded-full bg-success/20 p-3">
									<Phone size={24} class="text-success" />
								</div>
								<h3 class="text-xl font-bold">WhatsApp</h3>
							</div>
							<p class="text-base-content/80">Chat dengan kami:</p>
							<a
								href="https://wa.me/6281616666202"
								target="_blank"
								rel="noopener noreferrer"
								class="link text-lg font-semibold text-success"
							>
								+62 816-1666-202
							</a>
							<p class="mt-2 text-sm text-base-content/60">Senin - Minggu, 08:00 - 22:00 WIB</p>
						</div>
					</div>

					<!-- Location Card -->
					<div
						class="card border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 shadow-xl transition-transform hover:scale-105"
					>
						<div class="card-body">
							<div class="mb-3 flex items-center gap-3">
								<div class="rounded-full bg-accent/20 p-3">
									<MapPin size={24} class="text-accent" />
								</div>
								<h3 class="text-xl font-bold">Lokasi</h3>
							</div>
							<p class="text-base-content/80">Kantor kami:</p>
							<p class="text-lg font-semibold">Gatak, Sukoharjo</p>
							<p class="mt-2 text-sm text-base-content/60">Jawa Tengah, Indonesia</p>
						</div>
					</div>
				</div>

				<!-- Contact Form -->
				<div class="lg:col-span-2">
					<div class="card border border-base-300 bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="mb-6 card-title text-2xl">Kirim Pesan</h2>

							<form onsubmit={handleSubmit} class="space-y-6">
								<!-- Name -->
								<div class="form-control">
									<label for="name" class="label">
										<span class="label-text font-semibold">Nama Lengkap</span>
									</label>
									<input
										id="name"
										type="text"
										bind:value={name}
										placeholder="Masukkan nama lengkap Anda"
										class="input-bordered input w-full"
										required
									/>
								</div>

								<!-- Email -->
								<div class="form-control">
									<label for="email" class="label">
										<span class="label-text font-semibold">Email</span>
									</label>
									<input
										id="email"
										type="email"
										bind:value={email}
										placeholder="nama@email.com"
										class="input-bordered input w-full"
										required
									/>
								</div>

								<!-- Subject -->
								<div class="form-control">
									<label for="subject" class="label">
										<span class="label-text font-semibold">Subjek</span>
									</label>
									<input
										id="subject"
										type="text"
										bind:value={subject}
										placeholder="Topik pesan Anda"
										class="input-bordered input w-full"
										required
									/>
								</div>

								<!-- Message -->
								<div class="form-control">
									<label for="message" class="label">
										<span class="label-text font-semibold">Pesan</span>
									</label>
									<textarea
										id="message"
										bind:value={message}
										placeholder="Tulis pesan Anda di sini..."
										class="textarea-bordered textarea h-32 w-full"
										required
									></textarea>
									<label class="label" for="message">
										<span class="label-text-alt text-base-content/60">Minimal 10 karakter</span>
									</label>
								</div>

								<!-- Turnstile Widget -->
								<div class="form-control">
									<Turnstile
										bind:this={turnstileRef}
										onVerify={(token) => (turnstileToken = token)}
										onError={() => {
											turnstileToken = '';
											toast.error('Verifikasi keamanan gagal');
										}}
										onExpire={() => {
											turnstileToken = '';
										}}
									/>
								</div>

								<!-- Submit Button -->
								<button
									type="submit"
									class="btn btn-block gap-2 btn-primary"
									disabled={isSubmitting || !turnstileToken}
								>
									{#if isSubmitting}
										<span class="loading loading-sm loading-spinner"></span>
										Mengirim...
									{:else}
										<Send size={20} />
										Kirim Pesan
									{/if}
								</button>
							</form>

							<!-- Additional Info -->
							<div class="divider"></div>
							<div class="alert alert-info">
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
								<span
									>Untuk pertanyaan umum, silakan cek <a href="/faq" class="link font-semibold"
										>FAQ</a
									> kami terlebih dahulu.</span
								>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- FAQ Quick Links -->
			<div class="mt-12">
				<h2 class="mb-6 text-center text-2xl font-bold">Pertanyaan Umum</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<a
						href="/faq"
						class="card border border-base-300 bg-base-100 shadow-md transition-all hover:shadow-xl"
					>
						<div class="card-body">
							<h3 class="card-title text-lg">Cara Berbelanja</h3>
							<p class="text-sm text-base-content/70">
								Pelajari cara melakukan pembelian di platform kami
							</p>
						</div>
					</a>
					<a
						href="/faq"
						class="card border border-base-300 bg-base-100 shadow-md transition-all hover:shadow-xl"
					>
						<div class="card-body">
							<h3 class="card-title text-lg">Metode Pembayaran</h3>
							<p class="text-sm text-base-content/70">
								Informasi tentang metode pembayaran yang tersedia
							</p>
						</div>
					</a>
					<a
						href="/faq"
						class="card border border-base-300 bg-base-100 shadow-md transition-all hover:shadow-xl"
					>
						<div class="card-body">
							<h3 class="card-title text-lg">Kebijakan Refund</h3>
							<p class="text-sm text-base-content/70">Ketentuan dan prosedur pengembalian dana</p>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<Footer />
