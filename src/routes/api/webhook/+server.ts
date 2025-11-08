// src/routes/api/webhook/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const supabaseAdmin = getSupabaseAdmin();
	const body = await request.json();
	const { order_id, amount, status, payment_method } = body;

	if (status !== 'completed') {
		return json({ received: true });
	}

	const { data: trans, error: fetchErr } = await supabaseAdmin
		.from('transactions')
		.select('amount, status')
		.eq('order_id', order_id)
		.single();

	if (fetchErr || !trans) {
		console.warn('Webhook: Transaction not found', order_id);
		return json({ received: true });
	}

	if (trans.status === 'completed') {
		return json({ received: true });
	}

	if (trans.amount !== amount) {
		console.error('Amount mismatch!', { order_id, expected: trans.amount, got: amount });
		return json({ received: true });
	}

	const { error: updateErr } = await supabaseAdmin
		.from('transactions')
		.update({
			status: 'completed',
			payment_method,
			completed_at: new Date().toISOString()
		})
		.eq('order_id', order_id);

	if (updateErr) {
		console.error('Failed to update transaction', updateErr);
	}

	return json({ received: true });
};
