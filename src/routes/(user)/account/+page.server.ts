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
		.select('full_name, phone_number, username')
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

	// Get fulfillments for all orders
	let fulfillmentsMap = new Map<string, Map<string, any[]>>();

	if (orderIds.length > 0) {
		const { data: fulfillments } = await supabaseAdmin
			.from('transaction_fulfillments')
			.select('order_id, product_id, type, content, created_at')
			.in('order_id', orderIds)
			.order('created_at', { ascending: false });

		if (fulfillments) {
			fulfillments.forEach((f) => {
				if (!fulfillmentsMap.has(f.order_id)) {
					fulfillmentsMap.set(f.order_id, new Map());
				}
				if (!fulfillmentsMap.get(f.order_id)!.has(f.product_id)) {
					fulfillmentsMap.get(f.order_id)!.set(f.product_id, []);
				}
				fulfillmentsMap.get(f.order_id)!.get(f.product_id)!.push({
					type: f.type,
					content: f.content,
					created_at: f.created_at
				});
			});
		}
	}

	// Get coupon usages
	let couponMap = new Map<string, number>();
	if (orderIds.length > 0) {
		const { data: coupons } = await supabaseAdmin
			.from('coupon_usages')
			.select('order_id, discount_amount')
			.in('order_id', orderIds);

		if (coupons) {
			coupons.forEach((c) => {
				couponMap.set(c.order_id, c.discount_amount);
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
				total_payment: transaction.total_payment || 0,
				discount: couponMap.get(orderId) || 0
			};
		}

		const orderNotes = notesMap.get(orderId);
		const note = orderNotes ? orderNotes.get(transaction.product_id) : null;

		const orderFulfillments = fulfillmentsMap.get(orderId);
		const fulfillments = orderFulfillments ? orderFulfillments.get(transaction.product_id) : null;

		const quantity = transaction.quantity || 1;

		acc[orderId].items.push({
			product: transaction.product
				? {
						...transaction.product,
						price: transaction.amount / quantity, // Calculate Unit Price from Line Total
						quantity: quantity
					}
				: null,
			amount: transaction.amount,
			note: note,
			fulfillments: acc[orderId].status === 'completed' ? fulfillments || [] : []
		});
		acc[orderId].total += transaction.amount;
		// Ensure total_payment is set correctly if not present in transaction
		if (!acc[orderId].total_payment) {
			acc[orderId].total_payment = acc[orderId].total + acc[orderId].fee - acc[orderId].discount;
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
			username: roleData?.username || '',
			avatar_url: profileData?.avatar_url || null,
			bio: profileData?.bio || ''
		},
		orders: allOrders
	};
};
