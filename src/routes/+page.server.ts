import { getSupabaseAdmin } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const supabase = getSupabaseAdmin();

	// Fetch 5 featured products
	const { data, error } = await supabase
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
		.eq('status', 'active')
		.order('created_at', { ascending: false })
		.limit(5);

	if (error) {
		console.error('Error fetching products:', error);
		return {
			products: []
		};
	}

	// Transform data to include categories array
	const productsWithCategories =
		data?.map((product: any) => ({
			...product,
			categories: product.product_categories?.map((pc: any) => pc.categories) || []
		})) || [];

	// Remove product_categories from response
	const products = productsWithCategories.map(({ product_categories, ...product }) => product);

	return {
		products
	};
};
