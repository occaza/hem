<script lang="ts">
	import type { Product } from '$lib/types/types';
	import { formatCurrency } from '$lib/utils/format.utils';
	import { toast } from '$lib/stores/toast.store';

	type PaymentMethod = {
		value: string;
		label: string;
		icon: string;
	};

	type Props = {
		product: Product;
		paymentMethods: PaymentMethod[];
		isCartCheckout?: boolean;
		itemCount?: number;
		totalAmount?: number;
		onClose: () => void;
		onSelectQRIS: () => void;
		onSelectOther: (method: string) => void;
	};

	let {
		product,
		paymentMethods,
		isCartCheckout = false,
		itemCount = 1,
		totalAmount,
		onClose,
		onSelectQRIS,
		onSelectOther
	}: Props = $props();

	let selectedMethod = $state('');

	const otherMethods = $derived(paymentMethods.filter((m) => m.value !== 'qris'));

	// Gunakan totalAmount kalau ada, kalau tidak pakai product.price
	const displayAmount = $derived(totalAmount || product.price);

	function handleContinue() {
		if (!selectedMethod || selectedMethod === '') {
			toast.error('Pilih metode pembayaran terlebih dahulu');
			return;
		}
		onSelectOther(selectedMethod);
	}
</script>

<div class="modal-open modal">
	<div class="modal-box max-w-md">
		<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm" onclick={onClose}>
			✕
		</button>

		<h3 class="mb-4 text-lg font-bold">Pilih Metode Pembayaran</h3>

		<!-- Product Summary -->
		<div class="mb-6 rounded-lg bg-base-200 p-4">
			<div class="text-sm text-base-content/70">
				{isCartCheckout ? `Total Belanja (${itemCount} item)` : 'Produk'}:
			</div>
			{#if !isCartCheckout}
				<div class="font-semibold">{product.name}</div>
			{/if}
			<div class="mt-2 text-xl font-bold text-primary">
				{formatCurrency(displayAmount)}
			</div>
		</div>

		<button class="btn mb-4 btn-block btn-lg btn-primary" onclick={onSelectQRIS}>
			<span class="text-2xl">📱</span>
			<div class="text-left">
				<div class="font-bold">QRIS</div>
				<div class="text-xs opacity-70">Semua E-Wallet & Bank</div>
			</div>
		</button>

		<div class="divider text-sm">Atau pilih metode lain</div>

		{#if displayAmount < 10000}
			<div class="mb-4 alert text-sm alert-warning">
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
				<span
					>Minimal Rp10.000 untuk pembayaran via Virtual Account & Retail. Silakan gunakan QRIS.</span
				>
			</div>
		{/if}

		<select
			class="select-bordered select mb-4 w-full"
			bind:value={selectedMethod}
			disabled={displayAmount < 10000}
		>
			<option value="" disabled selected>Pilih Virtual Account atau Retail</option>
			{#each otherMethods as method}
				<option value={method.value}>
					{method.icon}
					{method.label}
				</option>
			{/each}
		</select>

		<button
			class="btn btn-block btn-outline"
			onclick={handleContinue}
			disabled={!selectedMethod || selectedMethod === '' || displayAmount < 10000}
		>
			Lanjutkan ke Pembayaran
		</button>
	</div>
</div>
