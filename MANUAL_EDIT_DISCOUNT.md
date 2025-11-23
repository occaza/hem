# Manual Edit Required - Discount Price Fix

## File: `src/routes/api/checkout-cart/+server.ts`

Maaf, file ini terus corrupt saat saya edit otomatis. Tolong edit manual dengan perubahan berikut:

### 1. Add import (line 4)
```typescript
import { calculateDiscountedPrice } from '$lib/utils/product.utils';
```

### 2. Update SELECT query (line 30)
**From:**
```typescript
.select('id, price, stock')
```

**To:**
```typescript
.select('id, price, stock, discount_percentage, discount_end_date')
```

### 3. Update calculatedTotal (line 50)
**From:**
```typescript
calculatedTotal += product.price * item.quantity;
```

**To:**
```typescript
calculatedTotal += calculateDiscountedPrice(product) * item.quantity;
```

### 4. Update amount in transactionInserts (line 74)
**From:**
```typescript
amount: product!.price * item.quantity,
```

**To:**
```typescript
amount: calculateDiscountedPrice(product!) * item.quantity,
```

## Why?
Ini akan menyimpan **harga setelah diskon** ke database, bukan harga asli. Jadi tampilan di `/account` akan benar.

## After Edit
Setelah edit, order baru akan menyimpan harga diskon yang benar.
