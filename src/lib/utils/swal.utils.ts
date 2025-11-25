import Swal from 'sweetalert2';

/**
 * Confirm delete action with red theme
 */
export async function confirmDelete(itemName: string = 'item'): Promise<boolean> {
	const result = await Swal.fire({
		title: 'Hapus?',
		text: `Yakin ingin menghapus ${itemName} ini?`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#ef4444',
		cancelButtonColor: '#6b7280',
		confirmButtonText: 'Ya, Hapus!',
		cancelButtonText: 'Batal',
		reverseButtons: true
	});

	return result.isConfirmed;
}

/**
 * Confirm clear cart action
 */
export async function confirmClearCart(): Promise<boolean> {
	const result = await Swal.fire({
		title: 'Hapus Semua?',
		text: 'Hapus semua item dari keranjang?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#ef4444',
		cancelButtonColor: '#6b7280',
		confirmButtonText: 'Ya, Hapus Semua!',
		cancelButtonText: 'Batal',
		reverseButtons: true
	});

	return result.isConfirmed;
}

/**
 * Confirm logout action
 */
export async function confirmLogout(): Promise<boolean> {
	const result = await Swal.fire({
		title: 'Logout?',
		text: 'Yakin ingin keluar dari akun Anda?',
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#3b82f6',
		cancelButtonColor: '#6b7280',
		confirmButtonText: 'Ya, Logout',
		cancelButtonText: 'Batal',
		reverseButtons: true
	});

	return result.isConfirmed;
}

/**
 * Generic confirmation dialog
 */
export async function confirmAction(
	message: string,
	title: string = 'Konfirmasi'
): Promise<boolean> {
	const result = await Swal.fire({
		title,
		text: message,
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#3b82f6',
		cancelButtonColor: '#6b7280',
		confirmButtonText: 'Ya',
		cancelButtonText: 'Batal',
		reverseButtons: true
	});

	return result.isConfirmed;
}

/**
 * Payment success modal with confetti animation
 */
export function successPayment(orderId: string) {
	Swal.fire({
		title: 'Pembayaran Berhasil!',
		html: `
			<div class="text-center">
				<div class="text-6xl mb-4">🎉</div>
				<p class="text-lg mb-2">Terima kasih atas pembayaran Anda!</p>
				<p class="text-sm text-gray-600">Order ID: <strong>${orderId}</strong></p>
			</div>
		`,
		icon: 'success',
		confirmButtonColor: '#10b981',
		confirmButtonText: 'OK',
		timer: 5000,
		timerProgressBar: true,
		showClass: {
			popup: 'animate__animated animate__bounceIn'
		}
	});
}
