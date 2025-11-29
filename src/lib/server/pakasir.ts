// src/lib/server/pakasir.ts
import { PAKASIR_SLUG, PAKASIR_API_KEY, IS_PRODUCTION } from '$env/static/private';

const PAKASIR_BASE = 'https://app.pakasir.com';

export type PaymentMethod =
	| 'qris'
	| 'bni_va'
	| 'bri_va'
	| 'cimb_niaga_va'
	| 'sampoerna_va'
	| 'bnc_va'
	| 'maybank_va'
	| 'permata_va'
	| 'atm_bersama_va'
	| 'artha_graha_va';

function getEnv() {
	if (!PAKASIR_SLUG || !PAKASIR_API_KEY) {
		throw new Error('Missing Pakasir credentials! Check PAKASIR_SLUG and PAKASIR_API_KEY');
	}

	return {
		SLUG: PAKASIR_SLUG,
		API_KEY: PAKASIR_API_KEY,
		IS_PROD: IS_PRODUCTION === 'true'
	};
}

export const pakasir = {
	async createTransaction(
		orderId: string,
		amount: number,
		paymentMethod: PaymentMethod,
		customerName: string,
		customerEmail: string
	) {
		const { SLUG, API_KEY, IS_PROD } = getEnv();
		const endpoint = `${PAKASIR_BASE}/api/transactioncreate/${paymentMethod}`;

		console.log('💳 Creating PAKASIR transaction:', {
			orderId,
			amount,
			paymentMethod,
			customerName,
			customerEmail,
			mode: IS_PROD ? 'PRODUCTION' : 'SANDBOX',
			endpoint
		});

		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					project: SLUG,
					order_id: orderId,
					amount,
					customer_name: customerName,
					customer_email: customerEmail,
					api_key: API_KEY
				})
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('❌ PAKASIR API error:', {
					status: res.status,
					statusText: res.statusText,
					response: text,
					orderId,
					amount,
					paymentMethod
				});
				throw new Error(`PAKASIR API failed: ${res.status} - ${text}`);
			}

			const data = await res.json();

			// Validasi response structure
			if (!data.payment) {
				console.error('❌ Invalid PAKASIR response structure:', data);
				throw new Error('Invalid response from PAKASIR: missing payment object');
			}

			console.log('✅ PAKASIR transaction created:', {
				orderId: data.payment.order_id,
				amount: data.payment.amount,
				fee: data.payment.fee,
				total_payment: data.payment.total_payment,
				payment_method: data.payment.payment_method,
				expired_at: data.payment.expired_at
			});

			return data.payment;
		} catch (error) {
			console.error('❌ PAKASIR createTransaction exception:', {
				error: error instanceof Error ? error.message : String(error),
				orderId,
				amount,
				paymentMethod
			});
			throw error;
		}
	},

	async getTransactionDetail(orderId: string, amount: number) {
		const { SLUG, API_KEY } = getEnv();

		const params = new URLSearchParams({
			project: SLUG,
			order_id: orderId,
			amount: amount.toString(),
			api_key: API_KEY
		});

		const url = `${PAKASIR_BASE}/api/transactiondetail?${params.toString()}`;

		console.log('🔍 Fetching PAKASIR transaction detail:', { orderId, amount });

		try {
			const res = await fetch(url);

			if (!res.ok) {
				const text = await res.text();
				console.error('❌ PAKASIR transaction detail error:', {
					status: res.status,
					statusText: res.statusText,
					response: text,
					orderId,
					amount
				});
				throw new Error(`Failed to get transaction detail: ${res.status} - ${text}`);
			}

			const data = await res.json();

			// Validasi response structure
			if (!data.transaction) {
				console.error('❌ Invalid PAKASIR transaction detail response:', data);
				throw new Error('Invalid response from PAKASIR: missing transaction object');
			}

			console.log('✅ PAKASIR transaction detail:', {
				orderId: data.transaction.order_id,
				status: data.transaction.status,
				amount: data.transaction.amount,
				payment_method: data.transaction.payment_method
			});

			return data.transaction;
		} catch (error) {
			console.error('❌ PAKASIR getTransactionDetail exception:', {
				error: error instanceof Error ? error.message : String(error),
				orderId,
				amount
			});
			throw error;
		}
	},

	async simulatePayment(orderId: string, amount: number): Promise<void> {
		const { SLUG, API_KEY, IS_PROD } = getEnv();

		// Remove the IS_PROD check to allow simulation in deployed sandbox environments
		// Pakasir API will handle rejection if trying to simulate on a real production project
		console.log('💳 Simulating payment via PAKASIR:', { orderId, amount });

		try {
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
				console.error('❌ PAKASIR simulation error:', {
					status: res.status,
					statusText: res.statusText,
					response: text,
					orderId,
					amount
				});
				throw new Error(`PAKASIR simulation failed: ${res.status} - ${text}`);
			}

			const data = await res.json();
			console.log('✅ PAKASIR simulation successful:', {
				orderId,
				response: data
			});
		} catch (error) {
			console.error('❌ PAKASIR simulatePayment exception:', {
				error: error instanceof Error ? error.message : String(error),
				orderId,
				amount
			});
			throw error;
		}
	},

	async cancelTransaction(orderId: string, amount: number) {
		const { SLUG, API_KEY } = getEnv();
		const endpoint = `${PAKASIR_BASE}/api/transactioncancel`;

		console.log('🚫 Cancelling PAKASIR transaction:', { orderId, amount });

		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					project: SLUG,
					order_id: orderId,
					amount,
					api_key: API_KEY
				})
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('❌ PAKASIR cancel error:', {
					status: res.status,
					statusText: res.statusText,
					response: text,
					orderId
				});
				throw new Error(`PAKASIR cancel failed: ${res.status} - ${text}`);
			}

			const data = await res.json();
			console.log('✅ PAKASIR transaction cancelled:', data);
			return data;
		} catch (error) {
			console.error('❌ PAKASIR cancelTransaction exception:', {
				error: error instanceof Error ? error.message : String(error),
				orderId
			});
			throw error;
		}
	}
};
