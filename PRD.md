# Kala — Product Requirements Document (PRD)

> **Versi**: 1.0  
> **Terakhir diperbarui**: 21 Februari 2026  
> **Platform**: Mobile-first Progressive Web App (PWA)  
> **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion  
> **Live URL**: https://kalaramadhan.lovable.app

---

## 1. Ringkasan Produk

**Kala** adalah aplikasi pendamping ibadah harian Muslim berbahasa Indonesia, dengan fokus utama pada bulan Ramadan. Aplikasi ini membantu pengguna melacak sholat wajib, puasa, membaca Al-Quran, menghitung zakat, dan menyediakan berbagai tools ibadah — semuanya dalam satu tempat dengan pengalaman mobile-first yang mulus.

### Visi
Menjadi teman digital Muslim Indonesia yang paling mudah digunakan untuk menjalankan ibadah sehari-hari, terutama di bulan Ramadan.

### Target Pengguna
- Muslim Indonesia (93% traffic dari Indonesia)
- Mayoritas pengguna mobile (86% dari total visitors)
- Rentang usia 18–40 tahun, tech-savvy
- Ingin tracking ibadah yang simple dan visual

---

## 2. Arsitektur Aplikasi

### 2.1 Navigasi

Aplikasi menggunakan bottom navigation bar dengan 7 tab utama:

| Tab | Path | Ikon | Deskripsi |
|-----|------|------|-----------|
| Hari Ini | `/today` | ☀️ Sun | Dashboard harian utama |
| Sholat | `/tracker` | 🤲 HandHelping | Tracker sholat wajib 5 waktu |
| Puasa | `/puasa` | 🌙 Moon | Tracker puasa Ramadan |
| Quran | `/quran` | 📖 BookOpen | Pembaca Al-Quran digital |
| Doa | `/doa` | 💛 HandHeart | Kumpulan doa harian |
| Zakat | `/tools` | 🧮 Calculator | Kalkulator zakat |
| Setelan | `/settings` | ⚙️ Settings | Pengaturan aplikasi |

### 2.2 Halaman Tambahan

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Welcome | `/welcome` | Onboarding screen (sekali tampil) |
| Progress | `/progress` | Progress bulanan sholat |
| Ramadan Info | `/tools/ramadan` | Info & jadwal Ramadan |

### 2.3 Penyimpanan Data

Seluruh data disimpan di **localStorage** (client-side only, tanpa backend):

| Key | Tipe | Deskripsi |
|-----|------|-----------|
| `kala_onboarded` | boolean | Status onboarding selesai |
| `kala_data_YYYY-MM-DD` | DayData | Data ibadah per hari |
| `kala-user-location` | string | Nama lokasi pengguna |
| `kala-user-coords` | {lat, lon} | Koordinat GPS |
| `kala-prayers-*` | PrayerSchedule[] | Cache jadwal sholat |
| `kala_quran_progress` | {lastSurah, lastAyah} | Progress baca Quran |
| `kala_quran_bookmarks` | BookmarkedAyah[] | Bookmark ayat |
| `kala_quran_khatam` | KhatamSession[] | Data program khatam |
| `kala_quran_surahs` | Surah[] | Cache daftar surah |
| `kala-imsakiyah-*` | object[] | Cache jadwal imsakiyah |

### 2.4 Model Data Utama

```typescript
interface DayData {
  prayerCompleted: boolean[];      // [Subuh, Dzuhur, Ashar, Maghrib, Isya]
  sunnahCompleted: Record<string, boolean>; // {tahajud, dhuha, rawatib, witr, puasa, sahur, sedekah, terawih, ...}
}
```

---

## 3. Fitur Detail

### 3.1 Welcome / Onboarding (`/welcome`)

**Tujuan**: Menyambut pengguna baru dan memulai penggunaan app.

- Tampilan minimalis: ikon bulan sabit 🌙 dengan efek glow
- Teks: "Assalamu'alaikum! Kala hadir menemani ibadah harianmu dengan mudah dan tenang"
- Tombol "Mulai" dengan gradient hijau khas
- Set `kala_onboarded = true` di localStorage
- Redirect otomatis ke `/today` jika sudah onboarded

---

### 3.2 Hari Ini / Dashboard (`/today`)

**Tujuan**: Dashboard utama yang menampilkan ringkasan ibadah hari ini.

