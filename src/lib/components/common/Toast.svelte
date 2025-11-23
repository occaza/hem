<script lang="ts">
	import { toast } from '$lib/stores/toast.store';
	import { fly } from 'svelte/transition';
	import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from '@lucide/svelte';
	import { flip } from 'svelte/animate';

	const icons = {
		info: Info,
		success: CheckCircle,
		warning: AlertTriangle,
		error: AlertCircle
	};

	const colors = {
		info: 'alert-info',
		success: 'alert-success',
		warning: 'alert-warning',
		error: 'alert-error'
	};
</script>

<div class="toast toast-center toast-top z-[9999] w-full max-w-md p-4 sm:toast-end sm:p-0">
	{#each $toast as t (t.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:fly={{ y: 20, duration: 300 }}
			out:fly={{ x: 100, duration: 300 }}
			class="alert {colors[t.type]} mb-2 flex items-start gap-3 shadow-lg"
		>
			<div class="mt-1 shrink-0">
				<svelte:component this={icons[t.type]} size={20} />
			</div>
			<div class="min-w-0 flex-1 break-words">
				<span>{t.message}</span>
			</div>
			<button class="btn btn-circle btn-ghost btn-xs" onclick={() => toast.remove(t.id)}>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>
