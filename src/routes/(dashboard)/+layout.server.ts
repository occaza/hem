// src/routes/(dashboard)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import { getUser, isSuperAdmin } from '$lib/server/auth';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = await getUser(cookies);

	if (!user) {
		throw redirect(302, '/login');
	}

	// Hanya superadmin yang bisa akses dashboard
	if (!isSuperAdmin(user)) {
		throw redirect(302, '/');
	}

	// Fetch processing orders count for badge
	const supabaseAdmin = getSupabaseAdmin();

	// We fetch just order_id to count unique orders
	const { data: processingData } = await supabaseAdmin
		.from('transactions')
		.select('order_id')
		.eq('status', 'processing');

	// Count unique order_ids
	const uniqueProcessingOrders = new Set(processingData?.map((t) => t.order_id));
	const processingCount = uniqueProcessingOrders.size;

	return {
		user: {
			id: user.id,
			email: user.email,
			role: user.role
		},
		processingCount
	};
};
