// src/routes/api/products/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { slug } = params;

		if (!slug) {
			return json({ error: 'Product ID required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('products')
			.select('*')
			.eq('id', slug)
			.single();

		if (error || !data) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		return json(data);
	} catch (error) {
		console.error('Get product error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
