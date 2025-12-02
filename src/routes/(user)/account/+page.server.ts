import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUser } from '$lib/server/auth';
import { getSupabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await getUser(cookies);

	if (!user) {
		throw redirect(303, '/login');
	}

	const supabaseAdmin = getSupabaseAdmin();

	// Get user profile
	const { data: roleData } = await supabaseAdmin
		.from('user_roles')
		.select('full_name, phone_number')
		.eq('user_id', user.id)
		.single();

	const { data: profileData } = await supabaseAdmin
		.from('user_profiles')
		.select('avatar_url, bio')
		.eq('user_id', user.id)
		.single();

	// Get all orders (reusing logic from my-orders)
	const { data: transactions, error: transactionsError } = await supabaseAdmin
		.from('transactions')
		.select(
			`
			order_id,
			amount,
			quantity,
			fee,
			total_payment,
			status,
			payment_method,
			completed_at,
			created_at,
			expired_at,
			product_id,
			product:products (
				id,
				name,
				images
			)
		`
		)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (transactionsError) {
		console.error('Error fetching orders:', transactionsError);
	}

	// Get notes for all orders
	const orderIds = [...new Set((transactions || []).map((t) => t.order_id))];
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
	const groupedOrders = (transactions || []).reduce((acc: any, transaction: any) => {
		const orderId = transaction.order_id;
		if (!acc[orderId]) {
			acc[orderId] = {
				order_id: orderId,
				status: transaction.status,
				payment_method: transaction.payment_method,
				completed_at: transaction.completed_at,
				created_at: transaction.created_at,
				expired_at: transaction.expired_at,
				items: [],
				total: 0,
				fee: transaction.fee || 0,
				total_payment: transaction.total_payment || 0
			};
		}

		const orderNotes = notesMap.get(orderId);
		const note = orderNotes ? orderNotes.get(transaction.product_id) : null;

		acc[orderId].items.push({
			product: transaction.product
				? {
						...transaction.product,
						price: transaction.amount,
						quantity: transaction.quantity || 1
					}
				: null,
			amount: transaction.amount,
			note: note
		});
		acc[orderId].total += transaction.amount;
		// Ensure total_payment is set correctly if not present in transaction
		if (!acc[orderId].total_payment) {
			acc[orderId].total_payment = acc[orderId].total + acc[orderId].fee;
		}

		return acc;
	}, {});

	const allOrders = Object.values(groupedOrders);

	return {
		user: {
			id: user.id,
			email: user.email,
			full_name: roleData?.full_name || '',
			phone_number: roleData?.phone_number || '',
			avatar_url: profileData?.avatar_url || null,
			bio: profileData?.bio || ''
		},
		orders: allOrders
	};
};
