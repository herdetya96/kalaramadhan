// Hijri date utilities - approximate calculation
// Ramadan 1447H starts approximately Feb 18, 2026

function gregorianToJulian(year: number, month: number, day: number): number {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

export function gregorianToHijri(gDate: Date): { year: number; month: number; day: number; monthName: string } {
  const jd = gregorianToJulian(gDate.getFullYear(), gDate.getMonth() + 1, gDate.getDate());
  const l = Math.floor(jd - 1948439.5) + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  const monthNames = [
    "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
    "Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
  ];

  return { year, month, day, monthName: monthNames[month - 1] || "" };
}

export function isRamadan(date: Date): { isRamadan: boolean; dayOfRamadan: number } {
  const hijri = gregorianToHijri(date);
  return {
    isRamadan: hijri.month === 9,
    dayOfRamadan: hijri.month === 9 ? hijri.day : 0,
  };
}

export function formatHijriDate(date: Date): string {
  const h = gregorianToHijri(date);
  return `${h.day} ${h.monthName} ${h.year}H`;
}

// Prayer times (static defaults - can be enhanced with API later)
export interface PrayerSchedule {
  name: string;
  time: string;
  minutes: number; // minutes from midnight
}

export const DEFAULT_PRAYERS: PrayerSchedule[] = [
  { name: "Imsak", time: "04:25", minutes: 265 },
  { name: "Subuh", time: "04:35", minutes: 275 },
  { name: "Terbit", time: "05:50", minutes: 350 },
  { name: "Dzuhur", time: "11:55", minutes: 715 },
  { name: "Ashar", time: "15:15", minutes: 915 },
  { name: "Maghrib", time: "17:50", minutes: 1070 },
  { name: "Isya", time: "19:05", minutes: 1145 },
];

export const WAJIB_PRAYERS = DEFAULT_PRAYERS.filter(
  p => ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"].includes(p.name)
);

export function getNextPrayer(now: Date): { prayer: PrayerSchedule; remainingMinutes: number; remainingSeconds: number } | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  for (const prayer of WAJIB_PRAYERS) {
    if (prayer.minutes > currentMinutes) {
      const totalSec = (prayer.minutes - currentMinutes) * 60 - currentSeconds;
      return { prayer, remainingMinutes: prayer.minutes - currentMinutes, remainingSeconds: totalSec };
    }
  }
  const subuh = WAJIB_PRAYERS[0];
  const totalSec = ((1440 - currentMinutes) + subuh.minutes) * 60 - currentSeconds;
  return { prayer: subuh, remainingMinutes: (1440 - currentMinutes) + subuh.minutes, remainingSeconds: totalSec };
}

export function formatCountdown(totalSeconds: number): { hours: string; minutes: string; seconds: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: h.toString().padStart(2, "0"),
    minutes: m.toString().padStart(2, "0"),
    seconds: s.toString().padStart(2, "0"),
  };
}

// LocalStorage helpers for multi-date data
const DATA_PREFIX = "kala_data_";

export interface DayData {
  prayerCompleted: boolean[];
  sunnahCompleted: Record<string, boolean>;
}

export function getDayKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function loadDayData(date: Date): DayData {
  const key = DATA_PREFIX + getDayKey(date);
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  return { prayerCompleted: [false, false, false, false, false], sunnahCompleted: {} };
}

export function saveDayData(date: Date, data: DayData): void {
  const key = DATA_PREFIX + getDayKey(date);
  localStorage.setItem(key, JSON.stringify(data));
}

export function getWeekData(startDate: Date): DayData[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return loadDayData(d);
  });
}

export function getMonthData(year: number, month: number): { date: Date; data: DayData }[] {
  const result: { date: Date; data: DayData }[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    result.push({ date: d, data: loadDayData(d) });
  }
  return result;
}

// Ramadan trivia - historical events, stories from Prophet era, fasting facts
interface RamadanTrivia {
  text: string;
  category: string; // "sejarah" | "kisah" | "fakta" | "hikmah"
  emoji: string;
}

