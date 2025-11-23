# Manual Edit - Account Page Modal Fix

## File: `src/routes/(user)/account/+page.svelte`

### 1. Import OrderDetailModal (Line 2)

**Tambahkan setelah import Navbar:**

```svelte
import Navbar from '$lib/components/layout/Navbar.svelte'; import OrderDetailModal from
'$lib/components/features/orders/OrderDetailModal.svelte';
```

### 2. Tambah Modal State (Line 9, setelah firstName)

**Tambahkan:**

```svelte
const firstName = $derived(data.user.full_name?.split(' ')[0] || 'User');

// Modal state
let selectedOrder = $state<any>(null);
let isModalOpen = $state(false);

function openOrderDetail(order: any) {
    selectedOrder = order;
    isModalOpen = true;
}

function closeModal() {
    isModalOpen = false;
    setTimeout(() => selectedOrder = null, 300);
}
```

### 3. Ganti `<a href>` dengan `<button onclick>` (Line 205-208)

**Cari:**

```svelte
<a
    href={getOrderLink(order)}
    class="order-item flex items-center justify-between rounded-xl border border-base-300 bg-gradient-to-r from-base-200 to-base-100 p-4 hover:border-primary hover:shadow-lg"
>
```

**Ganti dengan:**

```svelte
<button
    onclick={() => openOrderDetail(order)}
    class="order-item flex items-center justify-between rounded-xl border border-base-300 bg-gradient-to-r from-base-200 to-base-100 p-4 hover:border-primary hover:shadow-lg w-full text-left cursor-pointer"
>
```

### 4. Ganti closing tag `</a>` dengan `</button>` (Line 240)

**Cari:**

```svelte
                    </div>
                </a>
            {/each}
```

**Ganti dengan:**

```svelte
                    </div>
                </button>
            {/each}
```

### 5. Tambah Modal Component di akhir file (sebelum closing tag terakhir)

**Tambahkan sebelum `</div>` terakhir:**

```svelte
<!-- Order Detail Modal -->
{#if selectedOrder}
	<OrderDetailModal order={selectedOrder} isOpen={isModalOpen} onClose={closeModal} />
{/if}
```

## Hasil

Setelah edit, klik order card akan membuka modal detail transaksi, bukan redirect ke halaman payment! ✅
