import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { pakasir } from '$lib/server/pakasir';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const supabaseAdmin = getSupabaseAdmin();

	try {
		// 1. Read Raw Body (for signature verification)
		const rawBody = await request.text();

		// 2. Verify Signature
		const signature =
			request.headers.get('x-pakasir-signature') ||
			request.headers.get('x-signature') ||
			request.headers.get('signature');

		if (!signature) {
			console.error('❌ Webhook missing signature');
			return json({ received: false, error: 'Missing signature' }, { status: 401 });
		}

		if (!pakasir.verifySignature(rawBody, signature)) {
			console.error('❌ Webhook signature verification failed');
			return json({ received: false, error: 'Invalid signature' }, { status: 403 });
		}

		// 3. Parse Body
		let body;
		try {
			body = JSON.parse(rawBody);
		} catch (e) {
			console.error('❌ Webhook JSON parse error', e);
			return json({ received: false, error: 'Invalid JSON' }, { status: 400 });
		}

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

		// 1. Fetch ALL transactions for this order_id (Multi-Item Support)
		const { data: transactions, error: fetchError } = await supabaseAdmin
			.from('transactions')
			.select('order_id, amount, status, payment_method, product_id, quantity, user_id')
			.eq('order_id', order_id);

		if (fetchError || !transactions || transactions.length === 0) {
			console.error('❌ Webhook validation failed: Transaction not found', {
				order_id,
				error: fetchError
			});
			return json({ received: false, error: 'Transaction not found' }, { status: 404 });
		}

		// 2. Validate Total Amount
		// Pakasir sends TOTAL amount. We must compare it with SUM of all transaction items.
		const totalTransactionAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

		// Allow small floating point difference if any (though usually integer in IDR)
		if (Math.abs(totalTransactionAmount - amount) > 100) {
			console.error('❌ Webhook validation failed: Amount mismatch', {
				order_id,
				expected: totalTransactionAmount,
				received: amount
			});
			return json({ received: false, error: 'Amount mismatch' }, { status: 400 });
		}

		// 3. Check Idempotency (Check if ANY item is already processed)
		// If all are 'completed' or 'processing', ignore.
		const allProcessed = transactions.every(
			(t) => t.status === 'completed' || t.status === 'processing'
		);
		if (allProcessed) {
			console.log('⚠️ Webhook ignored: Transactions already processed', { order_id });
			return json({ received: true, message: 'Already processed' });
		}

		console.log(`🔄 Processing ${transactions.length} items for Order #${order_id}`);

		// 4. Process Each Transaction Item
		const results = [];
		for (const transaction of transactions) {
			// Skip if already processed
			if (transaction.status !== 'pending') continue;

			// A. Update Status to Processing
			const { error: updateErr } = await supabaseAdmin
				.from('transactions')
				.update({
					status: 'processing',
					payment_method: payment_method || transaction.payment_method,
					completed_at: null, // Will be set to now() by trigger or next update? Or keep null for processing?
					processing_started_at: new Date().toISOString()
				})
				.eq('order_id', order_id)
				.eq('product_id', transaction.product_id) // Specific item
				.eq('status', 'pending');

			if (updateErr) {
				console.error(`❌ Failed to update status for item ${transaction.product_id}:`, updateErr);
				results.push({ product_id: transaction.product_id, status: 'failed_update' });
				continue;
			}

			// B. Reduce Stock Atomically
			const quantity = transaction.quantity || 1;
			const { data: rpcResult, error: stockError } = await supabaseAdmin.rpc(
				'reduce_stock_atomic',
				{
					p_product_id: transaction.product_id,
					p_quantity: quantity
				}
			);

			// RPC with RETURNS TABLE returns an array
			const productUpdate = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;

			if (stockError || !productUpdate || !productUpdate.success) {
				console.error(`❌ Stock reduction failed for item ${transaction.product_id}:`, {
					stockError,
					productUpdate
				});

				// Mark as failed
				await supabaseAdmin
					.from('transactions')
					.update({
						status: 'failed',
						error_message: 'Insufficient stock at payment confirmation'
					})
					.eq('order_id', order_id)
					.eq('product_id', transaction.product_id);

				results.push({ product_id: transaction.product_id, status: 'failed_stock' });
			} else {
				console.log(
					`✅ Stock reduced for item ${transaction.product_id}. New stock: ${productUpdate.new_stock}`
				);

				// Keep as Processing (For manual fulfillment by admin)
				// Status is already set to 'processing' in step A
				console.log(
					`✅ Order ${order_id} item ${transaction.product_id} is now PROCESSING (waiting for admin)`
				);

				results.push({ product_id: transaction.product_id, status: 'success' });
			}
		}

		// Check if any failed
		const anyFailed = results.some((r) => r.status.startsWith('failed'));
		if (anyFailed) {
			console.warn('⚠️ Some items failed to process', results);
			// Return 200 to acknowledge webhook, but log error.
			// Or return 400/500 to retry?
			// If stock failed, retrying won't help unless stock is added. Better to acknowledge and handle manually.
			return json({ received: true, status: 'partial_success', results });
		}

		return json({ received: true, status: 'completed' });
	} catch (error) {
		console.error('❌ Webhook processing error:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});

		return json({ received: true, error: 'Internal error' });
	}
};
