import { writable } from 'svelte/store';
import { getSupabaseClient } from '$lib/client/supabase';
import type { User } from '@supabase/supabase-js';

export const authLoading = writable(true);

function createAuthStore() {
	const { subscribe, set } = writable<User | null>(null);

	return {
		subscribe,

		async initialize() {
			const supabase = getSupabaseClient();

			const {
				data: { session }
			} = await supabase.auth.getSession();

			set(session?.user || null);
			authLoading.set(false);

			supabase.auth.onAuthStateChange((event, session) => {
				set(session?.user || null);
				authLoading.set(false);
			});
		},

		async signOut() {
			const supabase = getSupabaseClient();
			await supabase.auth.signOut();
			set(null);
		}
	};
}

export const authUser = createAuthStore();
