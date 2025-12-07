// CSRF Token Generation and Validation
import { randomBytes, timingSafeEqual } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_LIFETIME = 60 * 60 * 1000; // 1 jam

export interface CSRFTokenData {
	token: string;
	createdAt: number;
}

/**
 * Generate secure random CSRF token
 */
export function generateCSRFToken(): string {
	return randomBytes(CSRF_TOKEN_LENGTH).toString('base64url');
}

/**
 * Validate CSRF token dari request
 * @param token - Token dari request header/body
 * @param storedToken - Token yang disimpan di cookie/session
 * @param createdAt - Timestamp saat token dibuat
 * @returns true jika valid
 */
export function validateCSRFToken(
	token: string | null | undefined,
	storedToken: string | null | undefined,
	createdAt: number
): boolean {
	// Check if tokens exist
	if (!token || !storedToken) {
		return false;
	}

	// Check token expiration
	const now = Date.now();
	if (now - createdAt > CSRF_TOKEN_LIFETIME) {
		return false;
	}

	// Timing-safe comparison to prevent timing attacks
	try {
		const tokenBuffer = Buffer.from(token);
		const storedBuffer = Buffer.from(storedToken);

		// Tokens must be same length
		if (tokenBuffer.length !== storedBuffer.length) {
			return false;
		}

		return timingSafeEqual(tokenBuffer, storedBuffer);
	} catch {
		return false;
	}
}

/**
 * Extract CSRF token dari request
 * Checks header first, then body
 */
export function extractCSRFToken(request: Request, body?: any): string | null {
	// Check X-CSRF-Token header first (recommended)
	const headerToken = request.headers.get('x-csrf-token');
	if (headerToken) {
		return headerToken;
	}

	// Fallback to body (for form submissions)
	if (body && typeof body === 'object' && body._csrf) {
		return body._csrf;
	}

	return null;
}

/**
 * Parse CSRF cookie value
 */
export function parseCSRFCookie(cookieValue: string | undefined): CSRFTokenData | null {
	if (!cookieValue) {
		return null;
	}

	try {
		const [token, createdAtStr] = cookieValue.split('.');
		const createdAt = parseInt(createdAtStr, 10);

		if (!token || isNaN(createdAt)) {
			return null;
		}

		return { token, createdAt };
	} catch {
		return null;
	}
}

/**
 * Serialize CSRF token untuk cookie
 */
export function serializeCSRFToken(token: string, createdAt: number): string {
	return `${token}.${createdAt}`;
}
