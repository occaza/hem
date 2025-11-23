import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUser } from '$lib/server/auth';
import { getSupabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await getUser(cookies);

	if (!user) {
		throw redirect(303, '/login');
	}

	// Redirect admin to admin dashboard
	if (user.role === 'superadmin') {
		throw redirect(303, '/dashboard');
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

	// Get order statistics
	const { data: allOrders } = await supabaseAdmin
		.from('transactions')
		.select('status')
		.eq('user_id', user.id);

	const totalOrders = allOrders?.length || 0;
	const pendingOrders = allOrders?.filter((o) => o.status === 'pending').length || 0;
	const completedOrders = allOrders?.filter((o) => o.status === 'completed').length || 0;

	// Get recent orders (last 5 unique orders)
	// First, get the latest 5 unique order_ids
	const { data: latestOrderIds } = await supabaseAdmin
		.from('transactions')
		.select('order_id, created_at')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	// Extract unique order IDs and take top 5
	const uniqueOrderIds = [...new Set(latestOrderIds?.map((o) => o.order_id))].slice(0, 5);

	// Then fetch ALL transactions for these order_ids
	const { data: recentOrders, error: recentOrdersError } = await supabaseAdmin
		.from('transactions')
		.select(
			`
			order_id,
			amount,
			quantity,
			status,
			fee,
			payment_method,
			completed_at,
			created_at,
			product:products (
				name,
				images,
				slug
			)
		`
		)
		.eq('user_id', user.id)
		.in('order_id', uniqueOrderIds)
		.order('created_at', { ascending: false });

	if (recentOrdersError) {
		console.error('Error fetching recent orders:', recentOrdersError);
	}

	// Group products by order_id since Supabase returns one row per product
	const groupedOrders =
		recentOrders?.reduce((acc: any[], curr: any) => {
			const existingOrder = acc.find((o) => o.order_id === curr.order_id);

			// Create product object with price from transaction amount
			const productWithPrice = curr.product
				? {
						...curr.product,
						price: curr.amount, // Use transaction amount as the price for this item
						quantity: curr.quantity || 1 // Use transaction quantity
					}
				: null;

			if (existingOrder) {
				// Add amount to total
				existingOrder.amount += curr.amount;
				existingOrder.total_payment += curr.amount;

				// Add product to existing order
				if (productWithPrice) {
					existingOrder.product.push(productWithPrice);
				}
			} else {
				// Create new order entry
				acc.push({
					order_id: curr.order_id,
					amount: curr.amount, // Initialize with first item's amount
					fee: curr.fee || 0,
					total_payment: curr.amount + (curr.fee || 0),
					status: curr.status,
					payment_method: curr.payment_method,
					completed_at: curr.completed_at,
					created_at: curr.created_at,
					product: productWithPrice ? [productWithPrice] : []
				});
			}

			return acc;
		}, []) || [];

	// Limit to 5 unique orders
	const uniqueRecentOrders = groupedOrders.slice(0, 5);

	return {
		user: {
			id: user.id,
			email: user.email,
			full_name: roleData?.full_name || '',
			avatar_url: profileData?.avatar_url || null
		},
		stats: {
			totalOrders,
			pendingOrders,
			completedOrders
		},
		recentOrders: uniqueRecentOrders
	};
};
