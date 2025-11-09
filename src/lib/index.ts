// src/lib/index.ts

// Assets
export { default as favicon } from './assets/favicon.svg';

// Client
export * from './client/supabase';

// Components
export { default as PaymentModal } from './components/payment/PaymentModal.svelte';
export { default as MethodSelectorModal } from './components/payment/MethodSelectorModal.svelte';

// Products
export { default as ProductCard } from './components/products/ProductCard.svelte';

// Server
export * from './server/auth';
export * from './server/pakasir';
export * from './server/supabase';

// Types
export * from './types/types';

// Utils
// export * from './utils';