#### 3.2.1 Hero Card
- **Tanggal Hijriah** otomatis (konversi Gregorian → Hijri)
- **Lokasi pengguna** (deteksi GPS + reverse geocoding via Nominatim)
- **Info Ramadan**: menampilkan hari ke-X Ramadan jika bulan Ramadan
- **Countdown sholat berikutnya**: format HH:MM:SS real-time (update per detik)
- **Nama & waktu sholat berikutnya**
- **Strip jadwal semua sholat**: Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya

#### 3.2.2 Card Check-in Puasa
- Navigasi ke halaman Puasa (`/puasa`)
- Menampilkan durasi puasa hari ini
- Menampilkan streak puasa beruntun
- Badge pill dengan border

#### 3.2.3 Week Selector
- Horizontal date picker (7 hari dari Senin s/d Minggu)
- Navigasi minggu sebelum/sesudah
- Dot hijau untuk hari ini
- Highlight aktif: gradient hijau rounded pill

#### 3.2.4 Prayer Card (Sholat Wajib)
- Daftar 5 sholat wajib dengan waktu dari API
- Checkbox visual (tap untuk toggle)
- Progress bar 0/5 – 5/5
- Status: strikethrough + warna abu jika selesai

#### 3.2.5 Sunnah Section
- Checklist amalan sunnah: Tahajud, Dhuha, Rawatib, Witr
- Toggle on/off per item

#### 3.2.6 Trivia Card
- Fakta/kisah harian Islam
- Konten berbeda setiap hari:
  - **Bulan Ramadan**: 30+ trivia spesifik Ramadan (sejarah, kisah, hikmah)
  - **Di luar Ramadan**: trivia umum Islam (puasa sunnah, fakta masjid, dll)
- Ikon emoji per kategori

---

### 3.3 Tracker Sholat (`/tracker`)

**Tujuan**: Melacak konsistensi sholat 5 waktu dengan visualisasi.

#### 3.3.1 Circular Progress
- Progress ring besar (280×280px) menampilkan persentase sholat hari ini
- Animasi smooth saat persentase berubah
- Label: "Tracker Solat Wajib", persentase, dan "X/5 Completed"

#### 3.3.2 Week Selector
- Sama seperti di `/today`, navigasi horizontal per minggu
- Menampilkan data sholat per hari yang dipilih

#### 3.3.3 Streak Card 🔥
- Menampilkan streak hari beruntun sholat 5 waktu lengkap
- **Logika streak**:
  - Scan ke belakang hingga 90 hari dari hari ini
  - Temukan hari terakhir dengan 5/5 sholat
  - Hitung mundur hari-hari berturut-turut dari situ
  - Jika hari ini belum lengkap, streak tetap dihitung dari hari terakhir yang lengkap
- Pesan motivasi: "X hari beruntun salat 5 waktu!" atau "Mulai streak salat 5 waktumu!"

#### 3.3.4 Daftar Sholat
- 5 sholat wajib: Subuh, Dzuhur, Ashar, Maghrib, Isya
- Tap untuk toggle selesai/belum
- Tombol "Selesaikan semua"
- Waktu sholat dari API (berdasarkan lokasi)

#### 3.3.5 Sunnah Section
- Amalan sunnah tambahan: Tahajud, Dhuha, Rawatib, Witr
- Tap untuk toggle

#### 3.3.6 Link ke Progress Bulanan
- Tombol menuju `/progress` untuk melihat konsistensi per bulan

---

### 3.4 Progress Bulanan (`/progress`)

**Tujuan**: Visualisasi kalender bulanan untuk melihat konsistensi ibadah.

- **Kalender grid**: Setiap hari ditandai berdasarkan kelengkapan ibadah
- **Navigasi bulan**: tombol prev/next
- **Day Detail**: tap tanggal untuk melihat detail ibadah hari itu
- **Back button**: kembali ke halaman sebelumnya

---

### 3.5 Puasa Tracker (`/puasa`)

**Tujuan**: Melacak puasa Ramadan dan aktivitas terkait.

#### 3.5.1 Header & Navigasi Minggu
- Judul "Ramadhan Tracker"
- Navigasi minggu (chevron kiri/kanan)
- Week day selector horizontal

#### 3.5.2 Info Card Puasa
- **"Puasa Hari ke-X"** (berdasarkan kalender Hijriah)
- Countdown menuju Lebaran: "X hari menuju Lebaran!"
- Mini circular progress (86×86px) untuk checklist hari ini
- **Waktu Imsak & Buka Puasa**: dari API Aladhan berdasarkan lokasi

#### 3.5.3 Streak Card 🔥
- Logika sama dengan streak sholat, tapi berdasarkan `sunnahCompleted["puasa"]`
- Scan 90 hari ke belakang untuk menemukan hari puasa terakhir

