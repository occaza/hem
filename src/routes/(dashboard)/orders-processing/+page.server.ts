import { getSupabaseAdmin } from '$lib/server/supabase';
import { requireRole } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends, url }) => {
	// Tambahkan depends untuk invalidate
	depends('app:orders-processing');

	try {
		await requireRole(cookies, ['superadmin']);

		const supabaseAdmin = getSupabaseAdmin();
		const page = Number(url.searchParams.get('page')) || 1;
		const pageSize = Number(url.searchParams.get('pageSize')) || 12;

		// 1. Fetch Lightweight Distinct IDs (Simulated Group By)
		// Karena Supabase/Postgrest basic tidak support DISTINCT ON dengan mudah tanpa RPC/View,
		// kita fetch order_id + sorting key untuk dedup di application layer.
		// Asumsi: Jumlah order processing tidak sampai jutaan baris (biasanya puluhan/ratusan).
		const { data: allRows, error: idError } = await supabaseAdmin
			.from('transactions')
			.select('order_id, processing_started_at')
			.eq('status', 'processing')
			.order('processing_started_at', { ascending: true });

		if (idError) {
			console.error('Fetch order IDs error:', idError);
			return { orders: [], pagination: { page, pageSize, total: 0, totalPages: 0 } };
		}

		// Dedup Order IDs (Maintain Order)
		const uniqueOrderIds = [...new Set((allRows || []).map((r) => r.order_id))] as string[];

		const totalOrders = uniqueOrderIds.length;
		const totalPages = Math.ceil(totalOrders / pageSize);
		const startIdx = (page - 1) * pageSize;
		const endIdx = startIdx + pageSize;

		const targetIds = uniqueOrderIds.slice(startIdx, endIdx);

		if (targetIds.length === 0) {
			return {
				orders: [],
				pagination: {
					page,
					pageSize,
					total: totalOrders,
					totalPages
				}
			};
		}

		// 2. Fetch Full Data for Target IDs
		const { data, error } = await supabaseAdmin
			.from('transactions')
			.select(
				`
        order_id,
        user_id,
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
			.in('order_id', targetIds)
			.order('processing_started_at', { ascending: true });

		if (error) {
			console.error('Get processing orders error:', error);
			return { orders: [], pagination: { page, pageSize, total: 0, totalPages: 0 } };
		}

		// Get notes untuk target transactions
		let notesMap = new Map<string, Map<string, string>>();

		// Notes query hanya untuk targetIds
		if (targetIds.length > 0) {
			const { data: notes } = await supabaseAdmin
				.from('transaction_notes')
				.select('order_id, product_id, note')
				.in('order_id', targetIds);

			if (notes) {
				notes.forEach((note) => {
					if (!notesMap.has(note.order_id)) {
						notesMap.set(note.order_id, new Map());
					}
					notesMap.get(note.order_id)!.set(note.product_id, note.note);
				});
			}
		}

		// 3. Fetch User Details
		const userIds = [...new Set((data || []).map((t) => t.user_id))];
		let usernameMap = new Map<string, string>();
		let emailMap = new Map<string, string>();

		if (userIds.length > 0) {
			// Fetch Usernames
			const { data: roles } = await supabaseAdmin
				.from('user_roles')
				.select('user_id, username')
				.in('user_id', userIds);

			if (roles) {
				roles.forEach((r) => usernameMap.set(r.user_id, r.username));
			}

			// Fetch Emails (Parallel)
			const emailPromises = userIds.map(async (uid) => {
				const { data } = await supabaseAdmin.auth.admin.getUserById(uid);
				return { uid, email: data?.user?.email };
			});

			const results = await Promise.all(emailPromises);
			results.forEach((r) => {
				if (r.email) emailMap.set(r.uid, r.email);
			});
		}

		// 4. Fetch Fulfillments
		let fulfillmentsMap = new Map<string, Map<string, any[]>>();
		if (targetIds.length > 0) {
			const { data: fulfillments } = await supabaseAdmin
				.from('transaction_fulfillments')
				.select('*')
				.in('order_id', targetIds)
				.order('created_at', { ascending: false });

			if (fulfillments) {
				fulfillments.forEach((f) => {
					if (!fulfillmentsMap.has(f.order_id)) {
						fulfillmentsMap.set(f.order_id, new Map());
					}
					if (!fulfillmentsMap.get(f.order_id)!.has(f.product_id)) {
						fulfillmentsMap.get(f.order_id)!.set(f.product_id, []);
					}
					fulfillmentsMap.get(f.order_id)!.get(f.product_id)!.push(f);
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
						total: 0,
						buyer: {
							username: usernameMap.get(transaction.user_id) || null,
							email: emailMap.get(transaction.user_id) || null
						}
					};
				}

				const orderNotes = notesMap.get(orderId);
				const note = orderNotes ? orderNotes.get(transaction.product_id) : null;

				const orderFulfillments = fulfillmentsMap.get(orderId);
				const fulfillments = orderFulfillments ? orderFulfillments.get(transaction.product_id) : [];

				acc[orderId].items.push({
					product_id: transaction.product_id,
					product: transaction.product,
					amount: transaction.amount,
					note: note,
					fulfillments: fulfillments
				});
				acc[orderId].total += transaction.amount;

				return acc;
			},
			{} as Record<string, any>
		);

		return {
			orders: Object.values(groupedOrders),
			pagination: {
				page,
				pageSize,
				total: totalOrders,
				totalPages
			}
		};
	} catch (error) {
		console.error('Load orders error:', error);
		return { orders: [], pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 } };
	}
};
