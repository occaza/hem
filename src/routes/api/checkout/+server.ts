import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { pakasir, type PaymentMethod } from '$lib/server/pakasir';
import { calculateDiscountedPrice } from '$lib/utils/product.utils';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { product_id, order_id, payment_method = 'qris', user_id, quantity = 1, note } = body; // Tambah note

		if (!product_id || typeof product_id !== 'string') {
			return json({ error: 'Invalid or missing product_id' }, { status: 400 });
		}

		if (!order_id || typeof order_id !== 'string') {
			return json({ error: 'Invalid or missing order_id' }, { status: 400 });
		}

		if (!user_id || typeof user_id !== 'string') {
			return json({ error: 'User ID required' }, { status: 400 });
		}

		if (!/^[a-zA-Z0-9_-]{5,100}$/.test(order_id)) {
			return json({ error: 'order_id must be 5-100 alphanumeric characters' }, { status: 400 });
		}

		// Validasi quantity
		const qty = parseInt(quantity.toString());
		if (isNaN(qty) || qty < 1) {
			return json({ error: 'Invalid quantity' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { data: product, error: productError } = await supabaseAdmin
			.from('products')
			.select('price, stock, discount_percentage, discount_end_date')
			.eq('id', product_id)
			.single();

		if (productError || !product) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		// Cek stock
		if (product.stock < qty) {
			return json({ error: 'Insufficient stock' }, { status: 400 });
		}

		// Hitung amount berdasarkan quantity (dengan diskon jika ada)
		const finalPrice = calculateDiscountedPrice(product as any);
		const amount = Math.round(finalPrice * qty);

		if (!amount || amount <= 0 || amount > 100_000_000) {
			return json({ error: 'Invalid product price or quantity' }, { status: 500 });
		}

		// Check existing transaction
		const { data: existing, error: fetchError } = await supabaseAdmin
			.from('transactions')
			.select('order_id')
			.eq('order_id', order_id)
			.single();

		// Get user details for Pakasir (required for VA/Retail)
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('full_name')
			.eq('id', user_id)
			.single();

		const { data: userData, error: userError } =
			await supabaseAdmin.auth.admin.getUserById(user_id);

		const customerName = profile?.full_name || 'Customer';
		const customerEmail = userData?.user?.email || 'customer@example.com';

		// Create payment via Pakasir
		console.log('Creating payment via Pakasir:', {
			order_id,
			amount,
			payment_method,
			quantity: qty,
			customerName,
			customerEmail
		});
		const payment = await pakasir.createTransaction(
			order_id,
			amount,
			payment_method as PaymentMethod,
			customerName,
			customerEmail
		);

		console.log('Payment created:', payment);

		if (fetchError && fetchError.code !== 'PGRST116') {
			console.error('Supabase fetch error:', fetchError);
			return json({ error: 'Failed to check existing transaction' }, { status: 500 });
		}

		// Insert new transaction with payment info
		if (fetchError?.code === 'PGRST116') {
			const { error: insertError } = await supabaseAdmin.from('transactions').insert({
				order_id,
				product_id,
				amount,
				status: 'pending',
				user_id,
				payment_method: payment.payment_method,
				payment_number: payment.payment_number,
				fee: payment.fee,
				total_payment: payment.total_payment,
				expired_at: payment.expired_at
			});

			if (insertError) {
				console.error('Failed to insert transaction:', insertError);
				return json({ error: 'Failed to create transaction' }, { status: 500 });
			}

			// Insert note jika ada
			if (note && note.trim()) {
				const { error: noteError } = await supabaseAdmin.from('transaction_notes').insert({
					order_id: order_id,
					product_id,
					note: note.trim()
				});

				if (noteError) {
					console.error('Failed to save note:', noteError);
				}
			}
		} else {
			// Update existing transaction with payment info
			const { error: updateError } = await supabaseAdmin
				.from('transactions')
				.update({
					amount, // Update amount juga kalau quantity berubah
					payment_method: payment.payment_method,
					payment_number: payment.payment_number,
					fee: payment.fee,
					total_payment: payment.total_payment,
					expired_at: payment.expired_at
				})
				.eq('order_id', order_id);

			if (updateError) {
				console.error('Failed to update transaction:', updateError);
			}
		}
		// Tambahkan log ini
		console.log('Final response:', {
			order_id: payment.order_id,
			amount: payment.amount,
			calculated_amount: amount,
			quantity: qty,
			product_price: product.price
		});
		return json({
			order_id: payment.order_id,
			amount: payment.amount,
			fee: payment.fee,
			total_payment: payment.total_payment,
			payment_method: payment.payment_method,
			payment_number: payment.payment_number,
			expired_at: payment.expired_at
		});
	} catch (error) {
		console.error('Checkout error:', error);
		return json(
			{
				error: error instanceof Error ? error.message : String(error),
				message: 'Checkout failed'
			},
			{ status: 500 }
		);
	}
};
