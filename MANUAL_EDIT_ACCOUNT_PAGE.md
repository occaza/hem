# Manual Edit - Account Page Product Display

## File: `src/routes/(user)/account/+page.svelte`

Maaf, file ini terus corrupt saat saya edit otomatis. Tolong edit manual dengan perubahan berikut:

## Lokasi: Line 185-191

**Cari bagian ini:**
```svelte
<div>
    <div class="font-semibold text-base">{order.product?.[0]?.name || 'Produk'}</div>
    <div class="text-sm text-base-content/60 flex items-center gap-2">
        <Clock size={12} />
        {formatDate(order.created_at)}
    </div>
</div>
```

**Ganti dengan:**
```svelte
<div>
    <div class="font-semibold text-base">{order.product?.[0]?.name || 'Produk'}</div>
    <div class="text-sm text-base-content/60 flex items-center gap-2">
        {#if order.product && order.product.length > 1}
            <span class="text-primary font-medium">+{order.product.length - 1} produk lainnya</span>
            <span class="text-base-content/40">•</span>
        {/if}
        <Clock size={12} />
        {formatDate(order.created_at)}
    </div>
</div>
```

## Hasil
Jika ada order dengan 5 produk, akan tampil:
- **Panduan SvelteKit**
- **+4 produk lainnya** • 23 Nov 2025

Seperti referensi Tokopedia yang Anda berikan! 🎉
