// src/routes/api/profile/update-email/+server.ts
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
		const { new_email } = body;

		if (!new_email) {
			return json({ error: 'Email baru harus diisi' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
			email: new_email
		});

		if (error) {
			console.error('Update email error:', error);
			return json({ error: error.message || 'Gagal update email' }, { status: 400 });
		}

		return json({
			success: true,
			message: 'Email berhasil diubah. Cek email lama dan baru untuk konfirmasi.'
		});
	} catch (error) {
		console.error('Update email error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
