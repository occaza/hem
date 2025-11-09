// src/routes/api/admin/transactions/[order_id]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function GET({ params }: { params: { order_id: string } }) {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('transactions')
			.select('*, products(*)')
			.eq('order_id', params.order_id)
			.single();

		if (error || !data) {
			return json({ error: 'Transaction not found' }, { status: 404 });
		}

		return json(data);
	} catch (error) {
		console.error('Get transaction detail error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
