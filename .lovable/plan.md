

# Setup Kala Ramadhan sebagai PWA (Progressive Web App)

## Apa itu PWA?
PWA membuat aplikasi web bisa di-install langsung dari browser ke home screen HP, tanpa perlu App Store atau Play Store. Aplikasi akan terasa seperti app native — bisa dibuka offline, loading cepat, dan punya ikon sendiri di home screen.

## Langkah-langkah Implementasi

### 1. Install Plugin PWA
Tambah dependency `vite-plugin-pwa` untuk mengaktifkan fitur PWA di project Vite.

### 2. Konfigurasi vite.config.ts
Tambahkan plugin `VitePWA` dengan pengaturan:
- **manifest.json** otomatis (nama app, warna tema, ikon)
- **Service Worker** untuk caching dan offline support
- **navigateFallbackDenylist** untuk `/~oauth` agar tidak di-cache

### 3. Buat Ikon PWA
Tambahkan ikon app dalam ukuran 192x192 dan 512x512 pixel ke folder `public/`. Bisa menggunakan ikon sederhana dulu, nanti diganti dengan desain final.

### 4. Update index.html
Tambahkan meta tags untuk mobile optimization:
- `theme-color` (warna hijau sesuai tema app)
- `apple-mobile-web-app-capable` (untuk iOS)
- `apple-mobile-web-app-status-bar-style`

### 5. Buat Halaman /install (Opsional)
Halaman panduan install yang menjelaskan cara menambahkan app ke home screen untuk pengguna yang belum familiar.

## Cara Install oleh User
Setelah setup selesai:
- **Android**: Buka di Chrome, ketuk menu browser, pilih "Add to Home Screen"
- **iPhone**: Buka di Safari, ketuk tombol Share, pilih "Add to Home Screen"

## Detail Teknis

### File yang dibuat/diubah:
| File | Aksi |
|------|------|
| `vite.config.ts` | Tambah plugin VitePWA dengan manifest dan service worker |
| `index.html` | Tambah meta tags PWA |
| `public/pwa-192x192.png` | Ikon PWA 192px |
| `public/pwa-512x512.png` | Ikon PWA 512px |
| `src/pages/Install.tsx` | Halaman panduan install (opsional) |
| `src/App.tsx` | Tambah route `/install` |

### Contoh konfigurasi VitePWA:
```text
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Kala Ramadhan',
    short_name: 'Kala',
    theme_color: '#38CA5E',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [...]
  },
  workbox: {
    navigateFallbackDenylist: [/^\/~oauth/],
  }
})
```

