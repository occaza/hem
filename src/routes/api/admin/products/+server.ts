// src/routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { Product } from '$lib/types/types';

export async function GET() {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		// Select ALL fields yang dibutuhkan
		const { data, error } = await supabaseAdmin
			.from('products')
			.select(
				'id, name, price, description, detail_description, images, stock, discount_percentage, discount_end_date, created_at'
			)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Supabase query error:', error);
			return json({ error: 'Failed to fetch products' }, { status: 500 });
		}

		console.log('Products fetched:', data?.length || 0);

		// Log first product untuk debug
		if (data && data.length > 0) {
			console.log('First product sample:', {
				name: data[0].name,
				stock: data[0].stock,
				stockType: typeof data[0].stock,
				images: data[0].images,
				imagesType: typeof data[0].images
			});
		}

		return json(data as Product[]);
	} catch (err) {
		console.error('Unexpected error in /api/products:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
