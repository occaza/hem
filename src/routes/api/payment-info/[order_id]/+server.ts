import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { pakasir } from '$lib/server/pakasir';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { order_id } = params;

		if (!order_id) {
			return json({ error: 'Order ID required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { data: transactions, error } = await supabaseAdmin
			.from('transactions')
			.select('amount, status, product_id')
			.eq('order_id', order_id);

		if (error || !transactions || transactions.length === 0) {
			return json({ error: 'Transaction not found' }, { status: 404 });
		}

		if (transactions[0].status === 'completed') {
			return json({ error: 'Payment already completed' }, { status: 400 });
		}

		const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

		const paymentDetail = await pakasir.getTransactionDetail(order_id, totalAmount);

		return json({
			order_id: paymentDetail.order_id,
			amount: paymentDetail.amount,
			fee: paymentDetail.fee,
			total_payment: paymentDetail.total_payment,
			payment_method: paymentDetail.payment_method,
			payment_number: paymentDetail.payment_number,
			expired_at: paymentDetail.expired_at
		});
	} catch (error) {
		console.error('Get payment info error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
