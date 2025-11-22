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

	// Get recent orders (last 5)
	const { data: recentOrders, error: recentOrdersError } = await supabaseAdmin
		.from('transactions')
		.select(
			`
			order_id,
			amount,
			status,
			created_at,
			product:products (
				name,
				images
			)
		`
		)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(5);

	if (recentOrdersError) {
		console.error('Error fetching recent orders:', recentOrdersError);
	}

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
		recentOrders: recentOrders || []
	};
};
