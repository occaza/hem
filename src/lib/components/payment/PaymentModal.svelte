<script lang="ts">
	import type { Product } from '$lib/types/types';
	import { formatCurrency, formatShortDate } from '$lib/utils/format.utils';

	type Props = {
		product: Product;
		paymentData: any;
		qrImageUrl: string;
		isSimulating: boolean;
		isCartCheckout?: boolean;
		onClose: () => void;
		onSimulate: () => void;
	};

	let {
		product,
		paymentData,
		qrImageUrl,
		isSimulating,
		isCartCheckout = false,
		onClose,
		onSimulate
	}: Props = $props();

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		alert('Nomor berhasil disalin!');
	}
</script>

<div class="modal-open modal">
	<div class="modal-box max-w-md">
		<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm" onclick={onClose}>
			✕
		</button>

		<h3 class="mb-4 text-lg font-bold">
			{#if paymentData.payment_method === 'qris'}
				Scan QR Code untuk Bayar
			{:else}
				Detail Pembayaran
			{/if}
		</h3>

		<!-- Payment Summary -->
		<div class="mb-4 rounded-lg bg-base-200 p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm">Total Pembayaran:</span>
				<span class="text-xl font-bold text-primary">
					{formatCurrency(paymentData.total_payment)}
				</span>
			</div>

			<div class="mb-1 flex justify-between text-sm text-base-content/70">
				<span>{isCartCheckout ? 'Total Belanja:' : 'Harga Produk:'}</span>
				<span>{formatCurrency(paymentData.amount)}</span>
			</div>
			<div class="mb-1 flex justify-between text-sm text-base-content/70">
				<span>Biaya Admin:</span>
				<span>{formatCurrency(paymentData.fee)}</span>
			</div>
			<div class="flex justify-between text-sm text-base-content/70">
				<span>Berlaku hingga:</span>
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
					Buka aplikasi mobile banking atau e-wallet Anda, lalu scan QR code di atas.
				</span>
			</div>
		{:else}
			<!-- Virtual Account / Retail Display -->
			<div class="mb-4 rounded-lg bg-base-200 p-4">
				<div class="mb-2 text-sm font-semibold">Nomor Virtual Account / Kode Pembayaran:</div>
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
					Gunakan nomor di atas untuk melakukan pembayaran melalui ATM, mobile banking, atau retail.
				</span>
			</div>
		{/if}

		<!-- Simulate Payment Button (Development Only) -->
		<div class="mt-4">
			<button class="btn btn-block btn-sm btn-warning" onclick={onSimulate} disabled={isSimulating}>
				{#if isSimulating}
					<span class="loading loading-sm loading-spinner"></span>
					Memproses simulasi...
				{:else}
					🧪 Simulasi Pembayaran (Development Only)
				{/if}
			</button>
		</div>

		<!-- Waiting Indicator -->
		<div class="mt-4 flex items-center justify-center gap-2 text-warning">
			<span class="loading loading-sm loading-spinner"></span>
			<span class="font-medium">Menunggu pembayaran...</span>
		</div>
	</div>
</div>
