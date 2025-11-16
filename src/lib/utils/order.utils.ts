// src/lib/utils/order.utils.ts

export function generateOrderId(): string {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();
	const random8 = Math.random().toString(36).substring(2, 10).toUpperCase();

	return `ADF/${dd}${mm}${yyyy}/${random8}`;
}

// Encode untuk API (ganti / dengan -)
export function encodeOrderId(orderId: string): string {
	return orderId.replace(/\//g, '-');
}

// Decode dari API (ganti - dengan /)
export function decodeOrderId(encodedOrderId: string): string {
	return encodedOrderId.replace(/-/g, '/');
}
