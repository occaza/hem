// src/lib/utils/status.utils.ts

export function getStatusBadge(status: string): string {
	const badges: Record<string, string> = {
		completed: 'badge-success',
		pending: 'badge-warning',
		failed: 'badge-error',
		expired: 'badge-ghost'
	};
	return badges[status] || 'badge-ghost';
}

export function getStatusText(status: string): string {
	const texts: Record<string, string> = {
		completed: 'Selesai',
		pending: 'Menunggu',
		failed: 'Gagal',
		expired: 'Kadaluarsa'
	};
	return texts[status] || status;
}
