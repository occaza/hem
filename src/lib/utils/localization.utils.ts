import type { LocalizedString } from '$lib/types/types';

/**
 * Get localized text from a LocalizedString object
 * Falls back to 'id' if the requested locale is not available
 */
export function getLocalizedText(
	text: LocalizedString | string | null | undefined,
	locale: string | null | undefined = 'id'
): string {
	// Handle undefined or null
	if (!text) return '';

	// If it's already a string (for backward compatibility), return it
	if (typeof text === 'string') return text;

	// Get the localized version, fallback to 'id' if locale not found
	const lang = locale === 'en' ? 'en' : 'id';
	return text[lang] || text.id || '';
}
