// Client-side CSRF helper utilities

/**
 * Get CSRF token dari cookie
 */
export function getCSRFToken(): string | null {
	if (typeof document === 'undefined') {
		return null;
	}

	const cookies = document.cookie.split(';');
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'csrf_token') {
			// Extract token part (before the dot)
			const tokenPart = value.split('.')[0];
			return tokenPart || null;
		}
	}

	return null;
}

/**
 * Add CSRF token ke fetch headers
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
	const token = getCSRFToken();

	if (!token) {
		console.warn('CSRF token not found in cookies');
		return headers;
	}

	// Convert headers to object if needed
	const headersObj =
		headers instanceof Headers
			? Object.fromEntries(headers.entries())
			: Array.isArray(headers)
				? Object.fromEntries(headers)
				: headers;

	return {
		...headersObj,
		'X-CSRF-Token': token
	};
}

/**
 * Wrapper untuk fetch dengan CSRF token otomatis
 */
export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
	const headers = addCSRFHeader(options.headers);

	return fetch(url, {
		...options,
		headers
	});
}
