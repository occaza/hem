<script lang="ts">
	import { User, ShoppingBag, Lock, LogOut } from '@lucide/svelte';
	import { authUser } from '$lib/stores/auth.store';
	import { pushState } from '$app/navigation';
	import { t } from 'svelte-i18n';

	let { activeTab = $bindable() } = $props();

	// Use a derived or function if reactivity is needed, but for static list simpler is fine
	// or use $t directly in template if we iterate over ids
	const menuItems = [
		{ id: 'personal', label: 'account.menu.personal', icon: User, href: '/account' },
		{ id: 'orders', label: 'account.menu.orders', icon: ShoppingBag, href: '/account?tab=orders' },
		{ id: 'password', label: 'account.menu.password', icon: Lock, href: '/account?tab=password' },
		{ id: 'logout', label: 'account.menu.logout', icon: LogOut, href: '/logout', action: true }
	];
</script>

<div class="card overflow-hidden bg-base-100 shadow-xl">
	<div class="p-2">
		{#each menuItems as item}
			{#if item.action}
				<button
					onclick={async () => {
						await fetch('/logout', { method: 'POST' });
						await authUser.signOut();
						window.location.href = '/login';
					}}
					class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-error transition-colors hover:bg-base-200"
				>
					<item.icon size={20} />
					{$t(item.label)}
				</button>
			{:else}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors
					{activeTab === item.id
						? 'bg-primary text-primary-content shadow-md'
						: 'text-base-content/70 hover:bg-base-200'}"
					onclick={(e) => {
						if (item.href.startsWith('/account')) {
							e.preventDefault();
							const urlParams = new URLSearchParams(item.href.split('?')[1]);
							activeTab = urlParams.get('tab') || 'personal';
							// Update URL without reload
							pushState(item.href, {});
						}
					}}
				>
					<item.icon size={20} />
					{$t(item.label)}
				</a>
			{/if}
		{/each}
	</div>
</div>
