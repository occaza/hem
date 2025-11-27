// src/lib/constants/payment.constants.ts

export const PAYMENT_METHODS = [
	{ value: 'qris', label: 'QRIS (Semua E-Wallet & Bank)', icon: '📱' },
	{ value: 'bni_va', label: 'Virtual Account BNI', icon: '🏦' },
	{ value: 'bri_va', label: 'Virtual Account BRI', icon: '🏦' },
	{ value: 'cimb_niaga_va', label: 'Virtual Account CIMB Niaga', icon: '🏦' },
	{ value: 'permata_va', label: 'Virtual Account Permata', icon: '🏦' },
	{ value: 'sampoerna_va', label: 'Virtual Account Sampoerna', icon: '🏦' },
	{ value: 'maybank_va', label: 'Virtual Account Maybank', icon: '🏦' },
	{ value: 'bnc_va', label: 'Virtual Account BNC', icon: '🏦' },
	{ value: 'atm_bersama_va', label: 'Virtual Account ATM Bersama', icon: '🏦' },
	{ value: 'artha_graha_va', label: 'Virtual Account Artha Graha', icon: '🏦' }
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]['value'];
