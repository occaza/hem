<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { Mail, Phone, MapPin, Send, MessageSquare } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast.store';
	import { appConfig } from '$lib/config/app.config';
	import Turnstile from '$lib/components/ui/Turnstile.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';

	import { fetchWithCSRF } from '$lib/utils/csrf.utils';
	import { t } from 'svelte-i18n';

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
			toast.error($t('contact.form.fill_all'));
			return;
		}

		if (message.length < 10) {
			toast.error($t('contact.form.min_chars'));
			return;
		}

		if (!turnstileToken) {
			toast.error($t('contact.form.captcha_prompt'));
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
				toast.error($t('contact.form.captcha_error'));
				isSubmitting = false;
				turnstileToken = '';
				turnstileRef?.reset();
				return;
			}

			const res = await fetchWithCSRF('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, subject, message })
			});

			const data = await res.json();

			if (!res.ok) {
				toast.error(data.error || $t('contact.form.error'));
				return;
			}

			toast.success($t('contact.form.success'));
			name = '';
			email = '';
			subject = '';
			message = '';
			turnstileToken = '';
			turnstileRef?.reset();
		} catch (error) {
			console.error('Submit error:', error);
			toast.error($t('common.error'));
			turnstileToken = '';
			turnstileRef?.reset();
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('contact.title')} - AdverFI</title>
	<meta name="description" content={$t('contact.meta_desc')} />
</svelte:head>

<Navbar />

<PageHeader
	title={$t('contact.title')}
	breadcrumbs={[
		{ label: $t('nav.home'), href: '/' },
		{ label: $t('contact.title'), href: '/contact' }
	]}
/>

<div class="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-12">
	<div class="container mx-auto px-4 pb-20">
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
								<h3 class="text-xl font-bold">{$t('contact.email.title')}</h3>
							</div>
							<p class="text-base-content/80">{$t('contact.email.send_to')}</p>
							<a
								href="mailto:{appConfig.supportEmail}"
								class="link text-lg font-semibold text-primary"
							>
								{appConfig.supportEmail}
							</a>
							<p class="mt-2 text-sm text-base-content/60">{$t('contact.email.reply_time')}</p>
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
								<h3 class="text-xl font-bold">{$t('contact.whatsapp.title')}</h3>
							</div>
							<p class="text-base-content/80">{$t('contact.whatsapp.chat_with_us')}</p>
							<a
								href={appConfig.whatsapp}
								target="_blank"
								rel="noopener noreferrer"
								class="link text-lg font-semibold text-success"
							>
								{appConfig.phone}
							</a>
							<p class="mt-2 text-sm text-base-content/60">
								{$t('contact.whatsapp.working_hours', {
									values: { hours: appConfig.workingHours }
								})}
							</p>
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
								<h3 class="text-xl font-bold">{$t('contact.location.title')}</h3>
							</div>
							<p class="text-base-content/80">{$t('contact.location.our_office')}</p>
							<p class="text-lg font-semibold">{appConfig.address}</p>
							<p class="mt-2 text-sm text-base-content/60">{$t('contact.location.region')}</p>
						</div>
					</div>
				</div>

				<!-- Contact Form -->
				<div class="lg:col-span-2">
					<div class="card border border-base-300 bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="mb-6 card-title text-2xl">{$t('contact.form.title')}</h2>

							<form onsubmit={handleSubmit} class="space-y-6">
								<!-- Name -->
								<div class="form-control">
									<label for="name" class="label">
										<span class="label-text font-semibold">{$t('contact.form.name')}</span>
									</label>
									<input
										id="name"
										type="text"
										bind:value={name}
										placeholder={$t('contact.form.name_placeholder')}
										class="input-bordered input w-full"
										required
									/>
								</div>

								<!-- Email -->
								<div class="form-control">
									<label for="email" class="label">
										<span class="label-text font-semibold">{$t('contact.form.email')}</span>
									</label>
									<input
										id="email"
										type="email"
										bind:value={email}
										placeholder={$t('contact.form.email_placeholder')}
										class="input-bordered input w-full"
										required
									/>
								</div>

								<!-- Subject -->
								<div class="form-control">
									<label for="subject" class="label">
										<span class="label-text font-semibold">{$t('contact.form.subject')}</span>
									</label>
									<input
										id="subject"
										type="text"
										bind:value={subject}
										placeholder={$t('contact.form.subject_placeholder')}
										class="input-bordered input w-full"
										required
									/>
								</div>

								<!-- Message -->
								<div class="form-control">
									<label for="message" class="label">
										<span class="label-text font-semibold">{$t('contact.form.message')}</span>
									</label>
									<textarea
										id="message"
										bind:value={message}
										placeholder={$t('contact.form.message_placeholder')}
										class="textarea-bordered textarea h-32 w-full"
										required
									></textarea>
									<label class="label" for="message">
										<span class="label-text-alt text-base-content/60"
											>{$t('contact.form.min_chars')}</span
										>
									</label>
								</div>

								<!-- Turnstile Widget -->
								<div class="form-control">
									<Turnstile
										bind:this={turnstileRef}
										onVerify={(token) => (turnstileToken = token)}
										onError={() => {
											turnstileToken = '';
											toast.error($t('contact.form.captcha_error'));
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
										{$t('contact.form.sending')}
									{:else}
										<Send size={20} />
										{$t('contact.form.send')}
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
								<span>{@html $t('contact.faq.check_link')}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- FAQ Quick Links -->
			<div class="mt-12">
				<h2 class="mb-6 text-center text-2xl font-bold">{$t('contact.faq.title')}</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<a
						href="/faq"
						class="card border border-base-300 bg-base-100 shadow-md transition-all hover:shadow-xl"
					>
						<div class="card-body">
							<h3 class="card-title text-lg">{$t('contact.faq.how_to_shop')}</h3>
							<p class="text-sm text-base-content/70">
								{$t('contact.faq.how_to_shop_desc')}
							</p>
						</div>
					</a>
					<a
						href="/faq"
						class="card border border-base-300 bg-base-100 shadow-md transition-all hover:shadow-xl"
					>
						<div class="card-body">
							<h3 class="card-title text-lg">{$t('contact.faq.payment_method')}</h3>
							<p class="text-sm text-base-content/70">
								{$t('contact.faq.payment_method_desc')}
							</p>
						</div>
					</a>
					<a
						href="/faq"
						class="card border border-base-300 bg-base-100 shadow-md transition-all hover:shadow-xl"
					>
						<div class="card-body">
							<h3 class="card-title text-lg">{$t('contact.faq.refund_policy')}</h3>
							<p class="text-sm text-base-content/70">{$t('contact.faq.refund_policy_desc')}</p>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<Footer />
