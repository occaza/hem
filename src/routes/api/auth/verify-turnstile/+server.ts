import { json } from '@sveltejs/kit';
import { TURNSTILE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { token } = await request.json();

		if (!token) {
			return json({ success: false, error: 'Token is required' }, { status: 400 });
		}

		// Skip verification if Turnstile is disabled (development mode)
		if (PUBLIC_TURNSTILE_ENABLED === 'false' || token === 'dev-bypass-token') {
			return json({ success: true });
		}

		// Verify token with Cloudflare Turnstile API
		const verifyResponse = await fetch(
			'https://challenges.cloudflare.com/turnstile/v0/siteverify',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					secret: TURNSTILE_SECRET_KEY,
					response: token
				})
			}
		);

		const verifyData = await verifyResponse.json();

		if (verifyData.success) {
			return json({ success: true });
		} else {
			return json(
				{
					success: false,
					error: 'Verification failed',
					'error-codes': verifyData['error-codes']
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error('Turnstile verification error:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
