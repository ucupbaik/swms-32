# SWMS Web (Functional Demo)

Ini adalah versi **web SWMS** yang sudah diperbaiki agar tombol **Tambah / Edit / Simpan / Hapus** berfungsi dan data tersimpan di **LocalStorage** (per-browser).

> Catatan penting: untuk multi-user realtime (semua orang melihat data yang sama) Anda tetap butuh backend + database. Versi ini sengaja dibuat mudah dan langsung jalan.

## 1) Jalankan di Laptop/PC (Local)

**Syarat:** Node.js 18+ dan internet untuk install dependencies.

```bash
cd swms-web-functional
npm install
npm run dev
```

Buka: `http://localhost:5173`

### Akun demo
- Admin: `admin@swms.com` / `SWMS1234`
- Petugas: `petugas@swms.com` / `SWMS1234`
- Pelihat: daftar mandiri di halaman login.

## 2) Deploy Gratis (Frontend)

### Opsi A — Vercel
1. Push project ke GitHub.
2. Vercel → Import Project → pilih repo.
3. Framework: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`

### Opsi B — Netlify
1. Push repo ke GitHub.
2. Netlify → Add new site → Import.
3. Build: `npm run build`
4. Publish directory: `dist`

## 3) Data Tidak Hilang
- Data tersimpan di LocalStorage browser.
- Kalau pindah device/ browser, data tidak ikut.

## 4) Lanjut ke Backend (Opsional)
Jika Anda ingin saya buatkan versi **Node.js + Express + MongoDB** (Atlas) dengan role (admin/petugas/pelihat) dan realtime MQTT, upload project Anda dalam format **.zip** (bukan .rar) supaya saya bisa patch langsung.

