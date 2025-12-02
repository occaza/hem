<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import AccountSidebar from '$lib/components/features/account/AccountSidebar.svelte';
	import ProfileForm from '$lib/components/features/account/ProfileForm.svelte';
	import OrderList from '$lib/components/features/account/OrderList.svelte';
	import PasswordManager from '$lib/components/features/account/PasswordManager.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import type { Order } from '$lib/types/order.types';

	let { data } = $props();
	const orders = (data.orders || []) as Order[];

	// Sidebar Navigation

	let activeTab = $state('personal');

	// Check URL params for active tab
	$effect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const tab = urlParams.get('tab');
		if (tab && ['personal', 'orders', 'password'].includes(tab)) {
			activeTab = tab;
		}
	});
</script>

<svelte:head>
	<title>My Account - AdverFI</title>
</svelte:head>

<Navbar />

<div class="min-h-screen bg-base-100 font-sans">
	<!-- Header -->
	<PageHeader
		title="My Account"
		breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Account' }]}
	/>
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto flex max-w-6xl flex-col gap-8 pb-10 lg:flex-row">
			<!-- Sidebar -->
			<div class="lg:w-1/4">
				<AccountSidebar bind:activeTab />
			</div>

			<!-- Content -->
			<div class="lg:w-3/4">
				{#if activeTab === 'personal'}
					<ProfileForm {data} />
				{:else if activeTab === 'orders'}
					<OrderList {orders} userId={data.user.id} />
				{:else if activeTab === 'password'}
					<PasswordManager />
				{/if}
			</div>
		</div>
	</div>
	<Footer />
</div>
