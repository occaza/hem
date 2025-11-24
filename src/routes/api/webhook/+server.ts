import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const supabaseAdmin = getSupabaseAdmin();

	try {
		const body = await request.json();
		const { order_id, amount, status, payment_method, project, completed_at } = body;

		// Log webhook untuk audit trail
		console.log('📥 Webhook received:', {
			order_id,
			amount,
			status,
			payment_method,
			project,
			completed_at,
			timestamp: new Date().toISOString()
		});

		// Validasi required fields
		if (!order_id || !amount || !status) {
			console.error('❌ Webhook validation failed: Missing required fields', body);
			return json({ received: false, error: 'Missing required fields' }, { status: 400 });
		}

		// Hanya proses jika status completed
		if (status !== 'completed') {
			console.log('ℹ️ Webhook ignored: Status is not completed', { order_id, status });
			return json({ received: true, message: 'Status not completed' });
		}

		// SECURITY: Validasi transaksi ada di database dan amount sesuai
		const { data: existingTransaction, error: fetchError } = await supabaseAdmin
			.from('transactions')
			.select('order_id, amount, status, payment_method, product_id, quantity')
			.eq('order_id', order_id)
			.single();

		if (fetchError || !existingTransaction) {
			console.error('❌ Webhook validation failed: Transaction not found', {
				order_id,
				error: fetchError
			});
			return json({ received: false, error: 'Transaction not found' }, { status: 404 });
		}

		// SECURITY: Validasi amount harus match
		if (existingTransaction.amount !== amount) {
			console.error('❌ Webhook validation failed: Amount mismatch', {
				order_id,
				expected: existingTransaction.amount,
				received: amount
			});
			return json({ received: false, error: 'Amount mismatch' }, { status: 400 });
		}

		// Cek apakah transaksi sudah diproses sebelumnya (idempotency)
		if (existingTransaction.status !== 'pending') {
			console.log('⚠️ Webhook ignored: Transaction already processed', {
				order_id,
				current_status: existingTransaction.status
			});
			return json({ received: true, message: 'Already processed' });
		}

		// ⭐ UPDATE STATUS FIRST - Prevents duplicate webhooks from processing
		// This MUST happen BEFORE stock reduction to prevent race condition
		const { data: updated, error: updateErr } = await supabaseAdmin
			.from('transactions')
			.update({
				status: 'processing',
				payment_method: payment_method || existingTransaction.payment_method,
				completed_at: null,
				processing_started_at: new Date().toISOString()
			})
			.eq('order_id', order_id)
			.eq('status', 'pending') // Only update if still pending
			.select('product_id, amount, user_id, quantity');

		if (updateErr || !updated || updated.length === 0) {
			console.error('❌ Failed to update transaction or already processed:', {
				order_id,
				error: updateErr
			});
			return json({ received: true, message: 'Already processed or update failed' });
		}

		console.log('✅ Transaction status updated to processing');

		// Now reduce stock atomically
		const quantity = existingTransaction.quantity || 1;
		const product_id = existingTransaction.product_id;

		console.log('💳 Processing payment confirmation:', {
			order_id,
			product_id,
			quantity
		});

		// Reduce stock atomically using PostgreSQL's built-in row locking
		const { data: productUpdate, error: stockError } = await supabaseAdmin.rpc(
			'reduce_stock_atomic',
			{
				p_product_id: product_id,
				p_quantity: quantity
			}
		);

		if (stockError || !productUpdate || !productUpdate.success) {
			console.error('❌ Stock reduction failed:', {
				order_id,
				product_id,
				quantity,
				error: stockError,
				result: productUpdate
			});

			// Mark transaction as failed due to insufficient stock
			await supabaseAdmin
				.from('transactions')
				.update({
					status: 'failed',
					error_message: 'Insufficient stock at payment confirmation'
				})
				.eq('order_id', order_id);

			return json(
				{
					received: false,
					error: 'Insufficient stock',
					message: 'Stock tidak mencukupi saat konfirmasi pembayaran'
				},
				{ status: 400 }
			);
		}

		console.log(`✅ Payment confirmed and stock reduced atomically`, {
			order_id,
			product_id: updated[0].product_id,
			quantity: updated[0].quantity,
			new_stock: productUpdate.new_stock,
			amount: updated[0].amount,
			user_id: updated[0].user_id
		});

		return json({ received: true, status: 'processing' });
	} catch (error) {
		console.error('❌ Webhook processing error:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});

		// Tetap return 200 agar PAKASIR tidak retry terus-menerus
		return json({ received: true, error: 'Internal error' });
	}
};
