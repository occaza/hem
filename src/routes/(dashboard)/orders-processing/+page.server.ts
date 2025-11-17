import { getSupabaseAdmin } from '$lib/server/supabase';
import { requireRole } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
	// Tambahkan depends untuk invalidate
	depends('app:orders-processing');

	try {
		await requireRole(cookies, ['superadmin']);

		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('transactions')
			.select(
				`
        order_id,
        amount,
        payment_method,
        processing_started_at,
        product_id,
        product:products (
            name,
            images
        )
    `
			)
			.eq('status', 'processing')
			.order('processing_started_at', { ascending: true });

		if (error) {
			console.error('Get processing orders error:', error);
			return { orders: [] };
		}

		// Get notes untuk semua transactions
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

		const groupedOrders = (data || []).reduce(
			(acc, transaction) => {
				const orderId = transaction.order_id;
				if (!acc[orderId]) {
					acc[orderId] = {
						order_id: orderId,
						payment_method: transaction.payment_method,
						processing_started_at: transaction.processing_started_at,
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

		return {
			orders: Object.values(groupedOrders)
		};
	} catch (error) {
		console.error('Load orders error:', error);
		return { orders: [] };
	}
};
