<script lang="ts">
	import { locale, locales } from 'svelte-i18n';
	import { Globe } from '@lucide/svelte';

	const languages = [
		{ code: 'id', name: 'ID', color: 'bg-red-500' },
		{ code: 'en', name: 'EN', color: 'bg-blue-500' }
	];

	function changeLanguage(lang: string) {
		locale.set(lang);
		localStorage.setItem('locale', lang);
	}

	$: currentLanguage = languages.find((l) => l.code === $locale) || languages[0];
</script>

<div class="dropdown dropdown-end dropdown-top">
	<div
		tabindex="0"
		role="button"
		class="btn gap-2 text-neutral-content btn-ghost hover:text-primary"
	>
		<Globe size={20} />
		<span class="flex hidden items-center gap-2 sm:inline">
			<span class="badge badge-sm {currentLanguage.color} font-bold text-white"
				>{currentLanguage.name}</span
			>
		</span>
		<span class="badge badge-sm sm:hidden {currentLanguage.color} font-bold text-white"
			>{currentLanguage.name}</span
		>
	</div>
	<ul
		class="dropdown-content bg-neutral-focus menu z-[1] mb-2 w-fit rounded-box border border-neutral-content/10 p-2 shadow-lg"
	>
		{#each languages as lang}
			<li>
				<button
					class="flex items-center gap-2 text-neutral-content hover:bg-primary hover:text-primary-content"
					class:active={$locale === lang.code}
					class:bg-primary={$locale === lang.code}
					class:text-primary-content={$locale === lang.code}
					on:click={() => changeLanguage(lang.code)}
				>
					<span class="badge badge-sm {lang.color} font-bold text-white">{lang.name}</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
