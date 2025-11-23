import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { requireRole } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// GET - List all categories (admin)
export const GET: RequestHandler = async ({ cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('categories')
			.select('*')
			.order('display_order', { ascending: true });

		if (error) {
			console.error('Fetch categories error:', error);
			return json({ error: 'Failed to fetch categories' }, { status: 500 });
		}

		return json(data || []);
	} catch (error) {
		console.error('Get categories error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// POST - Create new category
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const body = await request.json();
		const { name, slug, icon, description, display_order } = body;

		if (!name || !slug) {
			return json({ error: 'Name and slug are required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// Generate ID
		const id = `CAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const { data, error } = await supabaseAdmin
			.from('categories')
			.insert({
				id,
				name: name.trim(),
				slug: slug.trim().toLowerCase(),
				icon: icon?.trim() || null,
				description: description?.trim() || null,
				display_order: display_order !== undefined ? parseInt(display_order.toString()) : 0,
				is_active: true
			})
			.select()
			.single();

		if (error) {
			console.error('Create category error:', error);
			if (error.code === '23505') {
				return json({ error: 'Category name or slug already exists' }, { status: 400 });
			}
			return json({ error: 'Failed to create category' }, { status: 500 });
		}

		return json(data, { status: 201 });
	} catch (error) {
		console.error('Create category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
