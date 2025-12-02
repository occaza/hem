<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { formatCurrency } from '$lib/utils/format.utils';
	import {
		DollarSign,
		Package,
		CreditCard,
		CircleCheck,
		Clock,
		TriangleAlert,
		PackageCheck,
		TrendingUp,
		ShoppingCart,
		Users
	} from '@lucide/svelte';

	let stats = $state({
		totalProducts: 0,
		totalTransactions: 0,
		completedTransactions: 0,
		processingTransactions: 0,
		pendingTransactions: 0,
		totalRevenue: 0
	});

	type LowStockProduct = {
		id: string;
		name: string;
		stock: number;
	};

	let lowStockProducts = $state<LowStockProduct[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const [statsRes, lowStockRes] = await Promise.all([
				fetch('/api/admin/stats'),
				fetch('/api/admin/low-stock')
			]);

			const statsData = await statsRes.json();
			stats = statsData;

			if (lowStockRes.ok) {
				const lowStockData = await lowStockRes.json();
				lowStockProducts = lowStockData;
			}
		} catch (error) {
			console.error('Failed to fetch stats:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Dashboard - adverFI</title>
</svelte:head>

<div class="space-y-8">
	<!-- Welcome Header -->
	<div>
		<h1 class="mb-2 text-3xl font-bold">Dashboard</h1>
		<p class="text-base-content/70">Selamat datang kembali! Berikut ringkasan bisnis Anda.</p>
	</div>

	{#if loading}
		<div class="flex min-h-[400px] items-center justify-center">
			<span class="loading loading-lg loading-spinner text-primary"></span>
		</div>
	{:else}
		<!-- Stats Cards Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" in:fade={{ duration: 400 }}>
			<!-- Revenue Card -->
			<div
				class="group card overflow-hidden border border-success/20 bg-gradient-to-br from-success/10 via-success/5 to-transparent shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				in:fly={{ y: 20, duration: 400, delay: 0 }}
			>
				<div class="card-body">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-base-content/70">Total Pendapatan</p>
							<h3 class="mb-1 text-3xl font-bold text-success">
								{formatCurrency(stats.totalRevenue)}
							</h3>
							<p class="text-xs text-base-content/60">Dari transaksi selesai</p>
						</div>
						<div
							class="rounded-xl bg-gradient-to-br from-success to-success/70 p-3 shadow-lg transition-transform duration-300 group-hover:scale-110"
						>
							<DollarSign size={24} class="text-white" />
						</div>
					</div>
				</div>
			</div>

			<!-- Total Products Card -->
			<div
				class="group card overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				in:fly={{ y: 20, duration: 400, delay: 100 }}
			>
				<div class="card-body">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-base-content/70">Total Produk</p>
							<h3 class="mb-1 text-3xl font-bold text-primary">{stats.totalProducts}</h3>
							<p class="text-xs text-base-content/60">Produk aktif</p>
						</div>
						<div
							class="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-3 shadow-lg transition-transform duration-300 group-hover:scale-110"
						>
							<Package size={24} class="text-white" />
						</div>
					</div>
				</div>
			</div>

			<!-- Total Transactions Card -->
			<div
				class="group card overflow-hidden border border-secondary/20 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				in:fly={{ y: 20, duration: 400, delay: 200 }}
			>
				<div class="card-body">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-base-content/70">Total Transaksi</p>
							<h3 class="mb-1 text-3xl font-bold text-secondary">{stats.totalTransactions}</h3>
							<p class="text-xs text-base-content/60">Semua order</p>
						</div>
						<div
							class="rounded-xl bg-gradient-to-br from-secondary to-secondary/70 p-3 shadow-lg transition-transform duration-300 group-hover:scale-110"
						>
							<CreditCard size={24} class="text-white" />
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Transaction Status Cards -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3" in:fade={{ duration: 400, delay: 300 }}>
			<!-- Completed -->
			<div
				class="card border border-base-300 bg-base-100 shadow-md transition-all duration-300 hover:shadow-lg"
				in:fly={{ y: 20, duration: 400, delay: 300 }}
			>
				<div class="card-body">
					<div class="flex items-center justify-between">
						<div>
							<div class="mb-1 flex items-center gap-2">
								<CircleCheck size={18} class="text-success" />
								<p class="text-sm font-medium text-base-content/70">Selesai</p>
							</div>
							<h4 class="text-2xl font-bold">{stats.completedTransactions}</h4>
						</div>
						<div class="radial-progress text-success" style="--value:100; --size:3rem;">
							<CircleCheck size={16} />
						</div>
					</div>
				</div>
			</div>

			<!-- Processing -->
			<div
				class="card border border-base-300 bg-base-100 shadow-md transition-all duration-300 hover:shadow-lg"
				in:fly={{ y: 20, duration: 400, delay: 350 }}
			>
				<div class="card-body">
					<div class="flex items-center justify-between">
						<div>
							<div class="mb-1 flex items-center gap-2">
								<PackageCheck size={18} class="text-info" />
								<p class="text-sm font-medium text-base-content/70">Diproses</p>
							</div>
							<h4 class="text-2xl font-bold">{stats.processingTransactions}</h4>
						</div>
						{#if stats.processingTransactions > 0}
							<div class="badge gap-1 badge-info">
								<span class="font-semibold">Perlu tindakan</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Pending -->
			<div
				class="card border border-base-300 bg-base-100 shadow-md transition-all duration-300 hover:shadow-lg"
				in:fly={{ y: 20, duration: 400, delay: 400 }}
			>
				<div class="card-body">
					<div class="flex items-center justify-between">
						<div>
							<div class="mb-1 flex items-center gap-2">
								<Clock size={18} class="text-warning" />
								<p class="text-sm font-medium text-base-content/70">Pending</p>
							</div>
							<h4 class="text-2xl font-bold">{stats.pendingTransactions}</h4>
						</div>
						<div class="loading loading-md loading-ring text-warning"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions & Low Stock -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2" in:fade={{ duration: 400, delay: 450 }}>
			<!-- Quick Actions -->
			<div
				class="card border border-base-300 bg-base-100 shadow-xl"
				in:fly={{ x: -20, duration: 400, delay: 500 }}
			>
				<div class="card-body">
					<h2 class="mb-4 card-title">Quick Actions</h2>
					<div class="space-y-3">
						<a
							href="/products/add-new"
							class="group flex items-center gap-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-4 transition-all hover:border-primary/40 hover:shadow-md"
						>
							<div class="rounded-lg bg-primary/20 p-2 transition-colors group-hover:bg-primary">
								<Package size={20} class="transition-colors group-hover:text-white" />
							</div>
							<div class="flex-1">
								<p class="font-semibold">Tambah Produk Baru</p>
								<p class="text-xs text-base-content/60">Buat listing produk baru</p>
							</div>
							<TrendingUp
								size={16}
								class="text-base-content/40 transition-transform group-hover:translate-x-1"
							/>
						</a>

						<a
							href="/transaction"
							class="group flex items-center gap-4 rounded-lg border border-secondary/20 bg-gradient-to-r from-secondary/10 to-transparent p-4 transition-all hover:border-secondary/40 hover:shadow-md"
						>
							<div
								class="rounded-lg bg-secondary/20 p-2 transition-colors group-hover:bg-secondary"
							>
								<CreditCard size={20} class="transition-colors group-hover:text-white" />
							</div>
							<div class="flex-1">
								<p class="font-semibold">Lihat Semua Transaksi</p>
								<p class="text-xs text-base-content/60">Kelola order dan pembayaran</p>
							</div>
							<TrendingUp
								size={16}
								class="text-base-content/40 transition-transform group-hover:translate-x-1"
							/>
						</a>

						{#if stats.processingTransactions > 0}
							<a
								href="/orders-processing"
								class="group flex items-center gap-4 rounded-lg border border-info/20 bg-gradient-to-r from-info/10 to-transparent p-4 transition-all hover:border-info/40 hover:shadow-md"
							>
								<div class="rounded-lg bg-info/20 p-2 transition-colors group-hover:bg-info">
									<PackageCheck size={20} class="transition-colors group-hover:text-white" />
								</div>
								<div class="flex-1">
									<p class="font-semibold">Proses Pesanan</p>
									<p class="text-xs text-base-content/60">
										{stats.processingTransactions} pesanan menunggu
									</p>
								</div>
								<div class="badge badge-info">{stats.processingTransactions}</div>
							</a>
						{/if}
					</div>
				</div>
			</div>

			<!-- Low Stock Alerts -->
			<div
				class="card border border-base-300 bg-base-100 shadow-xl"
				in:fly={{ x: 20, duration: 400, delay: 500 }}
			>
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2">
						<TriangleAlert size={20} class="text-warning" />
						Stok Menipis
					</h2>

					{#if lowStockProducts.length > 0}
						<div class="space-y-3">
							{#each lowStockProducts.slice(0, 4) as product, i}
								<div
									class="flex items-center gap-3 rounded-lg bg-base-200/50 p-3 transition-all hover:bg-base-200"
									in:fly={{ x: 20, duration: 300, delay: 550 + i * 50 }}
								>
									<div class="flex-1">
										<p class="font-semibold">{product.name}</p>
										<div class="mt-1 flex items-center gap-2">
											<div class="flex-1">
												<progress
													class="progress {product.stock <= 5
														? 'progress-error'
														: 'progress-warning'} h-2"
													value={product.stock}
													max="20"
												></progress>
											</div>
											<span class="text-xs font-medium text-base-content/70">
												{product.stock} unit
											</span>
										</div>
									</div>
									<a href="/products/{product.id}" class="btn btn-ghost btn-sm">Edit</a>
								</div>
							{/each}
							{#if lowStockProducts.length > 4}
								<a href="/products" class="btn btn-block btn-ghost btn-sm">
									Lihat {lowStockProducts.length - 4} produk lainnya
								</a>
							{/if}
						</div>
					{:else}
						<div class="alert alert-success">
							<CircleCheck size={20} />
							<span>Semua produk stoknya aman!</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
