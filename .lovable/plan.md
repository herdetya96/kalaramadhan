
# Fitur Import & Export Data di Setelan

## Ringkasan
Menambahkan dua menu baru di halaman Setelan: **Export Data** dan **Import Data**, untuk backup dan restore seluruh data ibadah (sholat, sunnah, lokasi, progress Quran, dll) dalam format file JSON.

## Yang Akan Dibuat

### Export Data
- Kumpulkan semua data dari localStorage yang berprefix `kala_data_`, `kala_quran_*`, `kala-user-location`, `kala-user-coords`
- Bungkus dalam satu objek JSON dengan metadata (tanggal export, versi app)
- Download otomatis sebagai file `kala-backup-YYYY-MM-DD.json`
- Tampilkan toast sukses

### Import Data
- Klik menu Import membuka file picker (accept `.json`)
- Validasi format file: cek apakah ada key yang dikenali (`version`, `exportDate`, `data`)
- Tampilkan dialog konfirmasi: "Data saat ini akan ditimpa. Lanjutkan?"
- Tulis semua data ke localStorage, lalu reload halaman
- Tampilkan toast sukses/error

### UI
Dua item menu baru di halaman Setelan dengan style yang sama seperti menu yang sudah ada:
- Icon `Download` untuk Export Data
- Icon `Upload` untuk Import Data
- Ditempatkan sebelum "Tentang Kala"

## Detail Teknis

### File yang diubah
| File | Perubahan |
|------|-----------|
| `src/pages/SettingsPage.tsx` | Tambah menu Export & Import, handler logic, hidden file input, dialog konfirmasi |

### Struktur File Backup (JSON)
```text
{
  "version": "1.0",
  "exportDate": "2026-02-21T...",
  "appName": "Kala",
  "data": {
    "dailyData": { "2026-02-18": {...}, "2026-02-19": {...} },
    "quranProgress": {...},
    "quranBookmarks": [...],
    "quranKhatam": {...},
    "location": "Jakarta, DKI Jakarta",
    "coords": { "lat": -6.2, "lon": 106.8 }
  }
}
```

### Validasi Import
- Cek `version` dan `appName` ada di file
- Jika format tidak valid, tampilkan toast error "Format file tidak valid"
- Konfirmasi user sebelum overwrite via Alert Dialog
