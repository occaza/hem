import type { LocalizedString } from './types';

export type Fulfillment = {
	type: 'text' | 'file' | 'image';
	content: string;
	created_at: string;
};

export type OrderItem = {
	product: {
		id: string;
		name: LocalizedString | string;
		images?: string[];
		price: number;
		quantity?: number;
	} | null;
	amount: number;
	note?: string;
	fulfillments?: Fulfillment[];
};

export type Order = {
	order_id: string;
	status: string;
	payment_method?: string;
	completed_at?: string;
	created_at: string;
	expired_at?: string;
	items: OrderItem[];
	total: number;
	fee?: number;
	discount?: number;
	total_payment?: number;
};
