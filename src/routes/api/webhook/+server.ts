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
			.select('order_id, amount, status, payment_method')
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

		// Update ke status 'processing' ketika pembayaran sukses
		const { data: updated, error: updateErr } = await supabaseAdmin
			.from('transactions')
			.update({
				status: 'processing',
				payment_method: payment_method || existingTransaction.payment_method,
				completed_at: null, // Belum selesai, masih processing
				processing_started_at: new Date().toISOString()
			})
			.eq('order_id', order_id)
			.eq('status', 'pending') // Double check masih pending
			.select('product_id, amount, user_id');

		if (updateErr) {
			console.error('❌ Failed to update transaction:', {
				order_id,
				error: updateErr
			});
			return json({ received: false, error: 'Update failed' }, { status: 500 });
		}

		if (!updated || updated.length === 0) {
			console.error('❌ No transaction updated (race condition?)', { order_id });
			return json({ received: false, error: 'Update failed' }, { status: 500 });
		}

		console.log(`✅ Order ${order_id} moved to PROCESSING status`, {
			product_id: updated[0].product_id,
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
