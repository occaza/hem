<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatCurrency, formatShortDate } from '$lib/utils/format.utils';
	import { toast } from '$lib/stores/toast.store';
	import { onMount, onDestroy } from 'svelte';
	import { t } from 'svelte-i18n';

	type Props = {
		product: any;
		paymentData: any;
		qrImageUrl: string;
		isSimulating: boolean;
		isCartCheckout?: boolean;
		isDevelopment?: boolean;
		onClose: () => void;
		onSimulate: () => void;
	};

	let {
		product,
		paymentData,
		qrImageUrl,
		isSimulating,
		isCartCheckout = false,
		isDevelopment = false,
		onClose,
		onSimulate
	}: Props = $props();

	let pollingInterval: any = null;

	// Auto-reload polling untuk check payment status
	onMount(() => {
		startPolling();
	});

	onDestroy(() => {
		if (pollingInterval) clearInterval(pollingInterval);
	});

	function startPolling() {
		pollingInterval = setInterval(async () => {
			try {
				const res = await fetch('/api/check-payment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ order_id: paymentData.order_id })
				});

				const data = await res.json();

				// Check untuk processing atau completed
				if (data.status === 'processing' || data.status === 'completed') {
					clearInterval(pollingInterval);
					// Redirect to success page
					window.location.href = `/success?order_id=${paymentData.order_id}`;
				}
			} catch (error) {
				console.error('Polling error:', error);
			}
		}, 3000); // Check every 3 seconds

		// Timeout after 10 minutes
		setTimeout(
			() => {
				if (pollingInterval) clearInterval(pollingInterval);
			},
			10 * 60 * 1000
		);
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.success($t('payment.success_msg.copied'));
	}

	function handleSimulate() {
		onSimulate();
		setTimeout(() => {
			goto(`/success?order_id=${paymentData.order_id}&simulated=true`);
		}, 2000);
	}
</script>

<div class="modal-open modal">
	<div class="modal-box max-w-md">
		<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm" onclick={onClose}>
			✕
		</button>

		<h3 class="mb-4 text-lg font-bold">
			{#if paymentData.payment_method === 'qris'}
				{$t('payment.scan_qr')}
			{:else}
				{$t('payment.detail')}
			{/if}
		</h3>

		<!-- Payment Summary -->
		<div class="mb-4 rounded-lg bg-base-200 p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm">{$t('payment.total_payment')}:</span>
				<span class="text-xl font-bold text-primary">
					{formatCurrency(paymentData.total_payment)}
				</span>
			</div>

			<div class="mb-1 flex justify-between text-sm text-base-content/70">
				<span>{isCartCheckout ? $t('cart.total_shopping') : $t('shop.price')}:</span>
				<span>{formatCurrency(paymentData.amount)}</span>
			</div>
			<div class="mb-1 flex justify-between text-sm text-base-content/70">
				<span>{$t('payment.admin_fee')}:</span>
				<span>{formatCurrency(paymentData.fee)}</span>
			</div>
			<div class="flex justify-between text-sm text-base-content/70">
				<span>{$t('payment.valid_until')}:</span>
				<span>{formatShortDate(paymentData.expired_at)}</span>
			</div>
		</div>

		<!-- QRIS Display -->
		{#if paymentData.payment_method === 'qris'}
			<div class="mb-4 flex justify-center">
				<div class="rounded-lg border-4 border-base-300 p-4">
					{#if qrImageUrl}
						<img src={qrImageUrl} alt="QR Code QRIS" class="h-72 w-72" />
					{:else}
						<div class="flex h-72 w-72 items-center justify-center">
							<span class="loading loading-lg loading-spinner"></span>
						</div>
					{/if}
				</div>
			</div>

			<div class="mb-4 alert alert-info">
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
				<span class="text-sm">
					{$t('payment.qris_instruction')}
				</span>
			</div>
		{:else}
			<!-- Virtual Account / Retail Display -->
			<div class="mb-4 rounded-lg bg-base-200 p-4">
				<div class="mb-2 text-sm font-semibold">{$t('payment.va_number')}:</div>
				<div class="flex items-center gap-2">
					<input
						type="text"
						value={paymentData.payment_number}
						readonly
						class="input-bordered input w-full font-mono"
					/>
					<button
						class="btn btn-square btn-primary"
						onclick={() => copyToClipboard(paymentData.payment_number)}
					>
						📋
					</button>
				</div>
			</div>

			<div class="mb-4 alert alert-info">
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
				<span class="text-sm">
					{$t('payment.va_instruction')}
				</span>
			</div>
		{/if}

		<!-- Simulate Payment Button (Development Only) -->
		{#if isDevelopment}
			<div class="mt-4">
				<button
					class="btn btn-block btn-sm btn-warning"
					onclick={handleSimulate}
					disabled={isSimulating}
				>
					{#if isSimulating}
						<span class="loading loading-sm loading-spinner"></span>
						{$t('payment.simulating')}
					{:else}
						{$t('payment.simulate_btn')}
					{/if}
				</button>
			</div>
		{/if}

		<!-- Waiting Indicator -->
		<div class="mt-4 flex items-center justify-center gap-2 text-warning">
			<span class="loading loading-sm loading-spinner"></span>
			<span class="font-medium">{$t('payment.waiting')}</span>
		</div>
	</div>
</div>
