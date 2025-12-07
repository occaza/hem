import { json } from '@sveltejs/kit';
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

		// Rate Limiting: 10 requests per 15 menit per IP
		const clientIP = getClientIP(request);
		const rateLimitKey = `register:${clientIP}`;
		const rateLimit = rateLimiters.auth.check(rateLimitKey);

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

		const { email, password, full_name, username, phone_number } = body;

		console.log('Register request:', { email, full_name, username, phone_number });

		if (!email || !password) {
			return json({ error: 'Email dan password harus diisi' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password minimal 6 karakter' }, { status: 400 });
		}

		if (!full_name || !username || !phone_number) {
			return json({ error: 'Nama lengkap, username, dan nomor HP harus diisi' }, { status: 400 });
		}

		// Import client supabase untuk signup
		const { createClient } = await import('@supabase/supabase-js');
		const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = await import('$env/static/private');

		if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
			return json({ error: 'Supabase config missing' }, { status: 500 });
		}

		const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

		// Signup dengan Supabase client (otomatis kirim email)
		const { data: signupData, error: signupError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name,
					username,
					phone_number
				},
				emailRedirectTo: `${new URL(request.url).origin}/login`
			}
		});

		if (signupError) {
			console.error('Signup error:', signupError);
			return json({ error: signupError.message || 'Gagal membuat akun' }, { status: 400 });
		}

		if (!signupData || !signupData.user) {
			return json({ error: 'Gagal membuat akun' }, { status: 500 });
		}

		console.log('User created:', signupData.user.id);

		// Insert user role menggunakan admin client
		const { getSupabaseAdmin } = await import('$lib/server/supabase');
		const supabaseAdmin = getSupabaseAdmin();

		const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
			user_id: signupData.user.id,
			role: 'user',
			full_name,
			username,
			phone_number
		});

		if (roleError) {
			console.error('Insert role error:', roleError);
			// Tidak return error, user tetap berhasil dibuat
		} else {
			console.log('User role saved successfully');
		}

		return json(
			{
				success: true,
				message: 'Registrasi berhasil. Cek email Anda untuk verifikasi akun.',
				email_sent: !signupData.user.confirmed_at // Email terkirim jika belum confirmed
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
		console.error('Register error:', error);
		return json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
