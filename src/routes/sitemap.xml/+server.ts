import { getSupabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const supabaseAdmin = getSupabaseAdmin();

		// Fetch all active products
		const { data: products, error } = await supabaseAdmin
			.from('products')
			.select('slug, created_at')
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching products for sitemap:', error);
		}

		// Get current date in ISO format
		const now = new Date().toISOString().split('T')[0];

		// Build sitemap XML
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<!-- Homepage -->
	<url>
		<loc>https://jualfb.vercel.app/</loc>
		<lastmod>${now}</lastmod>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>
	
	<!-- Shop Page -->
	<url>
		<loc>https://jualfb.vercel.app/shop</loc>
		<lastmod>${now}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.9</priority>
	</url>
	
	<!-- Login Page -->
	<url>
		<loc>https://jualfb.vercel.app/login</loc>
		<lastmod>${now}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
	
	<!-- Register Page -->
	<url>
		<loc>https://jualfb.vercel.app/register</loc>
		<lastmod>${now}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
	
	<!-- Product Pages -->
	${
		products
			? products
					.map((product: { slug: string; created_at: string | null }) => {
						const lastmod = product.created_at
							? new Date(product.created_at).toISOString().split('T')[0]
							: now;
						return `	<url>
		<loc>https://jualfb.vercel.app/shop/${product.slug}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
	</url>`;
					})
					.join('\n')
			: ''
	}
</urlset>`;

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Sitemap generation error:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
};
