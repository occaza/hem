import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { pakasir, type PaymentMethod } from '$lib/server/pakasir';
import { calculateDiscountedPrice } from '$lib/utils/product.utils';
import { sendOrderPendingEmail, sendAdminNewOrderEmail } from '$lib/server/email';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		let {
			items,
			product_id,
			order_id,
			payment_method = 'qris',
			user_id,
			quantity = 1,
			note
		} = body;

		// 1. Normalize Items (Support Single & Multi Item)
		if (!items || !Array.isArray(items) || items.length === 0) {
			if (product_id) {
				items = [{ product_id, quantity: parseInt(quantity.toString()), note }];
			} else {
				return json({ error: 'Items or product_id required' }, { status: 400 });
			}
		}

		if (!order_id || typeof order_id !== 'string') {
			return json({ error: 'Invalid or missing order_id' }, { status: 400 });
		}

		if (!user_id || typeof user_id !== 'string') {
			return json({ error: 'User ID required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// 2. Fetch All Products
		const productIds = items.map((item: any) => item.product_id);
		const { data: products, error: productsError } = await supabaseAdmin
			.from('products')
			.select('id, name, price, stock, discount_percentage, discount_end_date')
			.in('id', productIds);

		if (productsError || !products) {
			return json({ error: 'Failed to fetch products' }, { status: 500 });
		}

		// 3. Validate Stock & Calculate Totals
		let totalAmount = 0;
		let originalSubtotal = 0;
		const processedItems = [];

		for (const item of items) {
			const product = products.find((p) => p.id === item.product_id);

			if (!product) {
				return json({ error: `Product ${item.product_id} not found` }, { status: 404 });
			}

			if (product.stock < item.quantity) {
				return json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
			}

			const discountedPrice = calculateDiscountedPrice(product as any);
			const itemTotal = Math.round(discountedPrice * item.quantity);

			totalAmount += itemTotal;
			originalSubtotal += product.price * item.quantity;

			processedItems.push({
				...item,
				product,
				price: discountedPrice,
				itemTotal
			});
		}

		if (totalAmount <= 0) {
			return json({ error: 'Invalid total amount' }, { status: 400 });
		}

		// 4. Get User Info
		const { data: userData, error: userError } =
			await supabaseAdmin.auth.admin.getUserById(user_id);

		const userMetadata = userData?.user?.user_metadata;
		const customerName = userMetadata?.full_name || userMetadata?.name || 'Customer';
		const customerEmail = userData?.user?.email || 'customer@example.com';

		// 5. INSERT TRANSACTIONS FIRST (Pending state, empty payment info)
		// This prevents race condition where webhook arrives before insert finishes
		const transactionInserts = processedItems.map((item) => ({
			order_id,
			product_id: item.product_id,
			amount: item.itemTotal,
			status: 'pending',
			user_id,
			payment_method: payment_method, // Use requested method initially
			payment_number: '-', // Placeholder
			fee: 0, // Placeholder
			total_payment: 0, // Placeholder
			expired_at: null // Placeholder
		}));

		const { error: insertError } = await supabaseAdmin
			.from('transactions')
			.insert(transactionInserts);

		if (insertError) {
			console.error('Failed to insert transactions:', insertError);
			return json({ error: 'Failed to create transaction records' }, { status: 500 });
		}

		// 6. Insert Notes (Bulk)
		const noteInserts = processedItems
			.filter((item) => item.note && item.note.trim())
			.map((item) => ({
				order_id,
				product_id: item.product_id,
				note: item.note.trim()
			}));

		if (noteInserts.length > 0) {
			await supabaseAdmin.from('transaction_notes').insert(noteInserts);
		}

		// 7. Create Payment (Pakasir)
		console.log('Creating payment via Pakasir:', {
			order_id,
			amount: totalAmount,
			payment_method,
			items_count: items.length
		});

		let payment;
		try {
			payment = await pakasir.createTransaction(
				order_id,
				totalAmount,
				payment_method as PaymentMethod,
				customerName,
				customerEmail
			);
		} catch (paymentError) {
			console.error('Pakasir creation failed:', paymentError);
			// If payment creation fails, we should probably mark transactions as failed or delete them?
			// For now, let's mark as failed
			await supabaseAdmin
				.from('transactions')
				.update({ status: 'failed', error_message: 'Payment gateway error' })
				.eq('order_id', order_id);

			throw paymentError;
		}

		// 8. UPDATE TRANSACTIONS with real payment info
		const { error: updateError } = await supabaseAdmin
			.from('transactions')
			.update({
				payment_method: payment.payment_method,
				payment_number: payment.payment_number,
				fee: payment.fee,
				total_payment: payment.total_payment,
				expired_at: payment.expired_at
			})
			.eq('order_id', order_id);

		if (updateError) {
			console.error('Failed to update transaction payment info:', updateError);
			// Non-critical error, user still gets payment info from response/email
		}

		// 9. Send Email Notifications
		const emailItems = processedItems.map((item) => ({
			name: item.product.name,
			quantity: item.quantity,
			price: item.price,
			originalPrice: item.product.price
		}));

		Promise.all([
			sendOrderPendingEmail({
				to: customerEmail,
				customerName,
				orderId: order_id,
				items: emailItems,
				totalPayment: payment.total_payment,
				paymentMethod: payment.payment_method,
				paymentNumber: payment.payment_number,
				expiredAt: payment.expired_at,
				subtotal: totalAmount,
				discount: 0,
				fee: payment.fee
			}),
			sendAdminNewOrderEmail({
				orderId: order_id,
				customerName,
				productName: `${items.length} Items`,
				quantity: items.reduce((acc: number, item: any) => acc + item.quantity, 0),
				totalPayment: payment.total_payment,
				status: 'pending'
			})
		]).catch((err) => console.error('Error sending emails:', err));

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
