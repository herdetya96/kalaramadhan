import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen, ChevronRight, Loader2, Copy, BookMarked, Flag, Trophy, Plus, X, Check, MapPin, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import { getSurahTranslation } from "@/lib/surah-translations";

interface JuzInfo {
  number: number;
  startSurah: string;
  startAyah: number;
  endSurah: string;
  endAyah: number;
}

const JUZ_DATA: JuzInfo[] = [
  { number: 1, startSurah: "Al-Fatihah", startAyah: 1, endSurah: "Al-Baqarah", endAyah: 141 },
  { number: 2, startSurah: "Al-Baqarah", startAyah: 142, endSurah: "Al-Baqarah", endAyah: 252 },
  { number: 3, startSurah: "Al-Baqarah", startAyah: 253, endSurah: "Ali 'Imran", endAyah: 92 },
  { number: 4, startSurah: "Ali 'Imran", startAyah: 93, endSurah: "An-Nisa", endAyah: 23 },
  { number: 5, startSurah: "An-Nisa", startAyah: 24, endSurah: "An-Nisa", endAyah: 147 },
  { number: 6, startSurah: "An-Nisa", startAyah: 148, endSurah: "Al-Ma'idah", endAyah: 81 },
  { number: 7, startSurah: "Al-Ma'idah", startAyah: 82, endSurah: "Al-An'am", endAyah: 110 },
  { number: 8, startSurah: "Al-An'am", startAyah: 111, endSurah: "Al-A'raf", endAyah: 87 },
  { number: 9, startSurah: "Al-A'raf", startAyah: 88, endSurah: "Al-Anfal", endAyah: 40 },
  { number: 10, startSurah: "Al-Anfal", startAyah: 41, endSurah: "At-Taubah", endAyah: 92 },
  { number: 11, startSurah: "At-Taubah", startAyah: 93, endSurah: "Hud", endAyah: 5 },
  { number: 12, startSurah: "Hud", startAyah: 6, endSurah: "Yusuf", endAyah: 52 },
  { number: 13, startSurah: "Yusuf", startAyah: 53, endSurah: "Ibrahim", endAyah: 52 },
  { number: 14, startSurah: "Al-Hijr", startAyah: 1, endSurah: "An-Nahl", endAyah: 128 },
  { number: 15, startSurah: "Al-Isra", startAyah: 1, endSurah: "Al-Kahf", endAyah: 74 },
  { number: 16, startSurah: "Al-Kahf", startAyah: 75, endSurah: "Ta-Ha", endAyah: 135 },
  { number: 17, startSurah: "Al-Anbiya", startAyah: 1, endSurah: "Al-Hajj", endAyah: 78 },
  { number: 18, startSurah: "Al-Mu'minun", startAyah: 1, endSurah: "Al-Furqan", endAyah: 20 },
  { number: 19, startSurah: "Al-Furqan", startAyah: 21, endSurah: "An-Naml", endAyah: 55 },
  { number: 20, startSurah: "An-Naml", startAyah: 56, endSurah: "Al-Ankabut", endAyah: 45 },
  { number: 21, startSurah: "Al-Ankabut", startAyah: 46, endSurah: "Al-Ahzab", endAyah: 30 },
  { number: 22, startSurah: "Al-Ahzab", startAyah: 31, endSurah: "Ya-Sin", endAyah: 27 },
  { number: 23, startSurah: "Ya-Sin", startAyah: 28, endSurah: "Az-Zumar", endAyah: 31 },
  { number: 24, startSurah: "Az-Zumar", startAyah: 32, endSurah: "Fussilat", endAyah: 46 },
  { number: 25, startSurah: "Fussilat", startAyah: 47, endSurah: "Al-Jathiyah", endAyah: 37 },
  { number: 26, startSurah: "Al-Ahqaf", startAyah: 1, endSurah: "Adh-Dhariyat", endAyah: 30 },
  { number: 27, startSurah: "Adh-Dhariyat", startAyah: 31, endSurah: "Al-Hadid", endAyah: 29 },
  { number: 28, startSurah: "Al-Mujadilah", startAyah: 1, endSurah: "At-Tahrim", endAyah: 12 },
  { number: 29, startSurah: "Al-Mulk", startAyah: 1, endSurah: "Al-Mursalat", endAyah: 50 },
  { number: 30, startSurah: "An-Naba", startAyah: 1, endSurah: "An-Nas", endAyah: 6 },
];

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  translation?: string;
  transliteration?: string;
  surahNumber?: number;
  surahName?: string;
}

interface BookmarkedAyah {
  surah: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translation: string;
}

interface KhatamSession {
  id: string;
  startDate: string;
  durationDays: number;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
  // Khatam checkpoint
  checkpointSurah?: number;
  checkpointSurahName?: string;
  checkpointAyah?: number;
}

const QURAN_PROGRESS_KEY = "kala_quran_progress";
const QURAN_BOOKMARKS_KEY = "kala_quran_bookmarks";
const QURAN_KHATAM_KEY = "kala_quran_khatam";

const DURATION_TEMPLATES = [30, 45, 60, 90];

function getQuranProgress(): { lastSurah: number; lastAyah: number } {
  const saved = localStorage.getItem(QURAN_PROGRESS_KEY);
  if (saved) return JSON.parse(saved);
  return { lastSurah: 1, lastAyah: 1 };
}

function saveQuranProgress(surah: number, ayah: number) {
  localStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify({ lastSurah: surah, lastAyah: ayah }));
}

function getBookmarks(): BookmarkedAyah[] {
  const saved = localStorage.getItem(QURAN_BOOKMARKS_KEY);
  if (saved) return JSON.parse(saved);
  return [];
}

