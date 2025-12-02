export type OrderItem = {
	product: {
		id: string;
		name: string;
		images?: string[];
		price: number;
		quantity?: number;
	} | null;
	amount: number;
	note?: string;
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
	total_payment?: number;
};
