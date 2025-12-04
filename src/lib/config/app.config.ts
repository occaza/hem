export const appConfig = {
	// App Info
	name: 'adverFI',
	description: 'Platform Belanja Digital Terpercaya',
	url: 'https://adverfi.id',
	supportEmail: 'support@adverfi.id',
	address: 'Sukoharjo, Indonesia',
	phone: '+62 816-1666-202',
	whatsapp: 'https://wa.me/6281616666202',

	// Upload Settings
	maxImageSize: 100 * 1024, // 100KB
	maxImagesPerProduct: 3,
	allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

	// Business Settings
	lowStockThreshold: 5,

	// Pagination
	defaultPageSize: 20,
	maxPageSize: 100
} as const;

export type AppConfig = typeof appConfig;
