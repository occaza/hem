// src/routes/api/profile/update-password/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { getUser } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const user = await getUser(cookies);

		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { new_password } = body;

		if (!new_password) {
			return json({ error: 'Password baru harus diisi' }, { status: 400 });
		}

		if (new_password.length < 6) {
			return json({ error: 'Password minimal 6 karakter' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
			password: new_password
		});

		if (error) {
			console.error('Update password error:', error);
			return json({ error: error.message || 'Gagal update password' }, { status: 400 });
		}

		return json({
			success: true,
			message: 'Password berhasil diubah'
		});
	} catch (error) {
		console.error('Update password error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
