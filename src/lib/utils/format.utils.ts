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
