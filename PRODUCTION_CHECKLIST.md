# Checklist Production - JualAkunFB

Checklist lengkap sebelum deploy ke production dengan real payment PAKASIR.

## 1. Environment Setup

### PAKASIR Dashboard

- [ ] Login ke dashboard PAKASIR: https://app.pakasir.com
- [ ] Buat atau pilih Proyek untuk production
- [ ] Catat `Slug` proyek
- [ ] Catat `API Key` proyek
- [ ] Set **Webhook URL** di proyek: `https://yourdomain.com/api/webhook`
- [ ] Pastikan proyek sudah dalam mode **Production** (bukan Sandbox)

### Environment Variables

- [ ] Copy `.env.example` ke `.env`
- [ ] Set `PAKASIR_SLUG` dengan slug production
- [ ] Set `PAKASIR_API_KEY` dengan API key production
- [ ] Set `IS_PRODUCTION=true` untuk production
- [ ] Verify semua Supabase credentials sudah benar
- [ ] **PENTING**: Jangan commit file `.env` ke git

### Database

- [ ] Pastikan database production sudah ready
- [ ] Verify tabel `transactions` sudah ada
- [ ] Verify tabel `transaction_notes` sudah ada
- [ ] Verify tabel `products` sudah terisi
- [ ] Test koneksi database dari aplikasi

## 2. Code Quality

### Build & Test

- [ ] Run `npm run build` - harus sukses tanpa error
- [ ] Run `npm run dev` - pastikan aplikasi jalan normal
- [ ] Check TypeScript errors: tidak ada error
- [ ] Check console logs: tidak ada error kritis

### Code Review

- [ ] Review semua perubahan di `webhook/+server.ts`
- [ ] Review semua perubahan di `pakasir.ts`
- [ ] Pastikan tidak ada hardcoded credentials
- [ ] Pastikan tidak ada TODO/FIXME yang kritis

## 3. Testing di Sandbox

Sebelum production, test dulu dengan mode sandbox:

### Setup Sandbox

- [ ] Set `IS_PRODUCTION=false` di `.env`
- [ ] Gunakan credentials PAKASIR sandbox
- [ ] Restart aplikasi

### Test Payment Flow

- [ ] Test checkout dengan QRIS
- [ ] Test checkout dengan Virtual Account (pilih salah satu)
- [ ] Test checkout dengan Retail
- [ ] Verify payment number/QR code muncul dengan benar
- [ ] Test payment simulation (tombol "Simulasi Pembayaran")
- [ ] Verify webhook diterima (check console logs)
- [ ] Verify status berubah dari `pending` → `processing`
- [ ] Verify data di database sesuai

### Test Edge Cases

- [ ] Test dengan amount yang sangat kecil (misal: 10000)
- [ ] Test dengan amount yang besar (misal: 1000000)
- [ ] Test duplicate order_id (harus ditolak)
- [ ] Test webhook dengan amount yang salah (harus ditolak)
- [ ] Test webhook untuk transaksi yang tidak ada (harus ditolak)

## 4. Production Deployment

### Pre-Deployment

- [ ] Backup database production
- [ ] Set `IS_PRODUCTION=true` di `.env`
- [ ] Verify webhook URL sudah benar di PAKASIR dashboard
- [ ] Notify team bahwa akan deploy

### Deployment

- [ ] Deploy aplikasi ke production server
- [ ] Verify aplikasi bisa diakses
- [ ] Check logs untuk errors
- [ ] Test homepage bisa dibuka
- [ ] Test login/register berfungsi

### Post-Deployment Testing

- [ ] Test checkout dengan amount kecil (misal: 10000)
- [ ] **PENTING**: Lakukan pembayaran real untuk testing
- [ ] Verify webhook diterima (check server logs)
- [ ] Verify status transaksi berubah dengan benar
- [ ] Verify data tersimpan di database
- [ ] Test notifikasi ke user (jika ada)

## 5. Monitoring

### Setup Monitoring

- [ ] Setup log monitoring (misal: Sentry, LogRocket)
- [ ] Setup uptime monitoring (misal: UptimeRobot)
- [ ] Setup error alerting
- [ ] Dokumentasikan cara akses logs production

### What to Monitor

- [ ] Error rate di webhook endpoint
- [ ] Failed payment transactions
- [ ] PAKASIR API errors
- [ ] Database connection errors
- [ ] Response time API endpoints

## 6. Documentation

- [ ] Update README.md dengan instruksi deployment
- [ ] Dokumentasikan webhook URL yang digunakan
- [ ] Dokumentasikan payment methods yang aktif
- [ ] Buat runbook untuk troubleshooting
- [ ] Dokumentasikan rollback procedure

## 7. Rollback Plan

Jika ada masalah setelah deployment:

- [ ] Cara rollback ke versi sebelumnya
- [ ] Cara disable payment sementara
- [ ] Cara switch kembali ke sandbox mode
- [ ] Contact person untuk support PAKASIR

## 8. Security Checklist

- [ ] Webhook validation sudah aktif
- [ ] API keys tidak ter-expose di frontend
- [ ] Database credentials aman
- [ ] HTTPS sudah aktif di production
- [ ] CORS settings sudah benar

## Notes

**Penting untuk diingat:**

1. Selalu test di sandbox dulu sebelum production
2. Monitor logs dengan ketat setelah deployment
3. Siapkan rollback plan jika ada masalah
4. Jangan panik jika ada error, check logs dulu
5. PAKASIR support: cek dokumentasi atau contact support mereka

**Kontak Darurat:**

- PAKASIR Support: [isi contact support]
- Database Admin: [isi contact]
- DevOps Team: [isi contact]
