import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { requireRole } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// GET - Get single category
export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const { id } = params;
		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('categories')
			.select('*')
			.eq('id', id)
			.single();

		if (error || !data) {
			return json({ error: 'Category not found' }, { status: 404 });
		}

		return json(data);
	} catch (error) {
		console.error('Get category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// PUT - Update category
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const { id } = params;
		const body = await request.json();
		const { name, slug, icon, description, display_order, is_active } = body;

		if (!name || !slug) {
			return json({ error: 'Name and slug are required' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('categories')
			.update({
				name: name.trim(),
				slug: slug.trim().toLowerCase(),
				icon: icon?.trim() || null,
				description: description?.trim() || null,
				display_order: display_order !== undefined ? parseInt(display_order.toString()) : 0,
				is_active: is_active !== undefined ? is_active : true,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Update category error:', error);
			if (error.code === '23505') {
				return json({ error: 'Category name or slug already exists' }, { status: 400 });
			}
			return json({ error: 'Failed to update category' }, { status: 500 });
		}

		return json(data);
	} catch (error) {
		console.error('Update category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// PATCH - Partial update (e.g., toggle active)
export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const { id } = params;
		const body = await request.json();
		const supabaseAdmin = getSupabaseAdmin();

		const updateData = {
			...body,
			updated_at: new Date().toISOString()
		};

		const { data, error } = await supabaseAdmin
			.from('categories')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Patch category error:', error);
			return json({ error: 'Failed to update category' }, { status: 500 });
		}

		return json(data);
	} catch (error) {
		console.error('Patch category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// DELETE - Delete category (only if no products assigned)
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	try {
		await requireRole(cookies, ['superadmin']);

		const { id } = params;
		const supabaseAdmin = getSupabaseAdmin();

		// Check if category has products
		const { data: productCategories, error: checkError } = await supabaseAdmin
			.from('product_categories')
			.select('id')
			.eq('category_id', id)
			.limit(1);

		if (checkError) {
			console.error('Check category products error:', checkError);
			return json({ error: 'Failed to check category' }, { status: 500 });
		}

		if (productCategories && productCategories.length > 0) {
			return json(
				{ error: 'Cannot delete category with assigned products. Remove products first.' },
				{ status: 400 }
			);
		}

		const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

		if (error) {
			console.error('Delete category error:', error);
			return json({ error: 'Failed to delete category' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Delete category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
