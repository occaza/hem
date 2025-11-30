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
			.select(
				`
				*,
				product_categories(
					category_id,
					categories(id, name, slug, icon)
				)
			`
			)
			.eq('slug', slug)
			.single();

		if (data) {
			// Transform categories structure
			data.categories = data.product_categories?.map((pc: any) => pc.categories) || [];
			delete data.product_categories;
		}

		if (error || !data) {
			const result = await supabaseAdmin
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
				.eq('id', slug)
				.single();

			data = result.data;
			error = result.error;

			if (data) {
				// Transform categories structure
				data.categories = data.product_categories?.map((pc: any) => pc.categories) || [];
				delete data.product_categories;
			}
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
