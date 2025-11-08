// src/routes/api/debug/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// Cek environment variables
		const env = {
			VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
			SUPABASE_SERVICE_ROLE: import.meta.env.SUPABASE_SERVICE_ROLE ? '***SET***' : undefined,
			PAKASIR_SLUG: import.meta.env.PAKASIR_SLUG,
			PAKASIR_API_KEY: import.meta.env.PAKASIR_API_KEY ? '***SET***' : undefined,
			IS_PRODUCTION: import.meta.env.IS_PRODUCTION
		};

		// Cek apakah bisa import Supabase
		let supabaseStatus = 'Not tested';
		try {
			const { getSupabaseAdmin } = await import('$lib/server/supabase');
			const client = getSupabaseAdmin();
			supabaseStatus = client ? 'Client created ✅' : 'Client is null ❌';
		} catch (err) {
			supabaseStatus = `Error: ${err instanceof Error ? err.message : String(err)}`;
		}

		return json({
			status: 'Debug endpoint working',
			environment: env,
			supabase: supabaseStatus,
			nodeEnv: process.env.NODE_ENV
		});
	} catch (err) {
		return json(
			{
				error: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined
			},
			{ status: 500 }
		);
	}
};
