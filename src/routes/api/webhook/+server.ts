import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const supabaseAdmin = getSupabaseAdmin();
	const body = await request.json();
	const { order_id, amount, status, payment_method } = body;

	console.log('Webhook received:', { order_id, amount, status, payment_method });

	if (status !== 'completed') {
		return json({ received: true });
	}

	// Update SEMUA transactions dengan order_id yang sama
	const { data: updated, error: updateErr } = await supabaseAdmin
		.from('transactions')
		.update({
			status: 'completed',
			payment_method,
			completed_at: new Date().toISOString()
		})
		.eq('order_id', order_id)
		.eq('status', 'pending')
		.select('product_id, amount');

	if (updateErr) {
		console.error('Failed to update transactions:', updateErr);
		return json({ received: true });
	}

	console.log(`✅ Updated ${updated?.length || 0} transactions for order ${order_id}`);

	// Kurangi stok untuk setiap produk
	if (updated && updated.length > 0) {
		for (const transaction of updated) {
			const { data: product } = await supabaseAdmin
				.from('products')
				.select('stock, price')
				.eq('id', transaction.product_id)
				.single();

			if (product) {
				// Hitung quantity dari amount
				const quantity = Math.floor(transaction.amount / product.price);

				// Kurangi stok
				const { error: stockError } = await supabaseAdmin
					.from('products')
					.update({
						stock: Math.max(0, product.stock - quantity)
					})
					.eq('id', transaction.product_id);

				if (stockError) {
					console.error('Failed to reduce stock:', stockError);
				} else {
					console.log(`✅ Stock reduced for product ${transaction.product_id}: ${quantity} units`);
				}
			}
		}
	}

	return json({ received: true });
};
