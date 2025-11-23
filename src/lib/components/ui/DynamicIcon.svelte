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
	const IconComponent = $derived((LucideIcons as any)[name]);
</script>

{#if IconComponent}
	<IconComponent {size} class={className} />
{:else}
	<!-- Fallback jika icon tidak ditemukan -->
	<LucideIcons.Tag {size} class={className} />
{/if}
