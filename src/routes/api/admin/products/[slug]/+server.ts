// src/routes/api/products/[slug]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { extractIdFromSlug } from '$lib/utils/slug.utils';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { slug } = params;

		if (!slug) {
			return json({ error: 'Product slug required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// Coba cari by slug dulu
		let { data, error } = await supabaseAdmin
			.from('products')
			.select('*')
			.eq('slug', slug)
			.single();

		// Jika tidak ketemu, coba extract ID dari slug (backward compatibility)
		if (error || !data) {
			const extractedId = extractIdFromSlug(slug);

			if (extractedId) {
				const idSearch = await supabaseAdmin
					.from('products')
					.select('*')
					.ilike('id', `%${extractedId}`)
					.single();

				data = idSearch.data;
				error = idSearch.error;
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
