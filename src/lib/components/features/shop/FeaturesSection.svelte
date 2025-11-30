<script lang="ts">
	import { Package, Wallet, Headphones } from '@lucide/svelte';
</script>

<div class="container mx-auto mb-20 px-4">
	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div
			class="flex items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all hover:shadow-md"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
			>
				<Package size={24} />
			</div>
			<div>
				<h3 class="text-lg font-bold">Instant Shipping</h3>
				<p class="text-sm text-base-content/60">Instant delivery for all digital products</p>
			</div>
		</div>

		<div
			class="flex items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all hover:shadow-md"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
			>
				<Wallet size={24} />
			</div>
			<div>
				<h3 class="text-lg font-bold">Flexible Payment</h3>
				<p class="text-sm text-base-content/60">Multiple secure payment options</p>
			</div>
		</div>

		<div
			class="flex items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all hover:shadow-md"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
			>
				<Headphones size={24} />
			</div>
			<div>
				<h3 class="text-lg font-bold">24x7 Support</h3>
				<p class="text-sm text-base-content/60">We support online all days</p>
			</div>
		</div>
	</div>
</div>
