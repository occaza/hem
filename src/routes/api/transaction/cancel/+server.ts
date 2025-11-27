import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { pakasir } from '$lib/server/pakasir';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { order_id, user_id } = body;

		if (!order_id || !user_id) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// 1. Validasi transaksi milik user dan status masih pending
		const { data: transaction, error: fetchError } = await supabaseAdmin
			.from('transactions')
			.select('order_id, amount, status, user_id')
			.eq('order_id', order_id)
			.single();

		if (fetchError || !transaction) {
			return json({ error: 'Transaction not found' }, { status: 404 });
		}

		if (transaction.user_id !== user_id) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		if (transaction.status !== 'pending') {
			return json({ error: 'Only pending transactions can be cancelled' }, { status: 400 });
		}

		// 2. Panggil API Cancel Pakasir
		await pakasir.cancelTransaction(order_id, transaction.amount);

		// 3. Update status di database lokal
		const { error: updateError } = await supabaseAdmin
			.from('transactions')
			.update({ status: 'cancelled' })
			.eq('order_id', order_id);

		if (updateError) {
			console.error('Failed to update transaction status:', updateError);
			return json({ error: 'Failed to update local status' }, { status: 500 });
		}

		return json({ success: true, message: 'Transaction cancelled successfully' });
	} catch (error) {
		console.error('Cancel transaction error:', error);
		return json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
