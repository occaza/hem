import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function POST({ request, url }) {
	const supabaseAdmin = getSupabaseAdmin(); // ← call it here (at request time)

	const { data, error } = await supabaseAdmin.from('products').select('id, name, price');

	if (error) {
		return json({ error: 'Gagal memuat produk' }, { status: 500 });
	}

	return json(data);
}
