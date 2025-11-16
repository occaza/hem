// src/routes/api/admin/transactions/[order_id]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { order_id } = params;

		if (!order_id) {
			return json({ error: 'Order ID is required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// Ambil SEMUA transaksi dengan order_id yang sama
		const { data, error } = await supabaseAdmin
			.from('transactions')
			.select(
				`
				order_id,
				amount,
				status,
				payment_method,
				completed_at,
				created_at,
				products (
					name,
					description,
					price,
					images
				)
			`
			)
			.eq('order_id', order_id)
			.order('created_at', { ascending: true });

		if (error || !data || data.length === 0) {
			console.error('Fetch transaction error:', error);
			return json({ error: 'Transaction not found' }, { status: 404 });
		}

		// Hitung total amount dari semua transaksi
		const totalAmount = data.reduce((sum, t) => sum + t.amount, 0);

		return json({
			order_id: data[0].order_id,
			total_amount: totalAmount,
			status: data[0].status,
			payment_method: data[0].payment_method,
			completed_at: data[0].completed_at,
			created_at: data[0].created_at,
			items: data.map((t) => ({
				product: t.products,
				amount: t.amount
			}))
		});
	} catch (error) {
		console.error('Get transaction detail error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
