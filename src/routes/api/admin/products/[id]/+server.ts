// src/routes/api/admin/products/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function GET({ params }: { params: { id: string } }) {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('products')
			.select('*')
			.eq('id', params.id)
			.single();

		if (error || !data) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		return json(data);
	} catch (error) {
		console.error('Get product error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT({ params, request }: { params: { id: string }; request: Request }) {
	try {
		const body = await request.json();
		const { name, description, price } = body;

		if (!name || !description || !price) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (typeof price !== 'number' || price <= 0) {
			return json({ error: 'Invalid price' }, { status: 400 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		const { data, error } = await supabaseAdmin
			.from('products')
			.update({ name, description, price })
			.eq('id', params.id)
			.select()
			.single();

		if (error) {
			console.error('Update error:', error);
			return json({ error: 'Failed to update product' }, { status: 500 });
		}

		return json(data);
	} catch (error) {
		console.error('Update product error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE({ params }: { params: { id: string } }) {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		const { error } = await supabaseAdmin.from('products').delete().eq('id', params.id);

		if (error) {
			console.error('Delete error:', error);
			return json({ error: 'Failed to delete product' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Delete product error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
