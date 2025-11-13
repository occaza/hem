import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { order_id } = body;

		if (!order_id) {
			return json({ error: 'Missing order_id' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// Get all transactions with this order_id
		const { data: transactions, error } = await supabaseAdmin
			.from('transactions')
			.select('status, amount, completed_at')
			.eq('order_id', order_id);

		if (error || !transactions || transactions.length === 0) {
			return json({ error: 'Transaction not found' }, { status: 404 });
		}

		// Check if all transactions are completed
		const allCompleted = transactions.every((t) => t.status === 'completed');
		const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

		// Return status completed if all transactions are completed
		return json({
			status: allCompleted ? 'completed' : transactions[0].status,
			amount: totalAmount,
			completed_at: allCompleted ? transactions[0].completed_at : null
		});
	} catch (error) {
		console.error('Check payment error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
