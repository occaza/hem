import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseAdmin } from '$lib/server/supabase';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { identifier } = await request.json();

		if (!identifier) {
			return json({ error: 'Identifier required' }, { status: 400 });
		}

		// Jika identifier adalah email, kembalikan langsung
		if (identifier.includes('@')) {
			return json({ email: identifier });
		}

		// Jika bukan email, asumsikan username dan cari di user_roles
		const supabaseAdmin = getSupabaseAdmin();

		const { data: userRole, error } = await supabaseAdmin
			.from('user_roles')
			.select('user_id')
			.eq('username', identifier)
			.single();

		if (error || !userRole) {
			return json({ error: 'Username tidak ditemukan' }, { status: 404 });
		}

		// Ambil email dari auth.users menggunakan user_id
		const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
			userRole.user_id
		);

		if (userError || !userData.user) {
			return json({ error: 'User data not found' }, { status: 404 });
		}

		return json({ email: userData.user.email });
	} catch (error) {
		console.error('Lookup error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
