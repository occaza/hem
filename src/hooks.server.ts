import type { Handle } from '@sveltejs/kit';
import {
	generateCSRFToken,
	serializeCSRFToken,
	parseCSRFCookie,
	validateCSRFToken
} from '$lib/server/csrf';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Cek token yang ada di cookie
	const existingCookie = event.cookies.get('csrf_token');
	const parsedCookie = parseCSRFCookie(existingCookie);

	let csrfToken: string;
	let createdAt: number;

	// 2. Reuse token jika masih valid (belum expired)
	const CSRF_TOKEN_LIFETIME = 60 * 60 * 1000; // Match definition in csrf.ts
	const now = Date.now();

	if (parsedCookie && parsedCookie.token && now - parsedCookie.createdAt < CSRF_TOKEN_LIFETIME) {
		csrfToken = parsedCookie.token;
		createdAt = parsedCookie.createdAt;
	} else {
		// 3. Generate baru jika tidak ada atau expired
		csrfToken = generateCSRFToken();
		createdAt = now;
	}

	// Expose token via locals
	event.locals.csrfToken = csrfToken;
	event.locals.csrfCreatedAt = createdAt;

	const response = await resolve(event);

	// 4. Set persistent cookie (Non-HttpOnly so client can read it for header)
	const cookieValue = serializeCSRFToken(csrfToken, createdAt);
	response.headers.append(
		'Set-Cookie',
		`csrf_token=${cookieValue}; Path=/; SameSite=Strict; Max-Age=3600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
	);

	return response;
};
