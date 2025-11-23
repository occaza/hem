// src/routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { Product } from '$lib/types/types';

export async function GET({ url }) {
	try {
		const supabaseAdmin = getSupabaseAdmin();
		const categorySlug = url.searchParams.get('category');

		let query = supabaseAdmin
			.from('products')
			.select(
				`
				*,
				product_categories(
					category_id,
					categories(id, name, slug, icon)
				)
			`
			)
			.eq('status', 'active');

		// Filter by category if provided
		if (categorySlug) {
			// When filtering by category, use inner join
			query = supabaseAdmin
				.from('products')
				.select(
					`
					*,
					product_categories!inner(
						category_id,
						categories!inner(id, name, slug, icon)
					)
				`
				)
				.eq('status', 'active')
				.eq('product_categories.categories.slug', categorySlug);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) {
			console.error('Supabase query error:', error);
			return json({ error: 'Failed to fetch products' }, { status: 500 });
		}

		// Transform data to include categories array
		const productsWithCategories =
			data?.map((product: any) => ({
				...product,
				categories: product.product_categories?.map((pc: any) => pc.categories) || []
			})) || [];

		// Remove product_categories from response
		const cleanedProducts = productsWithCategories.map(
			({ product_categories, ...product }) => product
		);

		return json(cleanedProducts as Product[], {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate'
			}
		});
	} catch (err) {
		console.error('❌ Unexpected error in /api/products:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