const RAMADAN_TRIVIA: RamadanTrivia[] = [
  // Day-specific historical events
  { text: "Perang Badar terjadi pada 17 Ramadan 2H. 313 pasukan Muslim mengalahkan 1.000 pasukan Quraisy. Kemenangan ini disebut 'Yaumul Furqan' — hari pembeda antara kebenaran dan kebatilan.", category: "sejarah", emoji: "⚔️" },
  { text: "Al-Quran pertama kali diturunkan pada malam Lailatul Qadar di bulan Ramadan. Malaikat Jibril menemui Rasulullah di Gua Hira dan berkata 'Iqra!' (Bacalah!).", category: "kisah", emoji: "📖" },
  { text: "Fathu Makkah (Pembebasan Makkah) terjadi pada 20 Ramadan 8H. Rasulullah masuk ke Makkah tanpa pertumpahan darah, dan beliau memaafkan semua penduduk Quraisy.", category: "sejarah", emoji: "🕋" },
  { text: "Rasulullah SAW bersabda: 'Barangsiapa berpuasa Ramadan karena iman dan mengharap pahala, diampuni dosa-dosanya yang telah lalu.' (HR. Bukhari & Muslim)", category: "hikmah", emoji: "🤲" },
  { text: "Khadijah binti Khuwailid, istri pertama Rasulullah, wafat pada 10 Ramadan 10H (sebelum Hijrah). Tahun itu disebut 'Aamul Huzn' (Tahun Kesedihan).", category: "kisah", emoji: "💔" },
  { text: "Di bulan Ramadan, pintu-pintu surga dibuka, pintu-pintu neraka ditutup, dan setan-setan dibelenggu. Ini adalah bulan penuh rahmat dan ampunan.", category: "hikmah", emoji: "🌟" },
  { text: "Rasulullah SAW sangat dermawan, dan beliau paling dermawan di bulan Ramadan. Kedermawanan beliau seperti angin yang berhembus kencang (tidak menahan apapun).", category: "kisah", emoji: "💝" },
  { text: "Perang Ain Jalut pada 25 Ramadan 658H: Pasukan Mamluk di bawah Saifuddin Qutuz menghentikan invasi Mongol yang telah menghancurkan Baghdad.", category: "sejarah", emoji: "🛡️" },
  { text: "Rasulullah SAW bersabda: 'Puasa adalah perisai. Jika salah seorang dari kalian berpuasa, janganlah berkata kotor dan jangan pula berteriak.' (HR. Bukhari)", category: "hikmah", emoji: "🛡️" },
  { text: "Pertempuran Hattin terjadi pada Ramadan 583H. Salahuddin Al-Ayyubi membebaskan Yerusalem setelah 88 tahun dikuasai tentara Salib.", category: "sejarah", emoji: "⚔️" },
  { text: "Bilal bin Rabah, muadzin pertama dalam Islam, masuk Islam dan menderita siksaan berat di bawah terik matahari. Abu Bakar membebaskannya dengan membeli dan memerdekakannya.", category: "kisah", emoji: "📢" },
  { text: "Lailatul Qadar lebih baik dari seribu bulan (83 tahun lebih). Rasulullah menganjurkan untuk mencarinya di 10 malam terakhir Ramadan, terutama malam ganjil.", category: "hikmah", emoji: "✨" },
  { text: "Universitas Al-Azhar di Kairo, salah satu universitas tertua di dunia, didirikan pada Ramadan 361H oleh Dinasti Fatimiyah.", category: "sejarah", emoji: "🏛️" },
  { text: "Rasulullah SAW berbuka puasa dengan ruthab (kurma basah). Jika tidak ada, beliau berbuka dengan tamr (kurma kering). Jika tidak ada, beliau minum air.", category: "kisah", emoji: "🌴" },
  { text: "Imam Syafi'i biasa mengkhatamkan Al-Quran 60 kali di bulan Ramadan — dua kali setiap hari! Beliau adalah salah satu ulama paling berpengaruh dalam sejarah Islam.", category: "kisah", emoji: "📚" },
  { text: "Rasulullah SAW bersabda: 'Ada tiga orang yang doanya tidak ditolak: pemimpin yang adil, orang yang berpuasa sampai ia berbuka, dan doa orang yang dizalimi.' (HR. Tirmidzi)", category: "hikmah", emoji: "🤲" },
  { text: "Spanyol Islam (Al-Andalus) mencapai puncak peradabannya selama Ramadan menjadi bulan produktivitas dan ilmu pengetahuan, bukan bulan bermalas-malasan.", category: "sejarah", emoji: "🏰" },
  { text: "Rasulullah SAW berkata: 'Sahur itu berkah, maka jangan tinggalkan sahur walau hanya seteguk air.' Makan sahur membedakan puasa Muslim dengan puasa agama lain.", category: "hikmah", emoji: "🍽️" },
  { text: "Umar bin Khattab menetapkan sholat Tarawih berjamaah 20 rakaat di masjid pada masa kekhalifahannya. Sebelumnya, orang-orang sholat sendiri-sendiri.", category: "sejarah", emoji: "🕌" },
  { text: "Rasulullah SAW melakukan i'tikaf 10 hari terakhir Ramadan setiap tahun. Pada tahun terakhir beliau, beliau beri'tikaf 20 hari.", category: "kisah", emoji: "🕌" },
  { text: "Puasa mengajarkan empati. Ketika kita merasakan lapar dan haus, kita memahami penderitaan fakir miskin. Ini adalah salah satu hikmah terbesar dari puasa.", category: "hikmah", emoji: "❤️" },
  { text: "Pada Ramadan 92H, pasukan Muslim di bawah Tariq bin Ziyad menyeberangi Selat Gibraltar dan memulai pembebasan Spanyol (Al-Andalus) dari kekuasaan Visigoth.", category: "sejarah", emoji: "⛵" },
  { text: "Rasulullah SAW bersabda: 'Demi Dzat yang jiwa Muhammad di tangan-Nya, bau mulut orang yang berpuasa lebih harum di sisi Allah dari bau minyak kasturi.'", category: "hikmah", emoji: "🌸" },
  { text: "Imam Bukhari memulai penyusunan kitab Sahih Bukhari, kitab hadits paling otentik, dan banyak mengerjakannya di bulan Ramadan sebagai bentuk ibadah.", category: "kisah", emoji: "📜" },
  { text: "Zakat Fitrah wajib dikeluarkan sebelum sholat Idul Fitri. Rasulullah menetapkannya sebagai 1 sha' (±2,5 kg) makanan pokok untuk membersihkan puasa dari perbuatan sia-sia.", category: "hikmah", emoji: "🌾" },
  { text: "Perang Tabuk terjadi pada Rajab-Ramadan 9H. Meskipun cuaca sangat panas dan jaraknya jauh, 30.000 pasukan Muslim berbaris menuju perbatasan Romawi.", category: "sejarah", emoji: "🏜️" },
  { text: "Aisyah RA bertanya kepada Rasulullah: 'Apa yang harus kubaca jika aku mendapati Lailatul Qadar?' Beliau menjawab: 'Bacalah: Allahumma innaka afuwwun tuhibbul afwa fa'fu anni.'", category: "kisah", emoji: "🌙" },
  { text: "Ilmuwan Muslim seperti Ibnu Sina dan Al-Khawarizmi tetap produktif di bulan Ramadan. Puasa tidak menghalangi mereka dari karya-karya besar yang mengubah dunia.", category: "sejarah", emoji: "🔬" },
  { text: "Rasulullah SAW bersabda: 'Setiap amal anak Adam dilipat gandakan, satu kebaikan menjadi 10 hingga 700 kali lipat. Allah berfirman: Kecuali puasa, ia untuk-Ku dan Aku yang membalasnya.'", category: "hikmah", emoji: "♾️" },
  { text: "Pada Ramadan, Rasulullah SAW mengulang hafalan Al-Quran bersama Jibril setiap malam. Tradisi ini menjadi dasar tadarus dan khataman Al-Quran di bulan Ramadan.", category: "kisah", emoji: "📖" },
];

