// Hijri date utilities - approximate calculation
// Ramadan 1447H starts approximately Feb 18, 2026

const HIJRI_EPOCH = 1948439.5; // Julian day of Hijri epoch

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

export function getNextPrayer(now: Date): { prayer: PrayerSchedule; remainingMinutes: number } | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const prayer of WAJIB_PRAYERS) {
    if (prayer.minutes > currentMinutes) {
      return { prayer, remainingMinutes: prayer.minutes - currentMinutes };
    }
  }
  // After Isya, next is Subuh tomorrow
  const subuh = WAJIB_PRAYERS[0];
  return { prayer: subuh, remainingMinutes: (1440 - currentMinutes) + subuh.minutes };
}

export function formatCountdown(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m} menit`;
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

// Get data for a range of dates (for tracker)
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

// Daily quotes
const QUOTES = [
  { text: "Sesungguhnya sholat itu mencegah dari perbuatan keji dan mungkar.", source: "QS. Al-Ankabut: 45" },
  { text: "Barangsiapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya.", source: "QS. At-Talaq: 2" },
  { text: "Dan mohonlah pertolongan dengan sabar dan sholat.", source: "QS. Al-Baqarah: 45" },
  { text: "Sesungguhnya bersama kesulitan ada kemudahan.", source: "QS. Al-Insyirah: 6" },
  { text: "Maka ingatlah kepada-Ku, niscaya Aku ingat kepadamu.", source: "QS. Al-Baqarah: 152" },
  { text: "Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Ku-perkenankan bagimu.", source: "QS. Al-Mu'min: 60" },
  { text: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.", source: "QS. Al-Baqarah: 286" },
];

export function getDailyQuote(date: Date): typeof QUOTES[0] {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
