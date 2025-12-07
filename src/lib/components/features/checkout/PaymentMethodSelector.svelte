<script lang="ts">
	import { PAYMENT_METHODS, type PaymentMethodValue } from '$lib/constants/payment.constants';
	import { CreditCard } from '@lucide/svelte';
	import { t } from 'svelte-i18n';

	let { selected = $bindable() } = $props<{ selected: string }>();
</script>

<div class="form-control mb-6">
	<label class="label">
		<span class="label-text flex items-center gap-2 font-bold">
			<CreditCard size={16} />
			{$t('cart.payment_method')}
		</span>
	</label>
	<div class="join-vertical join w-full">
		{#each PAYMENT_METHODS as method}
			<label
				class="btn join-item h-auto justify-start gap-3 border-base-300 bg-base-100 py-3 transition-all hover:bg-base-200 has-[:checked]:border-primary has-[:checked]:bg-primary/10"
			>
				<input
					type="radio"
					name="payment"
					value={method.value}
					class="radio radio-sm radio-primary"
					bind:group={selected}
				/>
				<div class="flex items-center gap-3 text-left">
					<!-- Icon Wrapper -->
					<div class="flex h-8 w-12 items-center justify-center rounded bg-white p-1 shadow-sm">
						<img
							src={method.icon}
							alt={method.label}
							class="max-h-full max-w-full object-contain"
						/>
					</div>
					<div>
						<div class="font-bold">{method.label}</div>
						<div class="text-xs opacity-70">
							{method.value === 'qris' ? $t('payment.qris_desc') : 'Virtual Account'}
						</div>
					</div>
				</div>
			</label>
		{/each}
	</div>
</div>
