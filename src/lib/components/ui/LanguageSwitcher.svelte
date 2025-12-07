<script lang="ts">
	import { locale, locales } from 'svelte-i18n';
	import { Globe } from '@lucide/svelte';

	const languages = [
		{ code: 'id', name: 'ID', flag: '/flag/ID.svg' },
		{ code: 'en', name: 'EN', flag: '/flag/US.svg' }
	];

	function changeLanguage(lang: string) {
		locale.set(lang);
		localStorage.setItem('locale', lang);
	}

	let currentLanguage = $derived(languages.find((l) => l.code === $locale) || languages[0]);
</script>

<div class="dropdown dropdown-end dropdown-top">
	<div
		tabindex="0"
		role="button"
		class="btn gap-2 text-neutral-content btn-ghost hover:text-primary"
	>
		<!-- <Globe size={20} /> -->
		<span class="hidden items-center gap-2 sm:flex">
			<img
				src={currentLanguage.flag}
				alt={currentLanguage.name}
				class="h-4 w-6 rounded-sm object-cover"
			/>
		</span>
		<img
			src={currentLanguage.flag}
			alt={currentLanguage.name}
			class="h-4 w-6 rounded-sm object-cover sm:hidden"
		/>
	</div>
	<ul
		class="dropdown-content bg-neutral-focus menu z-[1] mb-2 w-fit border border-neutral-content/10 p-2 shadow-lg"
	>
		{#each languages as lang}
			<li class="w-20 pb-1">
				<button
					class="flex items-center gap-2 text-neutral-content hover:bg-primary hover:text-primary-content"
					class:active={$locale === lang.code}
					class:bg-primary={$locale === lang.code}
					class:text-primary-content={$locale === lang.code}
					onclick={() => changeLanguage(lang.code)}
				>
					<img src={lang.flag} alt={lang.name} class="h-4 w-6 rounded-sm object-cover" />
					<span class="font-medium">{lang.name}</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
