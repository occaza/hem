import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { calculateDiscountedPrice } from '$lib/utils/product.utils';

export const GET = async ({ params }) => {
	const { product_id } = params;
	const supabaseAdmin = getSupabaseAdmin();

	const { data: product, error } = await supabaseAdmin
		.from('products')
		.select('*')
		.eq('id', product_id)
		.single();

	if (error) return json({ error });

	const finalPrice = calculateDiscountedPrice(product);

	return json({
		product_name: product.name,
		original_price: product.price,
		discount_percentage: product.discount_percentage,
		discount_end_date: product.discount_end_date,
		calculated_final_price: finalPrice,
		is_discount_active: product.discount_percentage > 0,
		server_time: new Date().toISOString()
	});
};
