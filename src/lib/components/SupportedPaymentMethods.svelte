<script lang="ts">
	import { PAYMENT_METHODS } from '$lib/constants/payment.constants';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let visible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visible = true;
					}
				});
			},
			{ threshold: 0.2 }
		);

		const section = document.querySelector('#payment-methods');
		if (section) observer.observe(section);

		return () => observer.disconnect();
	});
</script>

<div
	id="payment-methods"
	class="relative overflow-hidden bg-gradient-to-b from-base-200 to-base-100 py-20"
>
	<div class="container mx-auto px-4">
		{#if visible}
			<div class="mb-12 text-center" in:fly={{ y: 20, duration: 500 }}>
				<div class="mb-4 inline-block">
					<span class="text-sm font-bold tracking-wider text-primary uppercase"
						>Metode Pembayaran</span
					>
				</div>
				<h2 class="mb-4 text-3xl font-black md:text-4xl lg:text-5xl">Supported Payment Methods</h2>
				<p class="mx-auto max-w-2xl text-base text-base-content/70 md:text-lg">
					Kami mendukung berbagai metode pembayaran untuk kemudahan transaksi Anda
				</p>
			</div>
		{/if}

		<div class="mx-auto max-w-5xl">
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
				{#if visible}
					{#each PAYMENT_METHODS as method, i}
						<div class="group h-full" in:fly={{ y: 20, duration: 500, delay: i * 50 }}>
							<div
								class="flex h-full flex-col items-center justify-center rounded-2xl p-5 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:bg-base-200 group-hover:shadow-[0_10px_30px_-5px_oklch(var(--p)/0.2)]"
							>
								<div class="flex h-[50px] w-full items-center justify-center p-2 sm:h-[60px]">
									<img
										src={method.icon}
										alt={method.label}
										class="max-h-full max-w-full object-contain grayscale-[0.3] transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0"
									/>
								</div>
								<div class="mt-3 text-center text-xs font-semibold text-base-content/80">
									{method.label}
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
