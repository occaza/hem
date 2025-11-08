// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE } from '$env/static/private';

export function getSupabaseAdmin() {
	if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
		throw new Error(
			'❌ Missing Supabase credentials!\n\n' +
				'Create .env file with:\n' +
				'VITE_SUPABASE_URL=https://xxxxx.supabase.co\n' +
				'SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
		);
	}

	return createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}
