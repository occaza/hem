// src/routes/api/checkout/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { pakasir } from '$lib/server/pakasir';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	const body = await request.json();
	const { product_id, order_id } = body;

	if (!product_id || typeof product_id !== 'string') {
		return json({ error: 'Invalid or missing product_id' }, { status: 400 });
	}

	if (!order_id || typeof order_id !== 'string') {
		return json({ error: 'Invalid or missing order_id' }, { status: 400 });
	}

	if (!/^[a-zA-Z0-9_-]{5,100}$/.test(order_id)) {
		return json({ error: 'order_id must be 5-100 alphanumeric characters' }, { status: 400 });
	}

	const supabaseAdmin = getSupabaseAdmin();

	const { data: product, error: productError } = await supabaseAdmin
		.from('products')
		.select('price')
		.eq('id', product_id)
		.single();

	if (productError || !product) {
		return json({ error: 'Product not found' }, { status: 404 });
	}

	const amount = product.price;

	if (!Number.isInteger(amount) || amount <= 0 || amount > 100_000_000) {
		return json({ error: 'Invalid product price' }, { status: 500 });
	}

	const { data: existing, error: fetchError } = await supabaseAdmin
		.from('transactions')
		.select('order_id')
		.eq('order_id', order_id)
		.single();

	if (fetchError && fetchError.code !== 'PGRST116') {
		console.error('Supabase fetch error:', fetchError);
		return json({ error: 'Failed to check existing transaction' }, { status: 500 });
	}

	if (fetchError?.code === 'PGRST116') {
		const { error: insertError } = await supabaseAdmin.from('transactions').insert({
			order_id,
			product_id,
			amount,
			status: 'pending'
		});

		if (insertError) {
			console.error('Failed to insert transaction:', insertError);
			return json({ error: 'Failed to create transaction' }, { status: 500 });
		}
	}

	const successUrl = `${url.origin}/success?order_id=${encodeURIComponent(order_id)}`;
	const redirectUrl = pakasir.getPaymentUrl(order_id, amount, successUrl);

	console.log('Payment initiated', { order_id, amount, redirectUrl });

	return json({ redirectUrl });
};
