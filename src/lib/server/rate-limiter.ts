// Rate Limiter dengan Sliding Window Algorithm
// Menggunakan in-memory store untuk simplicity (production: gunakan Redis)

interface RateLimitEntry {
	count: number;
	resetAt: number;
	requests: number[]; // Timestamps untuk sliding window
}

interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
}

class RateLimiterStore {
	private store = new Map<string, RateLimitEntry>();
	private cleanupInterval: NodeJS.Timeout;

	constructor() {
		// Cleanup expired entries setiap 5 menit
		this.cleanupInterval = setInterval(
			() => {
				this.cleanup();
			},
			5 * 60 * 1000
		);
	}

	private cleanup() {
		const now = Date.now();
		for (const [key, entry] of this.store.entries()) {
			if (entry.resetAt < now) {
				this.store.delete(key);
			}
		}
	}

	get(key: string): RateLimitEntry | undefined {
		return this.store.get(key);
	}

	set(key: string, entry: RateLimitEntry): void {
		this.store.set(key, entry);
	}

	delete(key: string): void {
		this.store.delete(key);
	}

	destroy() {
		clearInterval(this.cleanupInterval);
		this.store.clear();
	}
}

const globalStore = new RateLimiterStore();

export interface RateLimitResult {
	allowed: boolean;
	limit: number;
	remaining: number;
	resetAt: number;
	retryAfter?: number;
}

export class RateLimiter {
	private config: RateLimitConfig;
	private store: RateLimiterStore;

	constructor(config: RateLimitConfig, store?: RateLimiterStore) {
		this.config = config;
		this.store = store || globalStore;
	}

	/**
	 * Check if request is allowed under rate limit
	 * @param key - Unique identifier (user_id, IP, etc)
	 * @returns RateLimitResult with allowed status and metadata
	 */
	check(key: string): RateLimitResult {
		const now = Date.now();
		const windowStart = now - this.config.windowMs;

		let entry = this.store.get(key);

		if (!entry) {
			// First request
			entry = {
				count: 1,
				resetAt: now + this.config.windowMs,
				requests: [now]
			};
			this.store.set(key, entry);

			return {
				allowed: true,
				limit: this.config.maxRequests,
				remaining: this.config.maxRequests - 1,
				resetAt: entry.resetAt
			};
		}

		// Sliding window: filter requests dalam window
		entry.requests = entry.requests.filter((timestamp) => timestamp > windowStart);
		entry.count = entry.requests.length;

		if (entry.count >= this.config.maxRequests) {
			// Rate limit exceeded
			const oldestRequest = entry.requests[0];
			const retryAfter = Math.ceil((oldestRequest + this.config.windowMs - now) / 1000);

			return {
				allowed: false,
				limit: this.config.maxRequests,
				remaining: 0,
				resetAt: oldestRequest + this.config.windowMs,
				retryAfter
			};
		}

		// Allow request
		entry.requests.push(now);
		entry.count = entry.requests.length;
		entry.resetAt = now + this.config.windowMs;
		this.store.set(key, entry);

		return {
			allowed: true,
			limit: this.config.maxRequests,
			remaining: this.config.maxRequests - entry.count,
			resetAt: entry.resetAt
		};
	}

	/**
	 * Reset rate limit for a key (useful for testing)
	 */
	reset(key: string): void {
		this.store.delete(key);
	}
}

// Predefined rate limiters untuk berbagai use cases
export const rateLimiters = {
	// Checkout: 5 requests per 15 menit per user
	checkout: new RateLimiter({
		maxRequests: 5,
		windowMs: 15 * 60 * 1000
	}),

	// Auth (login/register): 10 requests per 15 menit per IP
	auth: new RateLimiter({
		maxRequests: 10,
		windowMs: 15 * 60 * 1000
	}),

	// Contact form: 3 requests per 15 menit per IP
	contact: new RateLimiter({
		maxRequests: 3,
		windowMs: 15 * 60 * 1000
	}),

	// Password reset: 5 requests per 15 menit per IP
	passwordReset: new RateLimiter({
		maxRequests: 5,
		windowMs: 15 * 60 * 1000
	}),

	// General API: 100 requests per menit per IP
	general: new RateLimiter({
		maxRequests: 100,
		windowMs: 60 * 1000
	})
};

/**
 * Helper untuk get client IP dari request
 */
export function getClientIP(request: Request): string {
	// Check common headers untuk IP (reverse proxy, cloudflare, etc)
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	const realIP = request.headers.get('x-real-ip');
	if (realIP) {
		return realIP;
	}

	// Fallback (tidak reliable di production dengan proxy)
	return 'unknown';
}

/**
 * Helper untuk format rate limit error message
 */
export function getRateLimitErrorMessage(result: RateLimitResult): string {
	const minutes = Math.ceil((result.retryAfter || 0) / 60);
	if (minutes > 1) {
		return `Terlalu banyak request. Coba lagi dalam ${minutes} menit.`;
	}
	return `Terlalu banyak request. Coba lagi dalam ${result.retryAfter} detik.`;
}
