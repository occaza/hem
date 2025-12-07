import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { requireRole } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const body = await request.json();
		const { transaction_id, product_id, type, content } = body;

		if (!transaction_id || !product_id || !content) {
			return json({ error: 'Data tidak lengkap' }, { status: 400 });
		}

		if (!['text', 'file', 'image'].includes(type)) {
			return json({ error: 'Tipe fulfillment tidak valid' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('transaction_fulfillments')
			.insert({
				order_id: transaction_id,
				product_id,
				type,
				content
			})
			.select()
			.single();

		if (error) {
			console.error('Insert fulfillment error:', error);
			return json({ error: 'Gagal menyimpan data fulfillment' }, { status: 500 });
		}

		// Optional: Update transaction status to 'completed' if all items are fulfilled?
		// For now, let's keep it manual as requested by the user.
		// The fulfillment is saved ("draft"), but the user won't see it until the order is marked completed.

		return json(data);
	} catch (error) {
		console.error('Fulfillment error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url, cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const id = url.searchParams.get('id');
		if (!id) {
			return json({ error: 'ID tidak ditemukan' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { error } = await supabaseAdmin.from('transaction_fulfillments').delete().eq('id', id);

		if (error) {
			console.error('Delete fulfillment error:', error);
			return json({ error: 'Gagal menghapus fulfillment' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Delete fulfillment error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
