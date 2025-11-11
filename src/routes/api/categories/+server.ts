// src/routes/api/categories/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('categories')
			.select('*')
			.eq('is_active', true)
			.order('display_order', { ascending: true });

		if (error) {
			console.error('Fetch categories error:', error);
			return json({ error: 'Failed to fetch categories' }, { status: 500 });
		}

		return json(data || []);
	} catch (error) {
		console.error('Get categories error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
