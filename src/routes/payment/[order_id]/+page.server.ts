import { IS_PRODUCTION } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		isProduction: IS_PRODUCTION === 'true'
	};
};
