# Deployment Guide - JualAkunFB

Panduan lengkap untuk deploy aplikasi JualAkunFB ke production dengan real payment gateway PAKASIR.

## Prerequisites

- Akun PAKASIR dengan proyek yang sudah disetup
- Server production yang sudah ready (VPS, Vercel, Netlify, dll)
- Database Supabase production
- Domain yang sudah pointing ke server

## Step 1: Setup PAKASIR Dashboard

1. **Login ke PAKASIR**
   - Buka https://app.pakasir.com
   - Login dengan akun Anda

2. **Buat/Pilih Proyek**
   - Jika belum ada, buat proyek baru untuk production
   - Catat `Slug` dan `API Key` dari proyek

3. **Set Webhook URL**
   - Masuk ke halaman Edit Proyek
   - Isi **Webhook URL** dengan: `https://yourdomain.com/api/webhook`
   - Ganti `yourdomain.com` dengan domain production Anda
   - Save perubahan

4. **Pastikan Mode Production**
   - Pastikan proyek dalam mode **Production** (bukan Sandbox)
   - Mode Sandbox hanya untuk testing

## Step 2: Setup Environment Variables

1. **Copy template environment**

   ```bash
   cp .env.example .env
   ```

2. **Edit file `.env`**

   ```env
   # PAKASIR Configuration
   PAKASIR_SLUG=your-production-slug
   PAKASIR_API_KEY=your-production-api-key
   IS_PRODUCTION=true

   # Supabase Configuration
   PUBLIC_SUPABASE_URL=your-supabase-url
   PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Verify credentials**
   - Double check semua credentials sudah benar
   - Pastikan tidak ada typo

## Step 3: Testing di Sandbox (Recommended)

Sebelum deploy ke production, sangat disarankan untuk test dulu di sandbox:

1. **Setup Sandbox**

   ```env
   IS_PRODUCTION=false
   PAKASIR_SLUG=your-sandbox-slug
   PAKASIR_API_KEY=your-sandbox-api-key
   ```

2. **Run aplikasi**

   ```bash
   npm run dev
   ```

3. **Test payment flow**
   - Buat order baru
   - Pilih metode pembayaran (QRIS/VA/Retail)
   - Klik "Simulasi Pembayaran" untuk test webhook
   - Verify status berubah dari `pending` → `processing`

4. **Check logs**
   - Pastikan tidak ada error di console
   - Verify webhook logs muncul dengan benar

## Step 4: Build untuk Production

1. **Build aplikasi**

   ```bash
   npm run build
   ```

2. **Verify build sukses**
   - Pastikan tidak ada error
   - Pastikan tidak ada TypeScript errors

3. **Test production build (optional)**
   ```bash
   npm run preview
   ```

## Step 5: Deploy ke Production

### Option A: Deploy ke Vercel

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel --prod
   ```

4. **Set environment variables di Vercel Dashboard**
   - Buka project di Vercel Dashboard
   - Settings → Environment Variables
   - Tambahkan semua env vars dari `.env`

### Option B: Deploy ke VPS

1. **SSH ke server**

   ```bash
   ssh user@your-server.com
   ```

2. **Clone repository**

   ```bash
   git clone your-repo-url
   cd jualAkunFB
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Setup environment variables**

   ```bash
   nano .env
   # Paste semua env vars
   ```

5. **Build aplikasi**

   ```bash
   npm run build
   ```

6. **Run dengan PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "jualfb" -- start
   pm2 save
   pm2 startup
   ```

### Option C: Deploy ke Netlify

1. **Install Netlify CLI**

   ```bash
   npm i -g netlify-cli
   ```

2. **Login**

   ```bash
   netlify login
   ```

3. **Deploy**

   ```bash
   netlify deploy --prod
   ```

4. **Set environment variables**
   - Buka Netlify Dashboard
   - Site settings → Environment variables
   - Tambahkan semua env vars

## Step 6: Post-Deployment Verification

1. **Test aplikasi bisa diakses**
   - Buka `https://yourdomain.com`
   - Pastikan homepage muncul

2. **Test payment flow dengan amount kecil**
   - Buat order dengan amount kecil (misal: Rp 10.000)
   - Lakukan pembayaran real
   - Verify webhook diterima
   - Check logs di server

3. **Monitor logs**

   ```bash
   # Jika pakai PM2
   pm2 logs jualfb

   # Jika pakai Vercel
   vercel logs

   # Jika pakai Netlify
   netlify logs
   ```

4. **Verify database**
   - Check tabel `transactions`
   - Pastikan status berubah dengan benar

## Step 7: Monitoring Setup

1. **Setup error monitoring** (optional tapi recommended)
   - Sentry: https://sentry.io
   - LogRocket: https://logrocket.com

2. **Setup uptime monitoring**
   - UptimeRobot: https://uptimerobot.com
   - Pingdom: https://pingdom.com

3. **Setup alerts**
   - Email notification untuk errors
   - Slack/Discord webhook untuk critical errors

## Troubleshooting

### Build Error

```bash
# Clear cache dan rebuild
rm -rf .svelte-kit node_modules
npm install
npm run build
```

### Webhook tidak diterima

1. Check webhook URL di PAKASIR dashboard
2. Pastikan endpoint `/api/webhook` accessible dari internet
3. Check firewall settings
4. Check server logs untuk errors

### Payment tidak berhasil

1. Check PAKASIR credentials
2. Verify `IS_PRODUCTION=true`
3. Check logs di PAKASIR dashboard
4. Verify amount dan order_id valid

### Database connection error

1. Check Supabase credentials
2. Verify database masih aktif
3. Check network connectivity

## Rollback Procedure

Jika ada masalah serius:

1. **Rollback ke versi sebelumnya**

   ```bash
   # Jika pakai git
   git checkout previous-stable-tag
   npm run build
   pm2 restart jualfb
   ```

2. **Disable payment sementara**
   - Set `IS_PRODUCTION=false` untuk switch ke sandbox
   - Atau tambahkan maintenance mode

3. **Contact support**
   - PAKASIR support jika masalah di payment gateway
   - Hosting support jika masalah di server

## Security Best Practices

1. **Jangan expose credentials**
   - Pastikan `.env` ada di `.gitignore`
   - Jangan commit credentials ke git

2. **Use HTTPS**
   - Pastikan domain sudah pakai SSL/TLS
   - Webhook URL harus HTTPS

3. **Regular updates**
   - Update dependencies secara berkala
   - Monitor security advisories

4. **Backup database**
   - Setup automated backup
   - Test restore procedure

## Support

- **PAKASIR Documentation**: https://app.pakasir.com/docs
- **SvelteKit Documentation**: https://kit.svelte.dev
- **Supabase Documentation**: https://supabase.com/docs

## Checklist

Sebelum declare production ready, pastikan sudah:

- [ ] PAKASIR webhook URL sudah diset
- [ ] Environment variables sudah benar
- [ ] Build sukses tanpa error
- [ ] Test payment di sandbox berhasil
- [ ] Deploy ke production berhasil
- [ ] Test payment real berhasil
- [ ] Monitoring sudah setup
- [ ] Backup database sudah setup
- [ ] Team sudah di-notify

**Good luck! 🚀**
