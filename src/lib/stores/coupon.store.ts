import { writable } from 'svelte/store';
import type { AppliedCoupon } from '$lib/types/types';
import { toast } from '$lib/stores/toast.store';

function createCouponStore() {
	const { subscribe, set, update } = writable<AppliedCoupon | null>(null);

	return {
		subscribe,

		async apply(code: string, totalAmount: number, userId: string): Promise<boolean> {
			try {
				const res = await fetch('/api/coupons/apply', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ code, total_amount: totalAmount, user_id: userId })
				});

				const data = await res.json();

				if (res.ok && data.coupon) {
					set({
						coupon: data.coupon,
						discount_amount: data.discount_amount,
						final_amount: data.final_amount
					});
					toast.success('Kupon berhasil diterapkan!');
					return true;
				} else {
					toast.error(data.message || 'Kupon tidak valid');
					return false;
				}
			} catch (error) {
				console.error('Apply coupon error:', error);
				toast.error('Gagal menerapkan kupon');
				return false;
			}
		},

		remove() {
			set(null);
			toast.info('Kupon dihapus');
		},

		clear() {
			set(null);
		}
	};
}

export const appliedCoupon = createCouponStore();
