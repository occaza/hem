<script lang="ts">
	import { Package, Wallet, Headphones } from '@lucide/svelte';
	import { t } from 'svelte-i18n';
</script>

<div class="container mx-auto my-20 px-4">
	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="flex items-center gap-4 p-6 transition-all">
			<div
				class="text-content-secondary flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50"
			>
				<Package size={24} />
			</div>
			<div>
				<h3 class="text-lg font-bold">{$t('features.instant_shipping.title')}</h3>
				<p class="text-sm text-base-content/60">{$t('features.instant_shipping.description')}</p>
			</div>
		</div>

		<div class="flex items-center gap-4 p-6 transition-all">
			<div
				class="text-content-secondary flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50"
			>
				<Wallet size={24} />
			</div>
			<div>
				<h3 class="text-lg font-bold">{$t('features.flexible_payment.title')}</h3>
				<p class="text-sm text-base-content/60">{$t('features.flexible_payment.description')}</p>
			</div>
		</div>

		<div class="flex items-center gap-4 p-6 transition-all">
			<div
				class="text-content-secondary flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50"
			>
				<Headphones size={24} />
			</div>
			<div>
				<h3 class="text-lg font-bold">{$t('features.support_247.title')}</h3>
				<p class="text-sm text-base-content/60">{$t('features.support_247.description')}</p>
			</div>
		</div>
	</div>
</div>
