import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const supabaseAdmin = getSupabaseAdmin();
	const body = await request.json();
	const { order_id, amount, status, payment_method } = body;

	console.log('Webhook received:', { order_id, amount, status, payment_method });

	if (status !== 'completed') {
		return json({ received: true });
	}

	// Update SEMUA transactions dengan order_id yang sama
	const { data: updated, error: updateErr } = await supabaseAdmin
		.from('transactions')
		.update({
			status: 'completed',
			payment_method,
			completed_at: new Date().toISOString()
		})
		.eq('order_id', order_id)
		.eq('status', 'pending')
		.select();

	if (updateErr) {
		console.error('Failed to update transactions:', updateErr);
	} else {
		console.log(`✅ Updated ${updated?.length || 0} transactions for order ${order_id}`);
	}

	return json({ received: true });
};
