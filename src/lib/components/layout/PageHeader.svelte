<script lang="ts">
	type BreadcrumbItem = {
		label: string;
		href?: string;
	};

	let { title, breadcrumbs = [] as BreadcrumbItem[] } = $props();
</script>

<div
	class="relative bg-cover bg-center py-12"
	style="background-image: url('/black-textured-background.jpg');"
>
	<div class="absolute inset-0 bg-black/50"></div>
	<div class="relative z-10 text-center">
		<h1 class="mb-2 text-4xl font-bold text-white">{title}</h1>
		{#if breadcrumbs.length > 0}
			<div class="flex justify-center text-sm text-white/90">
				{#each breadcrumbs as item, i}
					{#if i > 0}
						<span class="mx-2">/</span>
					{/if}
					{#if item.href}
						<a href={item.href} class="hover:text-primary">{item.label}</a>
					{:else}
						<span>{item.label}</span>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
