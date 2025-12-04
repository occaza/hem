// src/lib/constants/payment.constants.ts

export const PAYMENT_METHODS = [
	{ value: 'qris', label: 'QRIS', icon: '/bank-logo/QRIS.svg' },
	{ value: 'bni_va', label: 'BNI', icon: '/bank-logo/BNI.svg' },
	{ value: 'bri_va', label: 'BRI', icon: '/bank-logo/BRI.svg' },
	{ value: 'cimb_niaga_va', label: 'CIMB Niaga', icon: '/bank-logo/CIMBN.svg' },
	{ value: 'permata_va', label: 'Permata', icon: '/bank-logo/PERMATA.svg' },
	{ value: 'sampoerna_va', label: 'Sampoerna', icon: '/bank-logo/SAMPOERNA.svg' },
	{ value: 'maybank_va', label: 'Maybank', icon: '/bank-logo/Maybank.svg' },
	{ value: 'bnc_va', label: 'BNC', icon: '/bank-logo/BNC.svg' },
	{ value: 'atm_bersama_va', label: 'ATM Bersama', icon: '/bank-logo/ATMBersama.svg' }
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]['value'];
