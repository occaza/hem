import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { requireRole } from '$lib/server/auth';
import type { RequestHandler } from '../$types';

export const POST: RequestHandler = async ({ params, cookies }) => {
	try {
		const user = await requireRole(cookies, ['superadmin']);
		const { order_id } = params;

		const supabaseAdmin = getSupabaseAdmin();

		// Update status ke completed
		const { data: updated, error: updateErr } = await supabaseAdmin
			.from('transactions')
			.update({
				status: 'completed',
				completed_at: new Date().toISOString(),
				processed_by: user.id
			})
			.eq('order_id', order_id)
			.eq('status', 'processing')
			.select('product_id, amount');

		if (updateErr) {
			console.error('Update order error:', updateErr);
			return json({ error: 'Failed to complete order' }, { status: 500 });
		}

		if (!updated || updated.length === 0) {
			return json({ error: 'Order not found or already completed' }, { status: 404 });
		}

		// Stock is already reduced by webhook when payment is confirmed
		// No need to reduce stock again here

		console.log(`✅ Order ${order_id} completed by ${user.email}`);

		return json({ success: true });
	} catch (error) {
		console.error('Complete order error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
