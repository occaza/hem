// src/routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { Product } from '$lib/types/types';

export async function GET() {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('products')
			.select('id, name, price, description');

		if (error) {
			console.error('Supabase query error:', error);
			return json({ error: 'Failed to fetch products' }, { status: 500 });
		}

		return json(data as Product[]);
	} catch (err) {
		console.error('Unexpected error in /api/products:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
