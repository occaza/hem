// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';

// ✅ Lazy initializer — only runs when called (at request time)
export function getSupabaseAdmin() {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseServiceRole = import.meta.env.SUPABASE_SERVICE_ROLE;

	if (!supabaseUrl || !supabaseServiceRole) {
		throw new Error(
			'Missing Supabase environment variables. Make sure they are set in Cloudflare Pages > Environment Variables.'
		);
	}

	return createClient(supabaseUrl, supabaseServiceRole);
}
