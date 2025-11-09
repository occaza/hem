// src/lib/utils/format.utils.ts

export function formatCurrency(amount: number): string {
	return `Rp${amount.toLocaleString('id-ID')}`;
}

export function formatDate(dateString: string | undefined): string {
	if (!dateString) return '-';

	return new Date(dateString).toLocaleString('id-ID', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatShortDate(dateString: string | undefined): string {
	if (!dateString) return '-';

	return new Date(dateString).toLocaleString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatDiscount(percentage: number): string {
	return `${percentage}%`;
}

export function formatStock(stock: number | undefined | null): string {
	// Handle undefined/null
	if (stock === undefined || stock === null) {
		return 'Stok tidak tersedia';
	}

	// Convert to number jika string
	const stockNum = typeof stock === 'string' ? parseInt(stock) : stock;

	// Check if valid number
	if (isNaN(stockNum)) {
		return 'Stok tidak valid';
	}

	if (stockNum === 0) return 'Stok Habis';
	if (stockNum < 10) return `Tersisa ${stockNum}`;
	if (stockNum > 999999) return 'Unlimited';
	return `${stockNum} tersedia`;
}
