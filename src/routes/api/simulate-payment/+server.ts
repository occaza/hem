// src/routes/api/simulate-payment/+server.ts
import { json } from '@sveltejs/kit';
import { pakasir } from '$lib/server/pakasir';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const body = await request.json();
		const { order_id, amount } = body;

		if (!order_id || !amount) {
			return json({ error: 'Missing order_id or amount' }, { status: 400 });
		}

		console.log('Simulating payment for:', order_id);

		// 1. Panggil Pakasir simulation (agar status di dashboard Pakasir berubah)
		// Ini akan memicu webhook ke URL production jika dikonfigurasi
		await pakasir.simulatePayment(order_id, amount);

		// 2. JIKA DI LOCALHOST (DEV):
		// Webhook dari Pakasir TIDAK AKAN MASUK ke localhost.
		// Jadi kita harus tembak endpoint webhook kita sendiri secara manual.
		if (dev) {
			console.log('🔧 Dev environment detected: Manually triggering webhook...');

			const webhookPayload = {
				order_id,
				amount,
				status: 'completed',
				payment_method: 'qris', // Default simulation method
				project: 'simulation',
				completed_at: new Date().toISOString(),
				is_sandbox: true
			};

			// Panggil endpoint webhook internal
			const webhookRes = await fetch('/api/webhook', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(webhookPayload)
			});

			const webhookResult = await webhookRes.json();
			console.log('🔧 Manual webhook result:', webhookResult);

			if (!webhookRes.ok) {
				throw new Error(`Manual webhook failed: ${webhookResult.error || 'Unknown error'}`);
			}
		} else {
			// Di Production, kita tunggu sebentar biar webhook asli punya kesempatan jalan
			// Tapi kita JANGAN update status manual di sini, biar webhook yang handle.
			console.log('🚀 Production environment: Waiting for real webhook...');
		}

		return json({
			success: true,
			message: 'Payment simulation triggered',
			status: 'processing' // Frontend akan polling status asli nanti
		});
	} catch (error) {
		console.error('Simulate payment error:', error);
		return json(
			{
				error: 'Simulation failed',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
