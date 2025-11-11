// src/lib/utils/slug.utils.ts

export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Hapus karakter spesial
		.replace(/[\s_-]+/g, '-') // Ganti spasi/underscore dengan dash
		.replace(/^-+|-+$/g, ''); // Hapus dash di awal/akhir
}

export function generateUniqueSlug(name: string, id: string): string {
	const baseSlug = generateSlug(name);
	const shortId = id.slice(-8); // Ambil 8 karakter terakhir ID
	return `${baseSlug}-${shortId}`;
}

// Extract ID dari slug
export function extractIdFromSlug(slug: string): string | null {
	const parts = slug.split('-');
	if (parts.length < 2) return null;

	// ID ada di bagian akhir setelah dash terakhir
	const possibleId = parts[parts.length - 1];

	// Validasi apakah ini ID yang valid (8 karakter alphanumeric)
	if (possibleId && possibleId.length === 8) {
		return possibleId;
	}

	return null;
}
