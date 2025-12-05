import { json } from '@sveltejs/kit';
import { verifyTelegramAuth } from '$lib/server/telegram';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const data = await request.json();

		// 1. Verify Telegram data
		const isValid = verifyTelegramAuth(data);
		if (!isValid) {
			return json({ error: 'Invalid authentication data' }, { status: 401 });
		}

		const supabaseAdmin = getSupabaseAdmin();
		const telegramId = data.id;
		const telegramUsername = data.username;
		const photoUrl = data.photo_url;
		const firstName = data.first_name;
		const lastName = data.last_name || '';
		const fullName = `${firstName} ${lastName}`.trim();

		// 2. Check if user exists in profiles
		const { data: profile, error: profileError } = await supabaseAdmin
			.from('user_profiles')
			.select('user_id')
			.eq('telegram_id', telegramId)
			.single();

		let userId = profile?.user_id;

		if (!userId) {
			// 3. Create new user if not exists
			// We use a dummy email for Telegram users
			const email = `tg_${telegramId}@telegram.adverfi.com`;

			// Check if auth user exists (in case profile was deleted but auth user remains)
			const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
			const authUser = existingUser.users.find((u) => u.email === email);

			if (authUser) {
				userId = authUser.id;
			} else {
				// Create new auth user
				const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
					email,
					email_confirm: true,
					user_metadata: {
						full_name: fullName,
						telegram_id: telegramId,
						telegram_username: telegramUsername,
						avatar_url: photoUrl
					}
				});

				if (createError) {
					console.error('Create user error:', createError);
					return json({ error: 'Failed to create user' }, { status: 500 });
				}
				userId = newUser.user.id;
			}

			// Create/Update profile
			const { error: upsertError } = await supabaseAdmin.from('user_profiles').upsert(
				{
					user_id: userId,
					full_name: fullName,
					telegram_id: telegramId,
					telegram_username: telegramUsername,
					avatar_url: photoUrl,
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'user_id' }
			);

			if (upsertError) {
				console.error('Upsert profile error:', upsertError);
				// Continue anyway, auth user is created
			}
		}

		// 4. Generate Session
		// We use magic link to generate a token, then verify it to get a session
		const email = `tg_${telegramId}@telegram.adverfi.com`;
		const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
			type: 'magiclink',
			email
		});

		if (linkError || !linkData.properties?.action_link) {
			console.error('Generate link error:', linkError);
			return json({ error: 'Failed to generate session' }, { status: 500 });
		}

		// Extract token from action_link
		// Link format: .../verify?token=TOKEN&type=magiclink...
		const actionLink = linkData.properties.action_link;
		const tokenMatch = actionLink.match(/token=([^&]+)/);

		if (!tokenMatch) {
			return json({ error: 'Failed to extract token' }, { status: 500 });
		}

		const token = tokenMatch[1];

		// Verify OTP to get session
		const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
			token,
			type: 'magiclink',
			email
		});

		if (sessionError || !sessionData.session) {
			console.error('Verify OTP error:', sessionError);
			return json({ error: 'Failed to create session' }, { status: 500 });
		}

		// 5. Set Cookies
		const { access_token, refresh_token, expires_in } = sessionData.session;

		cookies.set('sb-access-token', access_token, {
			path: '/',
			maxAge: expires_in,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});

		cookies.set('sb-refresh-token', refresh_token, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});

		return json({ success: true, user: sessionData.user });
	} catch (error) {
		console.error('Telegram auth error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
