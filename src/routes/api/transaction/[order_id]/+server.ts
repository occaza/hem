// src/routes/api/transaction/[order_id]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const supabaseAdmin = getSupabaseAdmin();
	const { order_id } = params;

	if (!order_id) {
		return json({ error: 'Missing order_id' }, { status: 400 });
	}

	const { data, error } = await supabaseAdmin
		.from('transactions')
		.select('status, amount, completed_at')
		.eq('order_id', order_id)
		.single();

	if (error || !data) {
		return json({ error: 'Transaction not found' }, { status: 404 });
	}

	return json(data);
};
