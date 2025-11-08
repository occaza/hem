// src/lib/server/pakasir.ts
const PAKASIR_BASE = 'https://app.pakasir.com';

export type PaymentMethod = 'qris' | 'va_bca' | 'va_bri' | 'va_bni' | 'va_mandiri';

function getEnv() {
	const SLUG = import.meta.env.PAKASIR_SLUG;
	const API_KEY = import.meta.env.PAKASIR_API_KEY;
	const IS_PROD = import.meta.env.IS_PRODUCTION === 'true';

	if (!SLUG || !API_KEY) {
		throw new Error('Missing Pakasir environment variables. Set PAKASIR_SLUG and PAKASIR_API_KEY');
	}

	return { SLUG, API_KEY, IS_PROD };
}

export const pakasir = {
	async createTransaction(orderId: string, amount: number, paymentMethod: PaymentMethod) {
		const { SLUG, API_KEY } = getEnv();

		const res = await fetch(`${PAKASIR_BASE}/api/payment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${API_KEY}`
			},
			body: JSON.stringify({
				project: SLUG,
				order_id: orderId,
				amount,
				payment_method: paymentMethod
			})
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Pakasir API failed: ${res.status} ${text}`);
		}

		return await res.json();
	},

	async simulatePayment(orderId: string, amount: number): Promise<void> {
		const { SLUG, API_KEY, IS_PROD } = getEnv();

		if (IS_PROD) return;

		const res = await fetch(`${PAKASIR_BASE}/api/paymentsimulation`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				project: SLUG,
				order_id: orderId,
				amount,
				api_key: API_KEY
			})
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Pakasir simulation failed: ${res.status} ${text}`);
		}
	}
};
