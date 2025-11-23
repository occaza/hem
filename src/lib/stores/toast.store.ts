import { writable } from 'svelte/store';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	const add = (message: string, type: ToastType = 'info', duration: number = 3000) => {
		const id = Math.random().toString(36).substring(2);
		const toast: Toast = { id, message, type, duration };

		update((toasts) => [...toasts, toast]);

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}
	};

	const remove = (id: string) => {
		update((toasts) => toasts.filter((t) => t.id !== id));
	};

	return {
		subscribe,
		add,
		remove,
		info: (msg: string, duration?: number) => add(msg, 'info', duration),
		success: (msg: string, duration?: number) => add(msg, 'success', duration),
		warning: (msg: string, duration?: number) => add(msg, 'warning', duration),
		error: (msg: string, duration?: number) => add(msg, 'error', duration)
	};
}

export const toast = createToastStore();
