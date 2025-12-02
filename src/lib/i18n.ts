import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

import id from './locales/id.json';
import en from './locales/en.json';

addMessages('id', id);
addMessages('en', en);

init({
	fallbackLocale: 'id',
	initialLocale: getLocaleFromNavigator() || 'id'
});
