// src/routes/api/simulate-payment/+server.ts
import { json } from '@sveltejs/kit';
import { pakasir } from '$lib/server/pakasir';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { order_id, amount } = body;

		if (!order_id || !amount) {
			return json({ error: 'Missing order_id or amount' }, { status: 400 });
		}

		console.log('Simulating payment for:', order_id);

		// Panggil Pakasir simulation
		await pakasir.simulatePayment(order_id, amount);

		// Tunggu sebentar supaya webhook keburu jalan
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Manual trigger update status ke processing
		const supabaseAdmin = getSupabaseAdmin();

		const { data: updated, error: updateErr } = await supabaseAdmin
			.from('transactions')
			.update({
				status: 'processing',
				processing_started_at: new Date().toISOString()
			})
			.eq('order_id', order_id)
			.eq('status', 'pending')
			.select('product_id, amount');

		if (updateErr) {
			console.error('Failed to update transaction:', updateErr);
			return json({ error: 'Failed to update status' }, { status: 500 });
		}

		if (!updated || updated.length === 0) {
			console.error('No transaction found for order:', order_id);
			return json({ error: 'Transaction not found' }, { status: 404 });
		}

		console.log(`✅ Order ${order_id} moved to PROCESSING`);

		return json({
			success: true,
			message: 'Payment simulated successfully',
			status: 'processing'
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
