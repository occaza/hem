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

		let { data, error } = await supabaseAdmin
			.from('products')
			.select('*')
			.eq('slug', slug)
			.single();

		// Jika tidak ketemu by slug, coba by id
		if (error || !data) {
			const result = await supabaseAdmin.from('products').select('*').eq('id', slug).single();
			data = result.data;
			error = result.error;
		}

		if (error || !data) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		return json(data);
	} catch (error) {
		console.error('Get product error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
