import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
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

		// Rate Limiting: 5 requests per 15 menit per IP
		const clientIP = getClientIP(request);
		const rateLimitKey = `password-reset:${clientIP}`;
		const rateLimit = rateLimiters.passwordReset.check(rateLimitKey);

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

		const { email } = body;

		if (!email) {
			return json({ error: 'Email harus diisi' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// Send reset password email
		const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
			redirectTo: `${new URL(request.url).origin}/reset-password`
		});

		if (error) {
			console.error('Reset password error:', error);
			// Jangan kasih tau user kalau email tidak ditemukan (security)
			return json(
				{
					success: true,
					message: 'Jika email terdaftar, link reset password akan dikirim'
				},
				{
					headers: {
						'X-RateLimit-Limit': rateLimit.limit.toString(),
						'X-RateLimit-Remaining': rateLimit.remaining.toString(),
						'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString()
					}
				}
			);
		}

		return json(
			{
				success: true,
				message: 'Link reset password telah dikirim ke email Anda'
			},
			{
				headers: {
					'X-RateLimit-Limit': rateLimit.limit.toString(),
					'X-RateLimit-Remaining': rateLimit.remaining.toString(),
					'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString()
				}
			}
		);
	} catch (error) {
		console.error('Request reset error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
