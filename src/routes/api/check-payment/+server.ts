import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

// Handle CORS preflight
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { order_id } = body;

		if (!order_id) {
			return json(
				{ error: 'Missing order_id' },
				{
					status: 400,
					headers: {
						'Access-Control-Allow-Origin': '*'
					}
				}
			);
		}

		const supabaseAdmin = getSupabaseAdmin();

		// Just check status - NO stock reduction here!
		const { data: transactions, error } = await supabaseAdmin
			.from('transactions')
			.select('status, amount, completed_at, product_id, quantity, expired_at')
			.eq('order_id', order_id);

		if (error || !transactions || transactions.length === 0) {
			return json(
				{ error: 'Transaction not found' },
				{
					status: 404,
					headers: {
						'Access-Control-Allow-Origin': '*'
					}
				}
			);
		}

		// Check for expiration
		const now = new Date();
		const transaction = transactions[0];

		if (
			transaction.status === 'pending' &&
			transaction.expired_at &&
			new Date(transaction.expired_at) < now
		) {
			// Mark as expired in DB
			await supabaseAdmin
				.from('transactions')
				.update({ status: 'expired' })
				.eq('order_id', order_id);

			return json(
				{
					status: 'expired',
					amount: transaction.amount,
					completed_at: null
				},
				{
					headers: {
						'Access-Control-Allow-Origin': '*'
					}
				}
			);
		}

		const allCompleted = transactions.every((t) => t.status === 'completed');
		const anyProcessing = transactions.some((t) => t.status === 'processing');
		const anyExpired = transactions.some((t) => t.status === 'expired');

		const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

		return json(
			{
				status: allCompleted
					? 'completed'
					: anyProcessing
						? 'processing'
						: anyExpired
							? 'expired'
							: transactions[0].status,
				amount: totalAmount,
				completed_at: allCompleted ? transactions[0].completed_at : null
			},
			{
				headers: {
					'Access-Control-Allow-Origin': '*'
				}
			}
		);
	} catch (error) {
		console.error('Check payment error:', error);
		return json(
			{ error: 'Internal server error' },
			{
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*'
				}
			}
		);
	}
};
