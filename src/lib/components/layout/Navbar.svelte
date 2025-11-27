<script lang="ts">
	import { cartCount } from '$lib/stores/cart.store';
	import { authUser } from '$lib/stores/auth.store';
	import { page } from '$app/stores';
	import {
		CircleUserRound,
		House,
		ShoppingBasket,
		ShoppingCart,
		User,
		LogOut
	} from '@lucide/svelte';

	type Props = {
		showCart?: boolean;
		variant?: 'default' | 'shop' | 'cart';
	};

	let { showCart = true, variant = 'default' }: Props = $props();

	const isActive = (path: string) => $page.url.pathname === path;
	const user = $derived($authUser);
</script>

<!-- Desktop/Tablet Navbar - Hidden on mobile -->
<nav class="navbar fixed top-0 z-50 !hidden bg-base-100 shadow-md lg:!flex">
	<div class="container mx-auto flex items-center justify-between px-4">
		<a href="/" class="flex items-center gap-2 text-xl font-semibold text-primary">
			<ShoppingCart class="h-6 w-6" />
			<span class="hidden sm:inline">AdverFI</span>
		</a>

		<!-- Desktop Menu -->
		<ul class="hidden items-center gap-6 text-sm font-medium lg:flex">
			<li>
				<a
					href="/"
					class="flex items-center gap-1 rounded-md px-3 py-2 transition hover:bg-base-200"
					class:text-primary={isActive('/')}
				>
					<House class="h-4 w-4" /> Beranda
				</a>
			</li>
			<li>
				<a
					href="/shop"
					class="flex items-center gap-1 rounded-md px-3 py-2 transition hover:bg-base-200"
					class:text-primary={isActive('/shop')}
				>
					<ShoppingBasket class="h-4 w-4" /> Belanja
				</a>
			</li>
		</ul>

		<!-- Desktop Right Actions -->
		<div class="hidden items-center gap-2 lg:flex">
			{#if showCart}
				<a href="/cart" class="btn relative btn-circle btn-ghost">
					<ShoppingCart class="h-6 w-6" />
					{#if $cartCount > 0}
						<span class="absolute top-0 right-0 badge badge-sm badge-primary">{$cartCount}</span>
					{/if}
				</a>
			{/if}

			{#if user}
				<div class="dropdown dropdown-end">
					<button tabindex="0" class="btn avatar btn-circle btn-ghost">
						<div
							class="flex w-10 items-center justify-center rounded-full bg-primary text-primary-content"
						>
							<CircleUserRound class="h-6 w-6" />
						</div>
					</button>
					<ul
						class="dropdown-content menu z-[60] mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
					>
						<li class="menu-title">
							<span>{user.email}</span>
						</li>
						<li>
							<a href="/account">Dashboard</a>
						</li>
						<li>
							<a href="/my-orders">Pesanan Saya</a>
						</li>
						<li>
							<button
								onclick={async () => {
									await authUser.signOut();
									window.location.href = '/';
								}}
							>
								<LogOut class="h-4 w-4" /> Logout
							</button>
						</li>
					</ul>
				</div>
			{:else}
				<a href="/login" class="btn items-center gap-2 btn-outline btn-sm">
					<User class="h-4 w-4" /> Login
				</a>
			{/if}
		</div>

		<!-- Mobile: Only show cart and user icons -->
		<div class="flex items-center gap-2 lg:hidden">
			{#if showCart && user}
				<a href="/cart" class="btn relative btn-circle btn-ghost btn-sm">
					<ShoppingCart class="h-5 w-5" />
					{#if $cartCount > 0}
						<span class="absolute -top-1 -right-1 badge badge-xs badge-primary">{$cartCount}</span>
					{/if}
				</a>
			{/if}

			{#if user}
				<a href="/account" class="btn btn-circle btn-ghost btn-sm">
					<CircleUserRound class="h-5 w-5" />
				</a>
			{:else}
				<a href="/login" class="btn btn-circle btn-ghost btn-sm">
					<User class="h-5 w-5" />
				</a>
			{/if}
		</div>
	</div>
</nav>

<!-- Spacer for fixed navbar - Only on desktop/tablet -->
<div class="!hidden h-16 lg:!block"></div>

<!-- Mobile Bottom Dock Navigation - DaisyUI dock -->
<div
	class="dock fixed bottom-0 left-1/2 z-40 -translate-x-1/2 bg-neutral text-neutral-content lg:hidden"
>
	<button class:dock-active={isActive('/')} onclick={() => (window.location.href = '/')}>
		<House class="size-[1.2em]" />
		<span class="dock-label">Beranda</span>
	</button>

	<button class:dock-active={isActive('/shop')} onclick={() => (window.location.href = '/shop')}>
		<ShoppingBasket class="size-[1.2em]" />
		<span class="dock-label">Belanja</span>
	</button>

	<button
		class:dock-active={isActive('/cart')}
		onclick={() => (window.location.href = '/cart')}
		class="relative"
	>
		<ShoppingCart class="size-[1.2em]" />
		{#if $cartCount > 0}
			<span class="absolute -top-1 -right-1 badge badge-xs badge-primary">{$cartCount}</span>
		{/if}
		<span class="dock-label">Keranjang</span>
	</button>

	{#if user}
		<button
			class:dock-active={isActive('/account') || isActive('/profile') || isActive('/my-orders')}
			onclick={() => (window.location.href = '/account')}
		>
			<CircleUserRound class="size-[1.2em]" />
			<span class="dock-label">Akun</span>
		</button>
	{:else}
		<button
			class:dock-active={isActive('/login')}
			onclick={() => (window.location.href = '/login')}
		>
			<User class="size-[1.2em]" />
			<span class="dock-label">Login</span>
		</button>
	{/if}
</div>