#### 3.5.4 Puasa Checklist
- 4 item: Makan Sahur, Puasa Ramadhan, Sedekah, Sholat Terawih
- Progress bar visual
- Tombol "Selesaikan semua"

#### 3.5.5 Jadwal Imsakiyah
- Tabel lengkap 30 hari Ramadan
- Kolom: Hari ke-, Imsak, Subuh, Maghrib
- Data dari API Aladhan (Hijri Calendar endpoint)
- Cache di localStorage
- Highlight hari ini

---

### 3.6 Al-Quran (`/quran`)

**Tujuan**: Membaca Al-Quran lengkap 30 juz / 114 surah dengan fitur khatam.

#### 3.6.1 Mode Navigasi
- **Mode Surah**: Daftar 114 surah dengan pencarian
- **Mode Juz**: Daftar 30 juz

#### 3.6.2 Konten Ayat
- **Teks Arab**: dari API AlQuran Cloud (quran-uthmani)
- **Transliterasi Latin**: dari API equran.id (`teksLatin`) — transliterasi bergaya Indonesia
- **Terjemahan Indonesia**: dari API AlQuran Cloud (id.indonesian)
- **Font Arab**: LPMQ IsepMisbah (custom font dari Kemenag RI)
- **Bismillah handling**: Bismillah dihapus dari ayat 1 (kecuali Al-Fatihah & At-Taubah) karena sudah ditampilkan terpisah

#### 3.6.3 Fitur Interaksi Ayat
Tap ayat → drawer muncul dengan opsi:
- **📍 Tandai terakhir dibaca**: Simpan progress baca
- **📋 Salin ayat**: Copy teks Arab + terjemahan ke clipboard
- **🚩 Simpan checkpoint**: Bookmark ayat favorit (1 per surah)
- **🏆 Checkpoint khatam**: Simpan progress dalam program khatam (jika aktif)

#### 3.6.4 Program Khatam
- **Buat program khatam**: Pilih durasi (30, 45, 60, 90 hari atau custom)
- **Tracking progress**: Checkpoint surah & ayat terakhir dibaca
- **Multiple sessions**: Bisa punya beberapa program khatam aktif
- **Selesaikan khatam**: Tandai selesai saat sudah khatam
- **Riwayat khatam**: Lihat khatam yang sudah diselesaikan
- **Hapus**: Bisa hapus program khatam

#### 3.6.5 Checkpoint (Bookmark)
- Daftar ayat yang di-bookmark
- Tap untuk langsung buka surah di ayat tersebut
- Hapus bookmark

#### 3.6.6 Continue Reading
- Modal "Lanjutkan membaca" otomatis muncul saat buka halaman Quran
- Menampilkan surah & ayat terakhir dibaca

---

### 3.7 Doa Harian (`/doa`)

**Tujuan**: Kumpulan doa sehari-hari dengan teks Arab, latin, dan terjemahan.

#### 3.7.1 Konten
16 doa tersedia dalam 5 kategori:
- **Harian** (9 doa): Makan, tidur, kamar mandi, bercermin, pakaian, keluar/masuk rumah
- **Ibadah** (2 doa): Masuk/keluar masjid
- **Ramadan** (2 doa): Niat puasa, berbuka puasa
- **Perjalanan** (1 doa): Naik kendaraan
- **Alam** (1 doa): Saat hujan

#### 3.7.2 Fitur
- **Pencarian**: Filter doa berdasarkan judul
- **Filter kategori**: Chip horizontal scrollable
- **Expandable cards**: Tap card untuk membuka/tutup konten lengkap
- **Tampilan 3 baris**: Teks Arab (font LPMQ), Latin (italic), Terjemahan Indonesia

---

### 3.8 Kalkulator Zakat (`/tools`)

**Tujuan**: Menghitung zakat berdasarkan tipe.

#### 3.8.1 Tipe Zakat
3 tab kalkulator:

| Tipe | Input | Perhitungan |
|------|-------|-------------|
| **Maal** | Total harta, total hutang | (Harta - Hutang) × 2.5% jika ≥ nisab |
| **Profesi** | Penghasilan bulanan | Gaji × 2.5% jika gaji×12 ≥ nisab |
| **Fitrah** | Jumlah jiwa | Jiwa × Rp 35.000 |

#### 3.8.2 Parameter
- Nisab: 85 gram emas × Rp 1.200.000/gram = Rp 102.000.000
- Rate zakat: 2.5%
- Zakat fitrah: Rp 35.000/jiwa (setara 2.5 kg beras)