function saveBookmarks(bookmarks: BookmarkedAyah[]) {
  localStorage.setItem(QURAN_BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

function getKhatamSessions(): KhatamSession[] {
  const saved = localStorage.getItem(QURAN_KHATAM_KEY);
  if (saved) return JSON.parse(saved);
  return [];
}

function saveKhatamSessions(sessions: KhatamSession[]) {
  localStorage.setItem(QURAN_KHATAM_KEY, JSON.stringify(sessions));
}

function getDaysRemaining(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// Strip bismillah prefix from ayah text, handling various Unicode diacritics
function stripBismillahFromAyah(t: string): string {
  // Remove diacritics AND replace alef wasla (ٱ) with regular alef (ا)
  const diacritics = /[\u064B-\u0670\u06D6-\u06ED\u08F0-\u08FF\u0640]/g;
  const normalized = t.replace(/\u0671/g, '\u0627').replace(/\u06CC/g, '\u064A').replace(diacritics, '');
  const bismillahPlain = '\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645';
  if (normalized.trimStart().startsWith(bismillahPlain)) {
    // Count base characters (non-diacritical, non-space) in the bismillah to find cut point
    const targetBaseChars = bismillahPlain.replace(/\s/g, '').length;
    let baseCount = 0;
    let cutIdx = 0;
    for (let ci = 0; ci < t.length; ci++) {
      const ch = t[ci];
      // Skip diacritics and whitespace
      if (/[\u064B-\u0670\u06D6-\u06ED\u08F0-\u08FF\u0640\s]/.test(ch)) continue;
      // Count alef wasla as a base char (it maps to alef)
      baseCount++;
      if (baseCount === targetBaseChars) {
        cutIdx = ci + 1;
        break;
      }
    }
    return t.slice(cutIdx).trim();
  }
  return t;
}

// Shared background gradient
const BgBlobs = () => (
  <>
    <div className="absolute pointer-events-none" style={{ width: '100%', height: 286, left: 0, top: 0, background: 'var(--page-header-bg)', zIndex: 0 }} />
  </>
);

const Quran = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [surahLoading, setSurahLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedSurah, setBookmarkedSurah] = useState<number>(getQuranProgress().lastSurah);
  const [bookmarkedAyah, setBookmarkedAyah] = useState<number>(getQuranProgress().lastAyah);
  const [bookmarks, setBookmarks] = useState<BookmarkedAyah[]>(getBookmarks());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAyahForAction, setSelectedAyahForAction] = useState<Ayah | null>(null);
  const [viewMode, setViewMode] = useState<"surah" | "juz">("surah");
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [juzAyahs, setJuzAyahs] = useState<Ayah[]>([]);
  const [juzLoading, setJuzLoading] = useState(false);
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  const [showKhatam, setShowKhatam] = useState(false);
  const [khatamSessions, setKhatamSessions] = useState<KhatamSession[]>(getKhatamSessions());
  const [showNewKhatam, setShowNewKhatam] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(30);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  // Khatam detail
  const [khatamDetailId, setKhatamDetailId] = useState<string | null>(null);
  const [khatamDetailViewMode, setKhatamDetailViewMode] = useState<"surah" | "juz">("surah");
  const [khatamDetailSearch, setKhatamDetailSearch] = useState("");
  // Track whether user is reading from khatam detail context
  const [khatamReadingId, setKhatamReadingId] = useState<string | null>(null);
  const [showKhatamMenu, setShowKhatamMenu] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);

  const progress = { lastSurah: bookmarkedSurah, lastAyah: bookmarkedAyah };

  const activeKhatam = khatamSessions.filter((s) => !s.completed);
  const completedKhatam = khatamSessions.filter((s) => s.completed);

  // Cache migration: clear old alquran.cloud caches on first run
  useEffect(() => {
    if (!localStorage.getItem("kala_quran_v2_migrated")) {
      localStorage.removeItem("kala_quran_surahs");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("kala_quran_surah_")) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("kala_quran_v2_migrated", "1");
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("kala_quran_surahs");
    if (cached) {
      setSurahs(JSON.parse(cached));
      setSurahLoading(false);
      return;
    }
    fetch("https://equran.id/api/v2/surat")
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 200) {
          const mapped: Surah[] = data.data.map((s: any) => ({
            number: s.nomor,
            name: s.nama,
            englishName: s.namaLatin,
            englishNameTranslation: s.arti,
            numberOfAyahs: s.jumlahAyat,
            revelationType: s.tempatTurun,
          }));
          setSurahs(mapped);
          localStorage.setItem("kala_quran_surahs", JSON.stringify(mapped));
        }
      })
      .finally(() => setSurahLoading(false));
  }, []);

  const loadSurah = useCallback(async (surahNum: number) => {
    setLoading(true);
    setSelectedSurah(surahNum);
    try {
      const cacheKey = `kala_quran_surah_${surahNum}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setAyahs(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const res = await fetch(`https://equran.id/api/v2/surat/${surahNum}`);
      const data = await res.json();
      if (data.code === 200) {
        const merged: Ayah[] = data.data.ayat.map((a: any) => {
          let text: string = a.teksArab;
          if (a.nomorAyat === 1 && surahNum !== 1 && surahNum !== 9) {
            text = stripBismillahFromAyah(text);
          }
          return {
            number: a.nomorAyat,
            text,
            numberInSurah: a.nomorAyat,
            translation: a.teksIndonesia || "",
            transliteration: a.teksLatin || "",
          };
        });
        setAyahs(merged);
        try { localStorage.setItem(cacheKey, JSON.stringify(merged)); } catch { /* storage full */ }
      }
    } catch {
      setAyahs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSurahFromKhatam = useCallback(async (surahNum: number, khatamId: string) => {
    setKhatamReadingId(khatamId);
    await loadSurah(surahNum);
  }, [loadSurah]);

  const loadJuz = useCallback(async (juzNum: number) => {
    setJuzLoading(true);
    setSelectedJuz(juzNum);
    try {
      const juz = JUZ_DATA[juzNum - 1];
      // Find surah number range for this juz using the surahs list
      const startSurahNum = surahs.find((s) => s.englishName === juz.startSurah)?.number;
      const endSurahNum = surahs.find((s) => s.englishName === juz.endSurah)?.number;
      if (!startSurahNum || !endSurahNum) { setJuzAyahs([]); return; }

      const surahNums: number[] = [];
      for (let i = startSurahNum; i <= endSurahNum; i++) surahNums.push(i);

      const results = await Promise.all(
        surahNums.map((sn) => fetch(`https://equran.id/api/v2/surat/${sn}`).then((r) => r.json()).catch(() => null))
      );

      const allAyahs: Ayah[] = [];
      results.forEach((res, idx) => {
        if (!res?.data?.ayat) return;
        const sn = surahNums[idx];
        const surahName = surahs.find((s) => s.number === sn)?.englishName || "";
        const ayat: any[] = res.data.ayat;

        // Filter ayahs based on juz boundaries
        const filtered = ayat.filter((a: any) => {
          if (sn === startSurahNum && sn === endSurahNum) return a.nomorAyat >= juz.startAyah && a.nomorAyat <= juz.endAyah;
          if (sn === startSurahNum) return a.nomorAyat >= juz.startAyah;
          if (sn === endSurahNum) return a.nomorAyat <= juz.endAyah;
          return true;
        });

        filtered.forEach((a: any) => {
          let text: string = a.teksArab;
          if (a.nomorAyat === 1 && sn !== 1 && sn !== 9) {
            text = stripBismillahFromAyah(text);
          }
          allAyahs.push({
            number: a.nomorAyat,
            text,
            numberInSurah: a.nomorAyat,
            translation: a.teksIndonesia || "",
            transliteration: a.teksLatin || "",
            surahNumber: sn,
            surahName,
          });
        });
      });
      setJuzAyahs(allAyahs);
    } catch {
      setJuzAyahs([]);
    } finally {
      setJuzLoading(false);
    }
  }, [surahs]);

  useEffect(() => {
    if (!loading && ayahs.length > 0 && selectedSurah === bookmarkedSurah) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${bookmarkedAyah}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [loading, ayahs, selectedSurah, bookmarkedSurah, bookmarkedAyah]);

  const handleAyahTap = (ayah: Ayah) => {
    setSelectedAyahForAction(ayah);
    setDrawerOpen(true);
  };

  const handleMarkLastRead = () => {
    if (!selectedAyahForAction) return;
    const surahNum = selectedAyahForAction.surahNumber ?? selectedSurah;
    if (surahNum === null || surahNum === undefined) return;
    saveQuranProgress(surahNum, selectedAyahForAction.numberInSurah);
    setBookmarkedSurah(surahNum);
    setBookmarkedAyah(selectedAyahForAction.numberInSurah);
    toast.success("Terakhir dibaca disimpan ✓");
    setDrawerOpen(false);
  };

  const handleCopyAyah = () => {
    if (!selectedAyahForAction) return;
    const surahNum = selectedAyahForAction.surahNumber ?? selectedSurah;
    const surah = surahs.find((s) => s.number === surahNum);
    const surahLabel = selectedAyahForAction.surahName || surah?.englishName || "";
    const text = `${selectedAyahForAction.text}\n\n${selectedAyahForAction.translation || ""}\n\n— ${surahLabel} : ${selectedAyahForAction.numberInSurah}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Ayat berhasil disalin");
    }).catch(() => {
      toast.error("Gagal menyalin ayat");
    });
    setDrawerOpen(false);
  };

  const handleToggleCheckpoint = () => {
    if (!selectedAyahForAction) return;
    const surahNum = selectedAyahForAction.surahNumber ?? selectedSurah;
    if (surahNum === null || surahNum === undefined) return;
    const surah = surahs.find((s) => s.number === surahNum);
    const surahLabel = selectedAyahForAction.surahName || surah?.englishName || "";
    const exactMatch = bookmarks.findIndex(
      (b) => b.surah === surahNum && b.ayahNumber === selectedAyahForAction.numberInSurah
    );
    let updated: BookmarkedAyah[];
    if (exactMatch !== -1) {
      updated = bookmarks.filter((_, i) => i !== exactMatch);
      toast.success("Checkpoint dihapus");
    } else {
      updated = bookmarks.filter((b) => b.surah !== surahNum);
      updated.push({
        surah: surahNum,
        surahName: surahLabel,
        ayahNumber: selectedAyahForAction.numberInSurah,
        arabicText: selectedAyahForAction.text,
        translation: selectedAyahForAction.translation || "",
      });
      toast.success("Checkpoint disimpan ✓");
    }
    setBookmarks(updated);
    saveBookmarks(updated);
    setDrawerOpen(false);
  };

  const handleKhatamCheckpoint = () => {
    if (!selectedAyahForAction || !khatamReadingId) return;
    // In juz mode, use surahNumber from the ayah; in surah mode, use selectedSurah
    const surahNum = selectedAyahForAction.surahNumber ?? selectedSurah;
    const surahLabel = selectedAyahForAction.surahName
      ?? surahs.find((s) => s.number === selectedSurah)?.englishName
      ?? "";
    if (surahNum === null || surahNum === undefined) return;
    const updated = khatamSessions.map((s) =>
      s.id === khatamReadingId
        ? {
            ...s,
            checkpointSurah: surahNum,
            checkpointSurahName: surahLabel,
            checkpointAyah: selectedAyahForAction.numberInSurah,
          }
        : s
    );
    setKhatamSessions(updated);
    saveKhatamSessions(updated);
    toast.success("Checkpoint khatam disimpan ✓");
    setDrawerOpen(false);
  };

  const handleCreateKhatam = () => {
    const days = useCustom ? parseInt(customDuration) : selectedDuration;
    if (!days || days < 1 || isNaN(days)) {
      toast.error("Masukkan durasi yang valid");
      return;
    }
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() + days);
    const session: KhatamSession = {
      id: Date.now().toString(),
      startDate: now.toISOString(),
      durationDays: days,
      targetDate: target.toISOString(),
      completed: false,
    };
    const updated = [...khatamSessions, session];
    setKhatamSessions(updated);
    saveKhatamSessions(updated);
    setShowNewKhatam(false);
    setSelectedDuration(30);
    setCustomDuration("");
    setUseCustom(false);
    toast.success(`Target khatam ${days} hari dibuat ✓`);
  };

  const handleDeleteKhatam = (id: string) => {
    const updated = khatamSessions.filter((s) => s.id !== id);
    setKhatamSessions(updated);
    saveKhatamSessions(updated);
    toast.success("Khatam dihapus");
  };

  const handleCompleteKhatam = (id: string) => {
    const updated = khatamSessions.map((s) =>
      s.id === id ? { ...s, completed: true, completedDate: new Date().toISOString() } : s
    );
    setKhatamSessions(updated);
    saveKhatamSessions(updated);
    toast.success("Selamat, khatam tercatat! 🎉");
  };

  const isAyahBookmarked = (surahNum: number, ayahNum: number) =>
    bookmarks.some((b) => b.surah === surahNum && b.ayahNumber === ayahNum);

  const filteredSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getSurahTranslation(s.number) || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery
  );

  const filteredKhatamSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(khatamDetailSearch.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(khatamDetailSearch.toLowerCase()) ||
      (getSurahTranslation(s.number) || "").toLowerCase().includes(khatamDetailSearch.toLowerCase()) ||
      s.number.toString() === khatamDetailSearch
  );

  const currentSurahForDrawer = surahs.find((s) => s.number === selectedSurah);
  const isSelectedBookmarked = selectedAyahForAction && selectedSurah !== null
    ? isAyahBookmarked(selectedSurah, selectedAyahForAction.numberInSurah)
    : false;
  const isSelectedLastRead = selectedAyahForAction && selectedSurah !== null
    ? bookmarkedSurah === selectedSurah && bookmarkedAyah === selectedAyahForAction.numberInSurah
    : false;

  const activeKhatamSession = khatamReadingId ? khatamSessions.find((s) => s.id === khatamReadingId) : null;
  const isKhatamCheckpointed = activeKhatamSession
    && selectedSurah !== null
    && selectedAyahForAction !== null
    && activeKhatamSession.checkpointSurah === selectedSurah
    && activeKhatamSession.checkpointAyah === selectedAyahForAction?.numberInSurah;

  // ──────────────────────────────────────────────
  // SURAH READING VIEW
  // ──────────────────────────────────────────────
  if (selectedSurah !== null) {
    const surah = surahs.find((s) => s.number === selectedSurah);
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button
              onClick={() => {
                setSelectedSurah(null);
                setAyahs([]);
                if (khatamReadingId) {
                  setKhatamDetailId(khatamReadingId);
                  setKhatamReadingId(null);
                }
              }}
              className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
            </button>
            <div className="flex-1 text-center pr-10">
              <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>{surah?.englishName}</h1>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{getSurahTranslation(surah?.number || 0) || surah?.englishNameTranslation} · {surah?.numberOfAyahs} ayat</span>
            </div>
          </div>

          {khatamReadingId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: 'var(--c-badge-green-bg)', border: '1px solid var(--c-badge-green-dark-bg)' }}>
              <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-badge-green-medium-text)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--c-badge-green-dark-text)' }}>Membaca untuk Khatam · ketuk ayat untuk checkpoint</span>
            </div>
          )}

          {selectedSurah !== 1 && selectedSurah !== 9 && (
            <div className="text-center py-4">
              <span className="text-2xl font-arabic" style={{ color: 'var(--c-text)', fontFamily: "'LPMQ IsepMisbah', 'Scheherazade New', serif" }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#34D399' }} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-6">
              {ayahs.map((ayah) => {
                const isLastRead = bookmarkedSurah === selectedSurah && bookmarkedAyah === ayah.numberInSurah;
                const isSaved = isAyahBookmarked(selectedSurah, ayah.numberInSurah);
                const isKhatamCp = activeKhatamSession
                  && activeKhatamSession.checkpointSurah === selectedSurah
                  && activeKhatamSession.checkpointAyah === ayah.numberInSurah;
                return (
                  <div key={ayah.number} id={`ayah-${ayah.numberInSurah}`}
                    onClick={() => handleAyahTap(ayah)}
                    className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.99] relative overflow-hidden"
                    style={{
                      background: isKhatamCp ? 'var(--c-badge-green-dark-bg)' : isLastRead ? 'var(--c-badge-green-bg)' : isSaved ? 'var(--c-badge-yellow-bg)' : 'var(--c-surface)',
                      border: isKhatamCp ? '1.5px solid var(--c-badge-green-border)' : isLastRead ? '1.5px solid var(--c-badge-green-border)' : isSaved ? '1.5px solid #FDE68A' : '1px solid var(--c-border-warm)',
                      boxShadow: 'var(--s-card-light)',
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold"
                          style={{ background: isLastRead ? '#38CA5E' : 'var(--c-badge-green-bg)', color: isLastRead ? '#FFFFFF' : 'var(--c-badge-green-text)' }}>
                          {ayah.numberInSurah}
                        </div>
                        {isLastRead && <BookOpen className="h-4 w-4" style={{ color: '#38CA5E' }} />}
                        {isSaved && <Flag className="h-4 w-4" style={{ color: '#F59E0B' }} />}
                        {isKhatamCp && <MapPin className="h-4 w-4" style={{ color: 'var(--c-badge-green-medium-text)' }} />}
                      </div>
                    </div>
                    <p className="text-right text-xl leading-loose" dir="rtl" style={{ color: 'var(--c-text)', fontFamily: "'LPMQ IsepMisbah', 'Scheherazade New', serif", lineHeight: 2.2 }}>{ayah.text}</p>
                    {ayah.transliteration && <p className="text-sm italic leading-relaxed" style={{ color: 'var(--c-transliteration)' }}>{ayah.transliteration}</p>}
                    {ayah.translation && <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{ayah.translation}</p>}
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                {selectedSurah > 1 && (
                  <button onClick={() => loadSurah(selectedSurah - 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm"
                    style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>
                    <ChevronLeft className="h-4 w-4" /> Surah Sebelumnya
                  </button>
                )}
                {selectedSurah < 114 && (
                  <button onClick={() => loadSurah(selectedSurah + 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm"
                    style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #D1FAE5 100%)', color: '#065F46' }}>
                    Surah Selanjutnya <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="rounded-t-3xl">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-base font-bold" style={{ color: 'var(--c-text)' }}>
                {currentSurahForDrawer?.englishName} : {selectedAyahForAction?.numberInSurah}
              </DrawerTitle>
              <DrawerDescription className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Pilih aksi untuk ayat ini</DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-2 px-4 pb-6">
              {khatamReadingId && (
                <button onClick={handleKhatamCheckpoint}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                  style={{ background: isKhatamCheckpointed ? 'var(--c-badge-green-bg)' : 'var(--c-surface-alt)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-green-dark-bg)' }}>
                    <MapPin className="h-5 w-5" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{isKhatamCheckpointed ? 'Checkpoint Khatam (aktif)' : 'Set Checkpoint Khatam'}</span>
                    <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Tandai posisi baca khatam di ayat ini</span>
                  </div>
                </button>
              )}
              <button onClick={handleCopyAyah}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                style={{ background: 'var(--c-surface-alt)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-blue-bg)' }}>
                  <Copy className="h-5 w-5" style={{ color: 'var(--c-badge-blue-text)' }} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Salin Ayat</span>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Salin teks Arab & terjemahan</span>
                </div>
              </button>
              {!khatamReadingId && (
                <>
                  <button onClick={handleToggleCheckpoint}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                    style={{ background: 'var(--c-surface-alt)' }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-yellow-bg)' }}>
                      <Flag className="h-5 w-5" style={{ color: isSelectedBookmarked ? '#F59E0B' : 'var(--c-badge-yellow-text)' }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{isSelectedBookmarked ? 'Hapus Checkpoint' : 'Simpan Checkpoint'}</span>
                      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{isSelectedBookmarked ? 'Hapus checkpoint di surah ini' : 'Tandai ayat ini sebagai checkpoint'}</span>
                    </div>
                  </button>
                  <button onClick={handleMarkLastRead}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                    style={{ background: isSelectedLastRead ? 'var(--c-badge-green-bg)' : 'var(--c-surface-alt)' }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: isSelectedLastRead ? 'var(--c-badge-green-dark-bg)' : 'var(--c-badge-green-bg)' }}>
                      <BookMarked className="h-5 w-5" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{isSelectedLastRead ? 'Sudah Ditandai' : 'Tandai Terakhir Dibaca'}</span>
                      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{isSelectedLastRead ? 'Ayat ini adalah terakhir dibaca' : 'Lanjut membaca dari ayat ini nanti'}</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // CHECKPOINT LIST SCREEN
  // ──────────────────────────────────────────────
  if (showCheckpoints) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button onClick={() => setShowCheckpoints(false)} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Checkpoint</h1>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <Flag className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--c-disabled)' }} />
              <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Belum ada checkpoint</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-6">
              {bookmarks.map((bm, i) => (
                <motion.button key={`${bm.surah}-${bm.ayahNumber}`}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  onClick={() => {
                    setShowCheckpoints(false);
                    loadSurah(bm.surah).then(() => {
                      setTimeout(() => {
                        const el = document.getElementById(`ayah-${bm.ayahNumber}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 500);
                    });
                  }}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ background: 'var(--c-badge-yellow-bg)' }}>
                    <Flag className="h-4 w-4" style={{ color: 'var(--c-badge-yellow-text)' }} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--c-text)' }}>{bm.surahName} : Ayat {bm.ayahNumber}</span>
                    <span className="text-xs truncate" style={{ color: 'var(--c-text-muted)' }}>{bm.translation.slice(0, 80)}{bm.translation.length > 80 ? '...' : ''}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-text-completed)' }} />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // KHATAM DETAIL SCREEN
  // ──────────────────────────────────────────────
  if (khatamDetailId) {
    const session = khatamSessions.find((s) => s.id === khatamDetailId);
    if (!session) { setKhatamDetailId(null); return null; }
    const daysLeft = getDaysRemaining(session.targetDate);
    const elapsed = session.durationDays - daysLeft;
    const pct = Math.min(Math.max((elapsed / session.durationDays) * 100, 0), 100);

    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button onClick={() => { setKhatamDetailId(null); setShowKhatam(true); }} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Khatam</h1>
            <div className="relative">
              <button onClick={() => setShowKhatamMenu(!showKhatamMenu)} className="p-2 rounded-full">
                <MoreVertical className="h-5 w-5" style={{ color: 'var(--c-text-secondary)' }} />
              </button>
              {showKhatamMenu && (
                <div className="absolute right-0 top-10 rounded-2xl py-2 z-50 min-w-[160px]"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-complex)' }}>
                  {!session.completed && (
                    <button onClick={() => { handleCompleteKhatam(session.id); setShowKhatamMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm" style={{ color: 'var(--c-badge-green-medium-text)' }}>
                      ✅ Tandai Selesai
                    </button>
                  )}
                  <button onClick={() => { handleDeleteKhatam(session.id); setShowKhatamMenu(false); setKhatamDetailId(null); setShowKhatam(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm" style={{ color: '#EF4444' }}>
                    🗑 Hapus Khatam
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress card */}
          <div className="rounded-3xl p-5 flex flex-col gap-3"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" style={{ color: 'var(--c-badge-yellow-text)' }} />
                <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>Target {session.durationDays} Hari</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: daysLeft < 0 ? '#FEE2E2' : 'var(--c-badge-green-bg)', color: daysLeft < 0 ? '#EF4444' : 'var(--c-badge-green-medium-text)' }}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlewat` : `${daysLeft} hari lagi`}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs" style={{ color: 'var(--c-text-muted)' }}>
                <span>Mulai {formatDate(session.startDate)}</span>
                <span>Target {formatDate(session.targetDate)}</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-fill)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6EE7B7, #38CA5E)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--c-badge-green-medium-text)' }}>{Math.round(pct)}% waktu berlalu</span>
            </div>

            {session.checkpointSurah ? (
              <>
                <div className="h-px w-full" style={{ background: 'var(--c-divider)' }} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold" style={{ color: 'var(--c-text)' }}>Terakhir: {session.checkpointSurahName}</span>
                      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Ayat {session.checkpointAyah}</span>
                    </div>
                  </div>
                  <button onClick={() => {
                    setKhatamDetailId(null);
                    loadSurahFromKhatam(session.checkpointSurah!, session.id).then(() => {
                      if (session.checkpointAyah) {
                        setTimeout(() => {
                          const el = document.getElementById(`ayah-${session.checkpointAyah}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 500);
                      }
                    });
                  }}
                    className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: 'var(--c-badge-green-dark-bg)', color: 'var(--c-badge-green-medium-text)' }}>
                    Lanjut Baca
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-fill)' }}>
                  <div className="h-full rounded-full" style={{ width: '0%', background: 'linear-gradient(90deg, #6EE7B7, #38CA5E)' }} />
                </div>
                <span className="text-xs text-center" style={{ color: 'var(--c-text-completed)' }}>Belum ada checkpoint · buka surah dan tandai ayat terakhir dibaca</span>
              </div>
            )}
          </div>

          {/* Surah / Juz tabs */}
          <div className="flex gap-2">
            {(["surah", "juz"] as const).map((mode) => (
              <button key={mode} onClick={() => setKhatamDetailViewMode(mode)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: khatamDetailViewMode === mode ? 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)' : 'var(--c-surface-alt)',
                  border: khatamDetailViewMode === mode ? '1px solid #FFFFFF' : '1px solid var(--c-border-warm)',
                  color: khatamDetailViewMode === mode ? '#065F46' : 'var(--c-text-secondary)',
                  boxShadow: khatamDetailViewMode === mode ? 'var(--s-small)' : 'none',
                }}>
                {mode === "surah" ? "Surah" : "Juz"}
              </button>
            ))}
          </div>

          {khatamDetailViewMode === "surah" && (
            <>
              <input type="text" placeholder="Cari surah..." value={khatamDetailSearch}
                onChange={(e) => setKhatamDetailSearch(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)', color: 'var(--c-text)' }} />
              {surahLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" style={{ color: '#34D399' }} /></div>
              ) : (
                <div className="flex flex-col gap-2 pb-6">
                  {filteredKhatamSurahs.map((surah, i) => {
                    const isCp = session.checkpointSurah === surah.number;
                    return (
                      <motion.button key={surah.number} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.01, 0.3) }}
                        onClick={() => { setKhatamDetailId(null); loadSurahFromKhatam(surah.number, session.id); }}
                        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                        style={{ background: 'var(--c-surface)', border: isCp ? '1.5px solid #6EE7B7' : '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold"
                          style={{ background: isCp ? 'var(--c-badge-green-dark-bg)' : 'var(--c-surface-alt)', color: isCp ? 'var(--c-badge-green-medium-text)' : 'var(--c-text-dark)' }}>
                          {surah.number}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm truncate" style={{ color: 'var(--c-text)' }}>{surah.englishName}</span>
                            {isCp && <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--c-badge-green-medium-text)' }} />}
                          </div>
                          <span className="text-xs truncate" style={{ color: 'var(--c-text-muted)' }}>
                            {getSurahTranslation(surah.number) || surah.englishNameTranslation} · {surah.numberOfAyahs} ayat
                            {isCp ? ` · Ayat ${session.checkpointAyah}` : ''}
                          </span>
                        </div>
                        <span className="text-base font-arabic flex-shrink-0" style={{ color: 'var(--c-text)', fontFamily: "'LPMQ IsepMisbah', 'Scheherazade New', serif" }}>{surah.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {khatamDetailViewMode === "juz" && (
            <div className="flex flex-col gap-2 pb-6">
              {JUZ_DATA.map((juz, i) => (
                <motion.button key={juz.number} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => { setKhatamDetailId(null); setKhatamReadingId(session.id); loadJuz(juz.number); }}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold"
                    style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>{juz.number}</div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Juz {juz.number}</span>
                    <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{juz.startSurah} : {juz.startAyah} — {juz.endSurah} : {juz.endAyah}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-text-completed)' }} />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // KHATAM LIST SCREEN
  // ──────────────────────────────────────────────
  if (showKhatam) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button onClick={() => { setShowKhatam(false); setShowNewKhatam(false); }} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Khatam</h1>
          </div>

          {showNewKhatam ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-5 flex flex-col gap-4"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-subtle)' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base" style={{ color: 'var(--c-text)' }}>Target Khatam Baru</span>
                <button onClick={() => setShowNewKhatam(false)}><X className="h-5 w-5" style={{ color: 'var(--c-text-completed)' }} /></button>
              </div>
              <div>
                <span className="text-xs font-semibold mb-2 block" style={{ color: 'var(--c-text-secondary)' }}>Pilih durasi</span>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_TEMPLATES.map((d) => (
                    <button key={d} onClick={() => { setSelectedDuration(d); setUseCustom(false); }}
                      className="rounded-2xl py-3 flex flex-col items-center gap-0.5 transition-all"
                      style={{
                        background: !useCustom && selectedDuration === d ? 'linear-gradient(180deg, #7DF8AD 0%, #D1FAE5 100%)' : 'var(--c-surface-alt)',
                        border: !useCustom && selectedDuration === d ? '1px solid #FFFFFF' : '1px solid var(--c-border-warm)',
                        boxShadow: !useCustom && selectedDuration === d ? 'var(--s-btn)' : 'none',
                      }}>
                      <span className="font-bold text-sm" style={{ color: !useCustom && selectedDuration === d ? '#065F46' : 'var(--c-text-dark)' }}>{d}</span>
                      <span className="text-[10px]" style={{ color: !useCustom && selectedDuration === d ? '#059669' : 'var(--c-text-completed)' }}>hari</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold mb-2 block" style={{ color: 'var(--c-text-secondary)' }}>Atau masukkan manual</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setUseCustom(true)}
                    className="flex items-center justify-center h-5 w-5 rounded-full border-2 flex-shrink-0 transition-all"
                    style={{ borderColor: useCustom ? '#38CA5E' : 'var(--c-disabled)', background: useCustom ? '#38CA5E' : 'transparent' }}>
                    {useCustom && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <input type="number" min="1" placeholder="Contoh: 120" value={customDuration}
                    onFocus={() => setUseCustom(true)}
                    onChange={(e) => { setCustomDuration(e.target.value); setUseCustom(true); }}
                    className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--c-surface-alt)', border: useCustom ? '1.5px solid #38CA5E' : '1px solid var(--c-border-warm)', color: 'var(--c-text)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--c-text-secondary)' }}>hari</span>
                </div>
              </div>
              {((!useCustom && selectedDuration) || (useCustom && customDuration)) && (
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--c-badge-green-bg)', border: '1px solid var(--c-badge-green-dark-bg)' }}>
                  <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                  <span className="text-xs" style={{ color: 'var(--c-badge-green-dark-text)' }}>
                    Target selesai pada{' '}
                    <span className="font-bold">
                      {(() => {
                        const d = useCustom ? parseInt(customDuration) : selectedDuration!;
                        if (!d || isNaN(d)) return '...';
                        const t = new Date(); t.setDate(t.getDate() + d);
                        return formatDate(t.toISOString());
                      })()}
                    </span>
                  </span>
                </div>
              )}
              <button onClick={handleCreateKhatam} className="w-full rounded-2xl py-3.5 font-semibold text-sm"
                style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #D1FAE5 100%)', color: '#065F46' }}>
                Buat Target Khatam
              </button>
            </motion.div>
          ) : (
            <button onClick={() => setShowNewKhatam(true)}
              className="w-full rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'var(--c-badge-green-bg)', border: '1.5px dashed #6EE7B7' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-green-dark-bg)' }}>
                <Plus className="h-4 w-4" style={{ color: 'var(--c-badge-green-medium-text)' }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: 'var(--c-badge-green-medium-text)' }}>Buat Target Khatam Baru</span>
            </button>
          )}

          {activeKhatam.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold px-1" style={{ color: 'var(--c-text-secondary)' }}>SEDANG BERJALAN</span>
              {activeKhatam.map((session, i) => {
                const daysLeft = getDaysRemaining(session.targetDate);
                const elapsed = session.durationDays - daysLeft;
                const pct = Math.min(Math.max((elapsed / session.durationDays) * 100, 0), 100);
                return (
                  <motion.button key={session.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { setShowKhatam(false); setKhatamDetailId(session.id); }}
                    className="w-full rounded-2xl p-4 flex flex-col gap-3 text-left active:scale-[0.99] transition-transform"
                    style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" style={{ color: 'var(--c-badge-yellow-text)' }} />
                        <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{session.durationDays} Hari</span>
                      </div>
                      <ChevronRight className="h-4 w-4" style={{ color: 'var(--c-text-completed)' }} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs" style={{ color: 'var(--c-text-muted)' }}>
                        <span>Mulai {formatDate(session.startDate)}</span>
                        <span>Target {formatDate(session.targetDate)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-fill)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6EE7B7, #38CA5E)' }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--c-badge-green-medium-text)' }}>{Math.round(pct)}% berlalu</span>
                        <span style={{ color: daysLeft < 0 ? '#EF4444' : 'var(--c-text-muted)' }}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlewat` : `${daysLeft} hari lagi`}
                        </span>
                      </div>
                      {session.checkpointSurah && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                          <span className="text-xs" style={{ color: 'var(--c-badge-green-medium-text)' }}>
                            Checkpoint: {session.checkpointSurahName} Ayat {session.checkpointAyah}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {completedKhatam.length > 0 && (
            <div className="flex flex-col gap-2 pb-6">
              <span className="text-xs font-semibold px-1" style={{ color: 'var(--c-text-secondary)' }}>SELESAI</span>
              {completedKhatam.map((session, i) => (
                <motion.div key={session.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: 'var(--c-surface-hover)', border: '1px solid var(--c-border-warm)' }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0" style={{ background: 'var(--c-badge-green-dark-bg)' }}>
                    <Check className="h-4 w-4" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Khatam {session.durationDays} Hari</span>
                    <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Selesai {formatDate(session.completedDate || session.targetDate)}</span>
                  </div>
                  <button onClick={() => handleDeleteKhatam(session.id)}><X className="h-4 w-4" style={{ color: 'var(--c-disabled)' }} /></button>
                </motion.div>
              ))}
            </div>
          )}

          {khatamSessions.length === 0 && !showNewKhatam && (
            <div className="text-center py-16">
              <Trophy className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--c-disabled)' }} />
              <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Belum ada target khatam</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // JUZ READING VIEW
  // ──────────────────────────────────────────────
  if (selectedJuz !== null) {
    const juz = JUZ_DATA.find((j) => j.number === selectedJuz);
    const isKhatamJuz = !!khatamReadingId;
    const khatamSession = khatamReadingId ? khatamSessions.find((s) => s.id === khatamReadingId) : null;

    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button onClick={() => {
              setSelectedJuz(null); setJuzAyahs([]);
              if (khatamReadingId) { setKhatamDetailId(khatamReadingId); setKhatamReadingId(null); }
            }} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
            </button>
            <div className="flex-1 text-center pr-10">
              <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Juz {selectedJuz}</h1>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{juz?.startSurah} — {juz?.endSurah}</span>
            </div>
          </div>

          {isKhatamJuz && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: 'var(--c-badge-green-bg)', border: '1px solid var(--c-badge-green-dark-bg)' }}>
              <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-badge-green-medium-text)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--c-badge-green-dark-text)' }}>Membaca untuk Khatam · ketuk ayat untuk checkpoint</span>
            </div>
          )}

          {juzLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" style={{ color: '#34D399' }} /></div>
          ) : (
            <div className="flex flex-col gap-4 pb-6">
              {juzAyahs.map((ayah) => {
                const isKhatamCp = khatamSession && khatamSession.checkpointSurah === ayah.surahNumber && khatamSession.checkpointAyah === ayah.numberInSurah;
                const isLastRead = bookmarkedSurah === ayah.surahNumber && bookmarkedAyah === ayah.numberInSurah;
                const isSaved = ayah.surahNumber ? isAyahBookmarked(ayah.surahNumber, ayah.numberInSurah) : false;
                return (
                  <div key={ayah.number} id={`juz-ayah-${ayah.surahNumber}-${ayah.numberInSurah}`}
                    onClick={() => handleAyahTap(ayah)}
                    className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.99]"
                    style={{
                      background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)',
                      boxShadow: 'var(--s-card-light)',
                      borderLeft: isKhatamCp ? '3px solid #059669' : isLastRead ? '3px solid #38CA5E' : isSaved ? '3px solid #F59E0B' : '1px solid var(--c-border-warm)',
                    }}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold"
                        style={{ background: isLastRead ? '#38CA5E' : 'var(--c-badge-green-bg)', color: isLastRead ? '#FFFFFF' : 'var(--c-badge-green-text)' }}>
                        {ayah.numberInSurah}
                      </div>
                      {ayah.surahName && <span className="text-xs font-medium" style={{ color: 'var(--c-text-completed)' }}>{ayah.surahName}</span>}
                      {isLastRead && <BookOpen className="h-4 w-4" style={{ color: '#38CA5E' }} />}
                      {isSaved && <Flag className="h-4 w-4" style={{ color: '#F59E0B' }} />}
                      {isKhatamCp && <MapPin className="h-4 w-4 ml-auto" style={{ color: 'var(--c-badge-green-medium-text)' }} />}
                    </div>
                    <p className="text-right text-xl leading-loose" dir="rtl" style={{ color: 'var(--c-text)', fontFamily: "'LPMQ IsepMisbah', 'Scheherazade New', serif", lineHeight: 2.2 }}>{ayah.text}</p>
                    {ayah.transliteration && <p className="text-sm italic leading-relaxed" style={{ color: 'var(--c-transliteration)' }}>{ayah.transliteration}</p>}
                    {ayah.translation && <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{ayah.translation}</p>}
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                {selectedJuz > 1 && (
                  <button onClick={() => loadJuz(selectedJuz - 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm"
                    style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>
                    <ChevronLeft className="h-4 w-4" /> Juz Sebelumnya
                  </button>
                )}
                {selectedJuz < 30 && (
                  <button onClick={() => loadJuz(selectedJuz + 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm"
                    style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #D1FAE5 100%)', color: '#065F46' }}>
                    Juz Selanjutnya <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="rounded-t-3xl">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-base font-bold" style={{ color: 'var(--c-text)' }}>
                {selectedAyahForAction?.surahName} : Ayat {selectedAyahForAction?.numberInSurah}
              </DrawerTitle>
              <DrawerDescription className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Pilih aksi untuk ayat ini</DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-2 px-4 pb-6">
              {khatamReadingId && (
                <button onClick={handleKhatamCheckpoint}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                  style={{ background: 'var(--c-surface-alt)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-green-dark-bg)' }}>
                    <MapPin className="h-5 w-5" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Set Checkpoint Khatam</span>
                    <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Tandai posisi baca khatam di ayat ini</span>
                  </div>
                </button>
              )}
              <button onClick={handleCopyAyah}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                style={{ background: 'var(--c-surface-alt)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-blue-bg)' }}>
                  <Copy className="h-5 w-5" style={{ color: 'var(--c-badge-blue-text)' }} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Salin Ayat</span>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Salin teks Arab & terjemahan</span>
                </div>
              </button>
              {!khatamReadingId && (
                <>
                  <button onClick={handleToggleCheckpoint}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                    style={{ background: 'var(--c-surface-alt)' }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-yellow-bg)' }}>
                      <Flag className="h-5 w-5" style={{ color: 'var(--c-badge-yellow-text)' }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>
                        {selectedAyahForAction && selectedAyahForAction.surahNumber && isAyahBookmarked(selectedAyahForAction.surahNumber, selectedAyahForAction.numberInSurah) ? 'Hapus Checkpoint' : 'Simpan Checkpoint'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Tandai ayat ini sebagai checkpoint</span>
                    </div>
                  </button>
                  <button onClick={handleMarkLastRead}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:opacity-80"
                    style={{ background: selectedAyahForAction && bookmarkedSurah === selectedAyahForAction.surahNumber && bookmarkedAyah === selectedAyahForAction.numberInSurah ? 'var(--c-badge-green-bg)' : 'var(--c-surface-alt)' }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-green-bg)' }}>
                      <BookMarked className="h-5 w-5" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>
                        {selectedAyahForAction && bookmarkedSurah === selectedAyahForAction.surahNumber && bookmarkedAyah === selectedAyahForAction.numberInSurah ? 'Sudah Ditandai' : 'Tandai Terakhir Dibaca'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Lanjut membaca dari ayat ini nanti</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // SURAH LIST / HOME VIEW
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
      <BgBlobs />
      <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
        <div className="flex items-center w-full">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Al-Quran</h1>
        </div>

        {progress.lastSurah > 0 && (
          <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={() => { if (activeKhatam.length > 0) { setShowContinueModal(true); } else { loadSurah(progress.lastSurah); } }}
            className="w-full rounded-3xl p-5 flex items-center gap-4"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid #FFFFFF', boxShadow: 'var(--s-small)' }}>
              <BookOpen className="h-5 w-5" style={{ color: '#334258' }} strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-base" style={{ color: 'var(--c-text)' }}>Lanjut Membaca</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                Surah {surahs.find((s) => s.number === progress.lastSurah)?.englishName || progress.lastSurah}
                {progress.lastAyah > 1 && `, Ayat ${progress.lastAyah}`}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 ml-auto" style={{ color: 'var(--c-text-completed)' }} />
          </motion.button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={() => setShowCheckpoints(true)}
            className="rounded-2xl p-4 flex flex-col gap-2 text-left"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-yellow-bg)' }}>
              <Flag className="h-4 w-4" style={{ color: 'var(--c-badge-yellow-text)' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>Checkpoint</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{bookmarks.length > 0 ? `${bookmarks.length} surah ditandai` : 'Belum ada'}</span>
            </div>
          </motion.button>

          <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
            onClick={() => setShowKhatam(true)}
            className="rounded-2xl p-4 flex flex-col gap-2 text-left"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--c-badge-green-dark-bg)' }}>
              <Trophy className="h-4 w-4" style={{ color: 'var(--c-badge-green-medium-text)' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>Khatam</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{activeKhatam.length > 0 ? `${activeKhatam.length} target aktif` : 'Buat target'}</span>
            </div>
          </motion.button>
        </div>

        <div className="flex gap-2">
          {(["surah", "juz"] as const).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
              style={{
                background: viewMode === mode ? 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)' : 'var(--c-surface-alt)',
                border: viewMode === mode ? '1px solid #FFFFFF' : '1px solid var(--c-border-warm)',
                color: viewMode === mode ? '#065F46' : 'var(--c-text-secondary)',
                boxShadow: viewMode === mode ? 'var(--s-small)' : 'none',
              }}>
              {mode === "surah" ? "Surah" : "Juz"}
            </button>
          ))}
        </div>

        {viewMode === "surah" && (
          <>
            <input type="text" placeholder="Cari surah..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)', color: 'var(--c-text)' }} />
            {surahLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" style={{ color: '#34D399' }} /></div>
            ) : (
              <div className="flex flex-col gap-2 pb-6">
                {filteredSurahs.map((surah, i) => (
                  <motion.button key={surah.number} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.01, 0.3) }}
                    onClick={() => loadSurah(surah.number)}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                    style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold"
                      style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>{surah.number}</div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--c-text)' }}>{surah.englishName}</span>
                      <span className="text-xs truncate" style={{ color: 'var(--c-text-muted)' }}>{getSurahTranslation(surah.number) || surah.englishNameTranslation} · {surah.numberOfAyahs} ayat</span>
                    </div>
                    <span className="text-base font-arabic flex-shrink-0" style={{ color: 'var(--c-text)', fontFamily: "'LPMQ IsepMisbah', 'Scheherazade New', serif" }}>{surah.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === "juz" && (
          <div className="flex flex-col gap-2 pb-6">
            {JUZ_DATA.map((juz, i) => (
              <motion.button key={juz.number} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => loadJuz(juz.number)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold"
                  style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>{juz.number}</div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Juz {juz.number}</span>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{juz.startSurah} : {juz.startAyah} — {juz.endSurah} : {juz.endAyah}</span>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-text-completed)' }} />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {showContinueModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'var(--c-overlay)' }}
          onClick={() => setShowContinueModal(false)}>
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl p-6 flex flex-col gap-3"
            style={{ background: 'var(--c-surface)', maxWidth: 480 }}>
            <div className="mx-auto mb-1 h-1.5 w-12 rounded-full" style={{ background: 'var(--c-divider)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--c-text)' }}>Lanjut Membaca</h2>
            <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Pilih mode membaca yang ingin dilanjutkan</p>

            <button onClick={() => { setShowContinueModal(false); loadSurah(progress.lastSurah); }}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left active:scale-[0.99] transition-all"
              style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ background: 'var(--c-badge-blue-bg)' }}>
                <BookOpen className="h-5 w-5" style={{ color: 'var(--c-badge-blue-text)' }} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Baca Al-Quran Biasa</span>
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                  Lanjut dari {surahs.find((s) => s.number === progress.lastSurah)?.englishName || `Surah ${progress.lastSurah}`}
                  {progress.lastAyah > 1 && `, Ayat ${progress.lastAyah}`}
                </span>
              </div>
            </button>

            {activeKhatam.map((session) => (
              <button key={session.id}
                onClick={() => {
                  setShowContinueModal(false);
                  const surahToLoad = session.checkpointSurah ?? 1;
                  setKhatamDetailId(null);
                  loadSurahFromKhatam(surahToLoad, session.id).then(() => {
                    if (session.checkpointAyah) {
                      setTimeout(() => {
                        const el = document.getElementById(`ayah-${session.checkpointAyah}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 500);
                    }
                  });
                }}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left active:scale-[0.99] transition-all"
                style={{ background: 'var(--c-badge-green-bg)', border: '1px solid var(--c-badge-green-dark-bg)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ background: 'var(--c-badge-green-dark-bg)' }}>
                  <Trophy className="h-5 w-5" style={{ color: 'var(--c-badge-green-medium-text)' }} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" style={{ color: 'var(--c-badge-green-dark-text)' }}>Lanjut Khatam</span>
                  <span className="text-xs" style={{ color: 'var(--c-badge-green-medium-text)' }}>
                    {session.checkpointSurah
                      ? `${session.checkpointSurahName || `Surah ${session.checkpointSurah}`}, Ayat ${session.checkpointAyah}`
                      : `Mulai dari Al-Fatihah`}
                    {' · '}Target {session.durationDays} hari
                  </span>
                </div>
              </button>
            ))}

            <button onClick={() => setShowContinueModal(false)}
              className="w-full py-3 rounded-2xl text-sm font-semibold mt-1"
              style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-muted)' }}>
              Batal
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Quran;
