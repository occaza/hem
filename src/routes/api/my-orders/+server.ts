import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('user_id');

		if (!userId) {
			return json({ error: 'user_id required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// Ambil semua transaksi user
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
        product_id,
        product:products (
            id,
            name,
            images,
            price
        )
    `
			)
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Get my orders error:', error);
			return json({ error: 'Failed to fetch orders' }, { status: 500 });
		}

		const orderIds = [...new Set((data || []).map((t) => t.order_id))];
		let notesMap = new Map<string, Map<string, string>>();

		if (orderIds.length > 0) {
			const { data: notes } = await supabaseAdmin
				.from('transaction_notes')
				.select('order_id, product_id, note')
				.in('order_id', orderIds);

			if (notes) {
				notes.forEach((note) => {
					if (!notesMap.has(note.order_id)) {
						notesMap.set(note.order_id, new Map());
					}
					notesMap.get(note.order_id)!.set(note.product_id, note.note);
				});
			}
		}

		// Group by order_id
		const groupedOrders = (data || []).reduce(
			(acc, transaction) => {
				const orderId = transaction.order_id;
				if (!acc[orderId]) {
					acc[orderId] = {
						order_id: orderId,
						status: transaction.status,
						payment_method: transaction.payment_method,
						completed_at: transaction.completed_at,
						created_at: transaction.created_at,
						items: [],
						total: 0
					};
				}

				const orderNotes = notesMap.get(orderId);
				const note = orderNotes ? orderNotes.get(transaction.product_id) : null;

				acc[orderId].items.push({
					product: transaction.product,
					amount: transaction.amount,
					note: note // TAMBAH INI
				});
				acc[orderId].total += transaction.amount;

				return acc;
			},
			{} as Record<string, any>
		);

		return json(Object.values(groupedOrders));
	} catch (error) {
		console.error('Get my orders error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
