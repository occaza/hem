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

	// Check if this is a cart order
	const { data: transactions, error: fetchErr } = await supabaseAdmin
		.from('transactions')
		.select('order_id, amount, status')
		.eq('order_id', order_id);

	if (fetchErr || !transactions || transactions.length === 0) {
		console.warn('Webhook: Transactions not found', order_id);
		return json({ received: true });
	}

	// Check if already completed
	if (transactions.every((t) => t.status === 'completed')) {
		console.log('Webhook: All transactions already completed');
		return json({ received: true });
	}

	// Verify total amount
	const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

	// Amount bisa berbeda sedikit karena fee, jadi kita toleransi
	// Payment amount = totalAmount + fee
	// Jadi amount dari webhook seharusnya >= totalAmount
	if (amount < totalAmount) {
		console.error('Amount mismatch!', {
			order_id,
			expected: totalAmount,
			got: amount,
			transactions_count: transactions.length
		});
		return json({ received: true });
	}

	// Update all transactions with this order_id
	const { error: updateErr } = await supabaseAdmin
		.from('transactions')
		.update({
			status: 'completed',
			payment_method,
			completed_at: new Date().toISOString()
		})
		.eq('order_id', order_id)
		.eq('status', 'pending');

	if (updateErr) {
		console.error('Failed to update transactions', updateErr);
	} else {
		console.log(`Successfully updated ${transactions.length} transactions for order ${order_id}`);
	}

	return json({ received: true });
};
