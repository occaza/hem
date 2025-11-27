// src/lib/utils/status.utils.ts

// src/lib/utils/status.utils.ts

export function getStatusBadge(status: string): string {
	const badges: Record<string, string> = {
		completed: 'badge-success',
		processing: 'badge-info', // Tambah ini
		pending: 'badge-warning',
		failed: 'badge-error',
		expired: 'badge-error', // Ubah jadi merah biar lebih jelas
		cancelled: 'badge-error' // Tambah cancelled
	};
	return badges[status] || 'badge-ghost';
}

export function getStatusText(status: string): string {
	const texts: Record<string, string> = {
		completed: 'Selesai',
		processing: 'Diproses',
		pending: 'Menunggu',
		failed: 'Gagal',
		expired: 'Kadaluarsa',
		cancelled: 'Dibatalkan' // Tambah cancelled
	};
	return texts[status] || status;
}
