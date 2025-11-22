import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/server/auth';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = await getUser(cookies);

	if (!user) {
		throw redirect(303, '/login');
	}

	// Get full profile data
	const supabase = getSupabaseAdmin();
	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, avatar_url')
		.eq('id', user.id)
		.single();

	return {
		user: {
			id: user.id,
			email: user.email,
			full_name: profile?.full_name || '',
			avatar_url: profile?.avatar_url || '',
			role: user.role
		}
	};
};