#### 3.8.3 Output
- Tampilan hasil dengan format Rupiah
- Indikator "Belum mencapai nisab" jika harta < nisab
- Card hasil dengan gradient hijau

---

### 3.9 Kompas Kiblat (`/qibla`)

**Tujuan**: Menunjukkan arah kiblat berdasarkan lokasi.

- **Perhitungan bearing** ke Ka'bah (21.4225°N, 39.8262°E)
- **Device orientation**: Rotasi kompas mengikuti orientasi perangkat
- **Visual**: Ring kompas dengan arah mata angin (U/T/S/B) dan needle kiblat
- **Fallback**: Default ke Jakarta (-6.2, 106.8) jika GPS ditolak
- Menampilkan derajat arah kiblat dari Utara

---

### 3.10 Info Ramadan (`/tools/ramadan`)

**Tujuan**: Informasi dan jadwal lengkap bulan Ramadan.

- Status Ramadan: hari ke-X atau "Bukan bulan Ramadan"
- Amalan Ramadan: 5 rekomendasi amalan (Tadarus, Tarawih, Sedekah, I'tikaf, Sahur & Berbuka)
- Jadwal Imsakiyah: Tabel 30 hari dengan kolom Imsak, Subuh, Maghrib

---

### 3.11 Setelan (`/settings`)

**Tujuan**: Pengaturan aplikasi.

#### 3.11.1 Item Setelan

| Item | Fungsi |
|------|--------|
| **Lokasi** | Tap untuk re-kalibrasi GPS. Menampilkan lokasi saat ini atau "Mengkalibrasi lokasi..." saat loading. Reverse geocode via Nominatim. Toast konfirmasi setelah selesai. |
| **Notifikasi Adzan** | Pengingat waktu sholat (placeholder) |
| **Tentang Kala** | Versi 1.0 — Pendamping ibadah harianmu |

---

## 4. Integrasi API

### 4.1 API Eksternal

| API | Endpoint | Kegunaan |
|-----|----------|----------|
| **Aladhan** | `api.aladhan.com/v1/timings/{date}` | Jadwal sholat berdasarkan koordinat (method: 20 / Kemenag RI) |
| **Aladhan Hijri Calendar** | `api.aladhan.com/v1/hijriCalendar/9/{year}` | Jadwal imsakiyah 30 hari Ramadan |
| **AlQuran Cloud** | `api.alquran.cloud/v1/surah` | Daftar surah, teks Arab, terjemahan Indonesia |
| **AlQuran Cloud Juz** | `api.alquran.cloud/v1/juz/{num}` | Teks per juz |
| **equran.id** | `equran.id/api/v2/surat/{num}` | Transliterasi Latin bergaya Indonesia |
| **Nominatim (OpenStreetMap)** | `nominatim.openstreetmap.org/reverse` | Reverse geocoding (koordinat → nama kota) |

### 4.2 Strategi Caching
- Semua response API di-cache di localStorage
- Key pattern: `kala-prayers-{date}-{lat}-{lon}`, `kala_quran_surahs`, dll
- Mengurangi API call berulang

---

## 5. Kalender Hijriah

### 5.1 Konversi Tanggal
- Algoritma konversi Gregorian → Julian Day → Hijri
- Mendukung 12 bulan Hijriah: Muharram s/d Dzulhijjah
- Format output: "X [NamaBulan] [Tahun]H" (contoh: "5 Ramadan 1447H")

### 5.2 Deteksi Ramadan
- Fungsi `isRamadan(date)`: mengecek apakah tanggal Hijriah jatuh di bulan ke-9
- Return: `{ isRamadan: boolean, dayOfRamadan: number }`

---

## 6. Desain & UI

### 6.1 Design System

- **Layout**: Mobile-first, max-width 448px (centered)
- **Border radius**: 2xl (16px) untuk card, 3xl (24px) untuk card besar, full (40px) untuk button/pill
- **Warna utama**:
  - Background: `#FFFFFF`
  - Text primary: `#1D293D`
  - Text secondary: `#838A96`
  - Text muted: `#62748E`, `#90A1B9`
  - Accent green: `#38CA5E`
  - Border: `#F3EDE6`
  - Card background: `#F8F8F7`
- **Gradient utama**: `linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)` — untuk tombol aktif, CTA, progress
- **Progress bar gradient**: `linear-gradient(90deg, #3AE886 0%, #46C0F1 100%)`
- **Background blur blobs**:
  - Green: `#CCFF3F`, blur 100px
  - Blue: `#00B4D8`, blur 100px (beberapa halaman)
- **Shadow**: `0px 30px 46px rgba(223, 150, 55, 0.1)` — warm shadow

### 6.2 Tipografi
- Font Arab: **LPMQ IsepMisbah** (custom, dari Kemenag RI) — file .ttf dan .woff2
- Font UI: System default (sans-serif)
- Letter spacing: `-0.44px` untuk heading, `-0.15px` untuk body kecil

### 6.3 Animasi
- **Framer Motion** untuk semua transisi:
  - Entry animations: `y: 10 → 0`, `opacity: 0 → 1`
  - Scale: `0.9 → 1` untuk hero elements
  - Staggered delays: `0.04s` antar item list
  - Spring physics untuk kompas kiblat
- **CSS transitions**: `0.5s ease` untuk progress ring

### 6.4 Safe Areas
- Bottom padding: `pb-24` (96px) untuk menghindari overlap dengan bottom nav
- Bottom nav: Fixed position, `bottom: 16px`, dengan safe-area-inset

---

## 7. Performa & Optimasi

- **Code splitting**: Per-page lazy loading via React Router
- **API caching**: localStorage untuk mengurangi network calls
- **Memoization**: `useMemo` untuk kalkulasi berat (streak, week days, dll)
- **Callback optimization**: `useCallback` untuk handlers yang di-pass ke child components
- **Conditional rendering**: Hanya render content yang visible (expanded doa, selected surah, dll)

---

## 8. Limitasi Saat Ini

| Limitasi | Detail |
|----------|--------|
| **Tanpa backend** | Semua data di localStorage — hilang jika clear browser data |
| **Tanpa autentikasi** | Tidak ada login/akun pengguna |
| **Tanpa sync** | Data tidak bisa disinkronkan antar perangkat |
| **Notifikasi belum aktif** | Item "Notifikasi Adzan" masih placeholder |
| **Nisab statis** | Harga emas hardcoded Rp 1.200.000/gram |
| **Hijri approx** | Kalender Hijriah menggunakan kalkulasi matematis, bisa berbeda 1-2 hari dari penetapan pemerintah |
| **Kompas desktop** | Device orientation tidak tersedia di desktop — hanya menampilkan derajat |

---

## 9. Roadmap Potensial

### Phase 2 — Backend & Akun
- [ ] Integrasi Lovable Cloud untuk database & autentikasi
- [ ] Login dengan email/password
- [ ] Sinkronisasi data lintas perangkat
- [ ] Backup & restore data ibadah

### Phase 3 — Engagement
- [ ] Push notification untuk waktu sholat
- [ ] Reminder sahur & berbuka
- [ ] Notifikasi streak akan putus
- [ ] Widget ringkasan harian

### Phase 4 — Konten
- [ ] Audio murottal per ayat/surah
- [ ] Doa lebih lengkap (100+ doa)
- [ ] Tafsir ayat
- [ ] Harga emas real-time untuk nisab zakat
- [ ] Kalender Hijriah visual (grid bulan)

### Phase 5 — Sosial
- [ ] Leaderboard streak (opsional, privasi-first)
- [ ] Share progress ke media sosial
- [ ] Grup keluarga untuk tracking bersama

---

## 10. Metrik Keberhasilan

Berdasarkan analytics 19-21 Feb 2026:

| Metrik | Nilai | Target |
|--------|-------|--------|
| Total visitors (3 hari) | 305 | — |
| Pageviews per visit | 8.12 | > 5 ✅ |
| Session duration | 520 detik (~8.7 menit) | > 3 menit ✅ |
| Bounce rate | 20% | < 30% ✅ |
| Top traffic source | Direct (51%), Instagram (34%) | — |
| Device split | 86% mobile, 13% desktop | Mobile-first ✅ |
| Top pages | /today, /welcome, /puasa, /quran, /tracker | — |

---

## 11. Glossary

| Istilah | Definisi |
|---------|----------|
| **DayData** | Struktur data harian: array boolean sholat + map sunnah |
| **Streak** | Jumlah hari berturut-turut menyelesaikan target (5 sholat / puasa) |
| **Checkpoint** | Bookmark ayat Al-Quran |
| **Khatam** | Program membaca Al-Quran dari awal sampai akhir dalam durasi tertentu |
| **Imsakiyah** | Jadwal waktu imsak, subuh, dan maghrib selama Ramadan |
| **Nisab** | Batas minimum harta yang wajib dizakati |

---

*Dokumen ini menggambarkan state aplikasi Kala per 21 Februari 2026. Dibuat secara otomatis berdasarkan analisis codebase.*
