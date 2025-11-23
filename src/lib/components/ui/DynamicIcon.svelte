<script lang="ts">
	import * as LucideIcons from '@lucide/svelte';

	let {
		name,
		size = 24,
		class: className = ''
	}: {
		name: string;
		size?: number;
		class?: string;
	} = $props();

	// Get icon component dynamically - in runes mode, components are dynamic by default
	const IconComponent = $derived.by(() => {
		const icons = LucideIcons as any;
		// Try direct match
		if (icons[name]) return icons[name];

		// Try PascalCase (e.g. "info" -> "Info", "shopping-cart" -> "ShoppingCart")
		const pascalName = name
			.split(/[-_]/)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
			.join('');

		if (icons[pascalName]) return icons[pascalName];

		return null;
	});
</script>

{#if IconComponent}
	<IconComponent {size} class={className} />
{:else}
	<!-- Fallback jika icon tidak ditemukan -->
	<LucideIcons.Tag {size} class={className} />
{/if}
