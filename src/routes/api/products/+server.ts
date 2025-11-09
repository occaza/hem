// src/routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { Product } from '$lib/types/types';

export async function GET() {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		// Select ALL fields
		const { data, error } = await supabaseAdmin
			.from('products')
			.select('*') // Select semua field dulu untuk debug
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Supabase query error:', error);
			return json({ error: 'Failed to fetch products' }, { status: 500 });
		}

		console.log('✅ Products fetched:', data?.length || 0);

		// Log detail untuk debug
		if (data && data.length > 0) {
			console.log('📦 First product full data:', data[0]);
			console.log('📊 Stock value:', data[0].stock, 'Type:', typeof data[0].stock);
			console.log('🖼️ Images value:', data[0].images, 'Type:', typeof data[0].images);
		}

		return json(data as Product[]);
	} catch (err) {
		console.error('❌ Unexpected error in /api/products:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
