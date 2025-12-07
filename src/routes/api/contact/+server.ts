import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendContactEmail } from '$lib/server/email';
import { rateLimiters, getClientIP, getRateLimitErrorMessage } from '$lib/server/rate-limiter';
import { validateCSRFToken, extractCSRFToken, parseCSRFCookie } from '$lib/server/csrf';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// CSRF Protection
		const body = await request.json();
		const csrfToken = extractCSRFToken(request, body);
		const csrfCookie = parseCSRFCookie(cookies.get('csrf_token'));

		if (!validateCSRFToken(csrfToken, csrfCookie?.token, csrfCookie?.createdAt || 0)) {
			return json({ error: 'Invalid CSRF token' }, { status: 403 });
		}

		// Rate Limiting: 3 requests per 15 menit per IP
		const clientIP = getClientIP(request);
		const rateLimitKey = `contact:${clientIP}`;
		const rateLimit = rateLimiters.contact.check(rateLimitKey);

		if (!rateLimit.allowed) {
			return json(
				{ error: getRateLimitErrorMessage(rateLimit) },
				{
					status: 429,
					headers: {
						'X-RateLimit-Limit': rateLimit.limit.toString(),
						'X-RateLimit-Remaining': rateLimit.remaining.toString(),
						'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
						'Retry-After': (rateLimit.retryAfter || 0).toString()
					}
				}
			);
		}

		const { name, email, subject, message } = body;

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

		return json(
			{ success: true, message: 'Pesan berhasil dikirim!' },
			{
				headers: {
					'X-RateLimit-Limit': rateLimit.limit.toString(),
					'X-RateLimit-Remaining': rateLimit.remaining.toString(),
					'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString()
				}
			}
		);
	} catch (error) {
		console.error('Contact API error:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};
