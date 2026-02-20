
# Kalibrasi Ulang Lokasi di Halaman Setelan

## Ringkasan
Card "Lokasi" tetap tampil sebagai card biasa (bukan button), tapi ketika di-tap akan menjalankan kalibrasi ulang GPS. Deskripsi card menampilkan lokasi terkini dan status loading saat proses kalibrasi.

## Cara Kerja
1. User tap card "Lokasi" -- proses kalibrasi GPS dimulai
2. Deskripsi card berubah menjadi "Mengkalibrasi lokasi..." dengan ikon loading berputar
3. Setelah selesai, deskripsi menampilkan lokasi baru (misal "Jakarta, DKI Jakarta")
4. Toast konfirmasi muncul: "Lokasi diperbarui: Jakarta, DKI Jakarta"
5. Jika gagal, toast error tampil

## Detail Teknis

### Perubahan di `src/pages/SettingsPage.tsx`
1. Ubah dari static arrow function menjadi komponen dengan state (`useState`, `useEffect`)
2. Tambah state `currentLocation` (dari `localStorage`) dan `isCalibrating`
3. Card "Lokasi" tetap menggunakan `<div>` (bukan `<button>`), tapi ditambah `onClick` handler dan `cursor-pointer`
4. Fungsi `handleRecalibrate`:
   - Panggil `navigator.geolocation.getCurrentPosition`
   - Reverse geocode via Nominatim API
   - Update `localStorage` (`kala-user-location` dan `kala-user-coords`)
   - Toast sukses/error via `sonner`
5. Deskripsi card Lokasi dinamis: tampilkan lokasi saat ini atau "Atur lokasi untuk waktu sholat akurat" jika belum ada
6. Saat loading, tampilkan spinner kecil (`Loader2` dari lucide-react) di samping ikon MapPin
7. Import tambahan: `useState`, `useEffect`, `Loader2`, `toast` dari sonner
