import { json } from '@sveltejs/kit';
import { IS_PRODUCTION } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		isDevelopment: IS_PRODUCTION !== 'true'
	});
};
