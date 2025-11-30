import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendContactEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, email, subject, message } = await request.json();

		// Validate input
		if (!name || !email || !subject || !message) {
			return json({ error: 'Semua field harus diisi' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Format email tidak valid' }, { status: 400 });
		}

		// Validate message length
		if (message.length < 10) {
			return json({ error: 'Pesan minimal 10 karakter' }, { status: 400 });
		}

		// Send email
		const result = await sendContactEmail({
			name,
			email,
			subject,
			message
		});

		if (!result.success) {
			return json({ error: 'Gagal mengirim email. Silakan coba lagi.' }, { status: 500 });
		}

		return json({ success: true, message: 'Pesan berhasil dikirim!' });
	} catch (error) {
		console.error('Contact API error:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};
