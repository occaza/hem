import { TELEGRAM_BOT_TOKEN } from '$env/static/private';
import crypto from 'crypto';

interface TelegramUserData {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
	auth_date: number;
	hash: string;
}

/**
 * Verifies the authentication data received from Telegram Login Widget.
 *
 * @param data The data object received from the frontend (contains id, first_name, etc.)
 * @returns true if the data is valid and comes from Telegram, false otherwise.
 */
export function verifyTelegramAuth(data: TelegramUserData): boolean {
	if (!TELEGRAM_BOT_TOKEN) {
		console.error('TELEGRAM_BOT_TOKEN is not set');
		return false;
	}

	const { hash, ...dataToCheck } = data;

	// 1. Create a data-check-string
	// The data-check-string is a concatenation of all received fields, sorted alphabetically
	// in the format key=value, separated by a newline character ('\n').
	const checkString = Object.keys(dataToCheck)
		.sort()
		.map((key) => `${key}=${dataToCheck[key as keyof Omit<TelegramUserData, 'hash'>]}`)
		.join('\n');

	// 2. Compute the secret key
	// The secret key is the SHA256 hash of the bot token.
	const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();

	// 3. Compute the HMAC-SHA256 signature
	const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

	// 4. Compare the computed signature with the received hash
	return hmac === hash;
}