export function getRamadanTrivia(dayOfRamadan: number): RamadanTrivia {
  const index = ((dayOfRamadan - 1) % RAMADAN_TRIVIA.length);
  return RAMADAN_TRIVIA[index];
}

// General trivia for non-Ramadan days
const GENERAL_TRIVIA: RamadanTrivia[] = [
  { text: "Tahukah kamu? Puasa Senin-Kamis adalah sunnah Rasulullah. Beliau bersabda: 'Amal-amal diperlihatkan pada hari Senin dan Kamis, dan aku suka amalku diperlihatkan sedang aku berpuasa.'", category: "fakta", emoji: "📅" },
  { text: "Puasa Dawud (sehari puasa, sehari tidak) adalah puasa yang paling dicintai Allah. Nabi Dawud AS melakukannya sepanjang hidupnya.", category: "kisah", emoji: "⭐" },
  { text: "Puasa 6 hari di bulan Syawal setelah Ramadan pahalanya seperti puasa setahun penuh. Ini karena 30 hari Ramadan + 6 hari Syawal = 36 hari × 10 = 360 hari.", category: "fakta", emoji: "🔢" },
  { text: "Puasa Arafah (9 Dzulhijjah) menghapus dosa setahun sebelum dan setahun sesudahnya. Ini adalah hari terbaik sepanjang tahun.", category: "hikmah", emoji: "🏔️" },
  { text: "Rasulullah SAW bersabda: 'Sholat yang paling utama setelah sholat wajib adalah sholat di tengah malam (Tahajud).' — HR. Muslim", category: "hikmah", emoji: "🌙" },
  { text: "Puasa Asyura (10 Muharram) menghapus dosa setahun yang lalu. Nabi Musa AS dan Bani Israel diselamatkan dari Firaun pada hari ini.", category: "sejarah", emoji: "🌊" },
  { text: "Masjidil Haram di Makkah adalah masjid terbesar di dunia, mampu menampung lebih dari 2 juta jamaah. Ka'bah di tengahnya adalah kiblat seluruh umat Islam.", category: "fakta", emoji: "🕋" },
];

export function getDailyTrivia(date: Date): RamadanTrivia {
  const ramadan = isRamadan(date);
  if (ramadan.isRamadan) {
    return getRamadanTrivia(ramadan.dayOfRamadan);
  }
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return GENERAL_TRIVIA[dayOfYear % GENERAL_TRIVIA.length];
}
