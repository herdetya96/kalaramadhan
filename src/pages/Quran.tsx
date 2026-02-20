import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen, ChevronRight, Loader2, Copy, BookMarked, Flag, Trophy, Plus, X, Check, MapPin, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";

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

// Shared background blobs
const BgBlobs = () => (
  <>
    <div className="absolute pointer-events-none" style={{ width: 560, height: 341, left: '50%', top: -209, transform: 'translateX(-50%)', background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0 }} />
    <div className="absolute pointer-events-none" style={{ width: 546, height: 521, left: 19, top: -535, background: '#00B4D8', filter: 'blur(100px)', transform: 'rotate(-76.22deg)', zIndex: 1 }} />
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

  const progress = { lastSurah: bookmarkedSurah, lastAyah: bookmarkedAyah };

  const activeKhatam = khatamSessions.filter((s) => !s.completed);
  const completedKhatam = khatamSessions.filter((s) => s.completed);

  useEffect(() => {
    const cached = localStorage.getItem("kala_quran_surahs");
    if (cached) {
      setSurahs(JSON.parse(cached));
      setSurahLoading(false);
      return;
    }
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 200) {
          setSurahs(data.data);
          localStorage.setItem("kala_quran_surahs", JSON.stringify(data.data));
        }
      })
      .finally(() => setSurahLoading(false));
  }, []);

  const loadSurah = useCallback(async (surahNum: number) => {
    setLoading(true);
    setSelectedSurah(surahNum);
    try {
      const [arRes, idRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`).then((r) => r.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/id.indonesian`).then((r) => r.json()),
      ]);
      if (arRes.code === 200) {
        const arabic: Ayah[] = arRes.data.ayahs;
        const indo = idRes.code === 200 ? idRes.data.ayahs : [];
        const merged = arabic.map((a: Ayah, i: number) => ({
          ...a,
          translation: indo[i]?.text || "",
        }));
        setAyahs(merged);
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
      const [arRes, idRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/juz/${juzNum}/quran-uthmani`).then((r) => r.json()),
        fetch(`https://api.alquran.cloud/v1/juz/${juzNum}/id.indonesian`).then((r) => r.json()),
      ]);
      if (arRes.code === 200) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arabic = arRes.data.ayahs as any[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const indo = idRes.code === 200 ? (idRes.data.ayahs as any[]) : [];
        const merged: Ayah[] = arabic.map((a, i) => ({
          number: a.number,
          text: a.text,
          numberInSurah: a.numberInSurah,
          translation: indo[i]?.text || "",
          surahNumber: a.surah?.number,
          surahName: a.surah?.englishName,
        }));
        setJuzAyahs(merged);
      }
    } catch {
      setJuzAyahs([]);
    } finally {
      setJuzLoading(false);
    }
  }, []);

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
    if (!selectedAyahForAction || selectedSurah === null) return;
    saveQuranProgress(selectedSurah, selectedAyahForAction.numberInSurah);
    setBookmarkedSurah(selectedSurah);
    setBookmarkedAyah(selectedAyahForAction.numberInSurah);
    toast.success("Terakhir dibaca disimpan ✓");
    setDrawerOpen(false);
  };

  const handleCopyAyah = () => {
    if (!selectedAyahForAction) return;
    const surah = surahs.find((s) => s.number === selectedSurah);
    const text = `${selectedAyahForAction.text}\n\n${selectedAyahForAction.translation || ""}\n\n— ${surah?.englishName || ""} : ${selectedAyahForAction.numberInSurah}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Ayat berhasil disalin");
    }).catch(() => {
      toast.error("Gagal menyalin ayat");
    });
    setDrawerOpen(false);
  };

  const handleToggleCheckpoint = () => {
    if (!selectedAyahForAction || selectedSurah === null) return;
    const surah = surahs.find((s) => s.number === selectedSurah);
    const exactMatch = bookmarks.findIndex(
      (b) => b.surah === selectedSurah && b.ayahNumber === selectedAyahForAction.numberInSurah
    );
    let updated: BookmarkedAyah[];
    if (exactMatch !== -1) {
      updated = bookmarks.filter((_, i) => i !== exactMatch);
      toast.success("Checkpoint dihapus");
    } else {
      updated = bookmarks.filter((b) => b.surah !== selectedSurah);
      updated.push({
        surah: selectedSurah,
        surahName: surah?.englishName || "",
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
      s.number.toString() === searchQuery
  );

  const filteredKhatamSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(khatamDetailSearch.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(khatamDetailSearch.toLowerCase()) ||
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
      <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button
              onClick={() => {
                setSelectedSurah(null);
                setAyahs([]);
                // If came from khatam, go back to khatam detail
                if (khatamReadingId) {
                  setKhatamDetailId(khatamReadingId);
                  setKhatamReadingId(null);
                }
              }}
              className="p-2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
            </button>
            <div className="flex-1 text-center pr-10">
              <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>{surah?.englishName}</h1>
              <span className="text-xs" style={{ color: '#838A96' }}>{surah?.englishNameTranslation} · {surah?.numberOfAyahs} ayat</span>
            </div>
          </div>

          {/* Khatam context banner */}
          {khatamReadingId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
              <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: '#059669' }} />
              <span className="text-xs font-medium" style={{ color: '#065F46' }}>
                Membaca untuk Khatam · ketuk ayat untuk checkpoint
              </span>
            </div>
          )}

          {selectedSurah !== 1 && selectedSurah !== 9 && (
            <div className="text-center py-4">
              <span className="text-2xl font-arabic" style={{ color: '#1D293D', fontFamily: "'Scheherazade New', serif" }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
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
                  <motion.div
                    key={ayah.number}
                    id={`ayah-${ayah.numberInSurah}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleAyahTap(ayah)}
                    className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.99]"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #F3EDE6',
                      boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)',
                      borderLeft: isKhatamCp
                        ? '3px solid #059669'
                        : isLastRead
                        ? '3px solid #38CA5E'
                        : isSaved
                        ? '3px solid #F59E0B'
                        : '1px solid #F3EDE6',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold"
                          style={{
                            background: isLastRead ? '#38CA5E' : '#F0FDF4',
                            color: isLastRead ? '#FFFFFF' : '#166534',
                          }}
                        >
                          {ayah.numberInSurah}
                        </div>
                        {isLastRead && <BookOpen className="h-4 w-4" style={{ color: '#38CA5E' }} />}
                        {isSaved && <Flag className="h-4 w-4" style={{ color: '#F59E0B' }} />}
                        {isKhatamCp && <MapPin className="h-4 w-4" style={{ color: '#059669' }} />}
                      </div>
                    </div>

                    <p className="text-right text-xl leading-loose" dir="rtl" style={{ color: '#1D293D', fontFamily: "'Scheherazade New', 'Amiri', serif", lineHeight: 2.2 }}>
                      {ayah.text}
                    </p>

                    {ayah.translation && (
                      <p className="text-sm leading-relaxed" style={{ color: '#62748E' }}>{ayah.translation}</p>
                    )}
                  </motion.div>
                );
              })}

              <div className="flex gap-3 pt-2">
                {selectedSurah > 1 && (
                  <button onClick={() => loadSurah(selectedSurah - 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm" style={{ background: '#F8F8F7', color: '#314158' }}>
                    <ChevronLeft className="h-4 w-4" /> Surah Sebelumnya
                  </button>
                )}
                {selectedSurah < 114 && (
                  <button onClick={() => loadSurah(selectedSurah + 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm" style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #D1FAE5 100%)', color: '#065F46' }}>
                    Surah Selanjutnya <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="rounded-t-3xl">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-base font-bold" style={{ color: '#1D293D' }}>
                {currentSurahForDrawer?.englishName} : {selectedAyahForAction?.numberInSurah}
              </DrawerTitle>
              <DrawerDescription className="text-xs" style={{ color: '#838A96' }}>
                Pilih aksi untuk ayat ini
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-2 px-4 pb-6">
              {/* Khatam Checkpoint — only shown when reading from khatam */}
              {khatamReadingId && (
                <button
                  onClick={handleKhatamCheckpoint}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:bg-gray-50"
                  style={{ background: isKhatamCheckpointed ? '#F0FDF4' : '#F8F8F7' }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#D1FAE5' }}>
                    <MapPin className="h-5 w-5" style={{ color: '#059669' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>
                      {isKhatamCheckpointed ? 'Checkpoint Khatam (aktif)' : 'Set Checkpoint Khatam'}
                    </span>
                    <span className="text-xs" style={{ color: '#838A96' }}>
                      Tandai posisi baca khatam di ayat ini
                    </span>
                  </div>
                </button>
              )}

              {/* Copy */}
              <button
                onClick={handleCopyAyah}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:bg-gray-50"
                style={{ background: '#F8F8F7' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#E0F2FE' }}>
                  <Copy className="h-5 w-5" style={{ color: '#0284C7' }} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>Salin Ayat</span>
                  <span className="text-xs" style={{ color: '#838A96' }}>Salin teks Arab & terjemahan</span>
                </div>
              </button>

              {/* Checkpoint & Tandai Terakhir Dibaca — hidden when in khatam reading mode */}
              {!khatamReadingId && (
                <>
                  <button
                    onClick={handleToggleCheckpoint}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:bg-gray-50"
                    style={{ background: '#F8F8F7' }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#FEF3C7' }}>
                      <Flag className="h-5 w-5" style={{ color: isSelectedBookmarked ? '#F59E0B' : '#D97706' }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>
                        {isSelectedBookmarked ? 'Hapus Checkpoint' : 'Simpan Checkpoint'}
                      </span>
                      <span className="text-xs" style={{ color: '#838A96' }}>
                        {isSelectedBookmarked ? 'Hapus checkpoint di surah ini' : 'Tandai ayat ini sebagai checkpoint'}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleMarkLastRead}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:bg-gray-50"
                    style={{ background: isSelectedLastRead ? '#F0FDF4' : '#F8F8F7' }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: isSelectedLastRead ? '#D1FAE5' : '#ECFDF5' }}>
                      <BookMarked className="h-5 w-5" style={{ color: '#059669' }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>
                        {isSelectedLastRead ? 'Sudah Ditandai' : 'Tandai Terakhir Dibaca'}
                      </span>
                      <span className="text-xs" style={{ color: '#838A96' }}>
                        {isSelectedLastRead ? 'Ayat ini adalah terakhir dibaca' : 'Lanjut membaca dari ayat ini nanti'}
                      </span>
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
      <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button onClick={() => setShowCheckpoints(false)} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>Checkpoint</h1>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <Flag className="h-10 w-10 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
              <span className="text-sm" style={{ color: '#838A96' }}>Belum ada checkpoint</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-6">
              {bookmarks.map((bm, i) => (
                <motion.button
                  key={`${bm.surah}-${bm.ayahNumber}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
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
                  style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ background: '#FEF3C7' }}>
                    <Flag className="h-4 w-4" style={{ color: '#D97706' }} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm truncate" style={{ color: '#1D293D' }}>
                      {bm.surahName} : Ayat {bm.ayahNumber}
                    </span>
                    <span className="text-xs truncate" style={{ color: '#838A96' }}>
                      {bm.translation.slice(0, 80)}{bm.translation.length > 80 ? '...' : ''}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#90A1B9' }} />
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
  if (khatamDetailId !== null) {
    const session = khatamSessions.find((s) => s.id === khatamDetailId);
    if (!session) {
      setKhatamDetailId(null);
      return null;
    }
    const daysLeft = getDaysRemaining(session.targetDate);
    const elapsed = session.durationDays - daysLeft;
    const pct = Math.min(Math.max((elapsed / session.durationDays) * 100, 0), 100);

    return (
      <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          {/* Header */}
          <div className="flex items-center w-full">
            <button onClick={() => { setKhatamDetailId(null); setShowKhatam(true); }} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
                Khatam {session.durationDays} Hari
              </h1>
              <span className="text-xs" style={{ color: '#838A96' }}>
                Selesai {formatDate(session.targetDate)}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowKhatamMenu((v) => !v)}
                className="p-2 rounded-full"
              >
                <MoreVertical className="h-5 w-5" style={{ color: '#62748E' }} />
              </button>
              {showKhatamMenu && (
                <>
                  {/* Backdrop to close */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowKhatamMenu(false)}
                  />
                  <div
                    className="absolute right-0 top-10 z-50 flex flex-col rounded-2xl overflow-hidden"
                    style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 8px 24px rgba(0,0,0,0.10)', minWidth: 160 }}
                  >
                    {!session.completed && (
                      <button
                        onClick={() => { handleCompleteKhatam(session.id); setShowKhatamMenu(false); }}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                        style={{ color: '#059669' }}
                      >
                        <Check className="h-4 w-4" />
                        Tandai Selesai
                      </button>
                    )}
                    <button
                      onClick={() => { handleDeleteKhatam(session.id); setKhatamDetailId(null); setShowKhatam(true); setShowKhatamMenu(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                      style={{ color: '#EF4444' }}
                    >
                      <X className="h-4 w-4" />
                      Hapus Khatam
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reading progress card */}
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}>
            {session.checkpointSurah ? (
              <>
                {/* Reading progress based on checkpoint */}
                {(() => {
                  const readingPct = Math.round((session.checkpointSurah / 114) * 100);
                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold" style={{ color: '#62748E' }}>Progress Khatam</span>
                        <span className="text-xs font-bold" style={{ color: '#059669' }}>{readingPct}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${readingPct}%`, background: 'linear-gradient(90deg, #6EE7B7, #38CA5E)' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs" style={{ color: '#838A96' }}>
                        <span>Surah 1</span>
                        <span>Surah 114</span>
                      </div>
                    </>
                  );
                })()}

                {/* Checkpoint detail + lanjut button */}
                <div className="flex items-center gap-2 pt-1 rounded-xl px-3 py-2" style={{ background: '#F0FDF4' }}>
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#059669' }} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold" style={{ color: '#065F46' }}>
                      {session.checkpointSurahName} · Ayat {session.checkpointAyah}
                    </span>
                    <span className="text-[10px]" style={{ color: '#6EE7B7' }}>
                      Surah ke-{session.checkpointSurah} dari 114
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (session.checkpointSurah) {
                        setKhatamDetailId(null);
                        loadSurahFromKhatam(session.checkpointSurah, session.id).then(() => {
                          setTimeout(() => {
                            const el = document.getElementById(`ayah-${session.checkpointAyah}`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                          }, 500);
                        });
                      }
                    }}
                    className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: '#D1FAE5', color: '#059669' }}
                  >
                    Lanjut Baca
                  </button>
                </div>
              </>
            ) : (
              /* No checkpoint yet */
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full" style={{ width: '0%', background: 'linear-gradient(90deg, #6EE7B7, #38CA5E)' }} />
                </div>
                <span className="text-xs text-center" style={{ color: '#90A1B9' }}>
                  Belum ada checkpoint · buka surah dan tandai ayat terakhir dibaca
                </span>
              </div>
            )}
          </div>

          {/* Surah / Juz tabs */}
          <div className="flex gap-2">
            {(["surah", "juz"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setKhatamDetailViewMode(mode)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: khatamDetailViewMode === mode ? 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)' : '#F8F8F7',
                  border: khatamDetailViewMode === mode ? '1px solid #FFFFFF' : '1px solid #F3EDE6',
                  color: khatamDetailViewMode === mode ? '#065F46' : '#62748E',
                  boxShadow: khatamDetailViewMode === mode ? '0px 4px 14px rgba(0, 0, 0, 0.1)' : 'none',
                }}
              >
                {mode === "surah" ? "Surah" : "Juz"}
              </button>
            ))}
          </div>

          {/* Surah list */}
          {khatamDetailViewMode === "surah" && (
            <>
              <input
                type="text"
                placeholder="Cari surah..."
                value={khatamDetailSearch}
                onChange={(e) => setKhatamDetailSearch(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: '#F8F8F7', border: '1px solid #F3EDE6', color: '#1D293D' }}
              />
              {surahLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#34D399' }} />
                </div>
              ) : (
                <div className="flex flex-col gap-2 pb-6">
                  {filteredKhatamSurahs.map((surah, i) => {
                    const isCp = session.checkpointSurah === surah.number;
                    return (
                      <motion.button
                        key={surah.number}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.01, 0.3) }}
                        onClick={() => {
                          setKhatamDetailId(null);
                          loadSurahFromKhatam(surah.number, session.id);
                        }}
                        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                        style={{
                          background: '#FFFFFF',
                          border: isCp ? '1.5px solid #6EE7B7' : '1px solid #F3EDE6',
                          boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)',
                        }}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold"
                          style={{ background: isCp ? '#D1FAE5' : '#F8F8F7', color: isCp ? '#059669' : '#314158' }}
                        >
                          {surah.number}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm truncate" style={{ color: '#1D293D' }}>{surah.englishName}</span>
                            {isCp && <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#059669' }} />}
                          </div>
                          <span className="text-xs truncate" style={{ color: '#838A96' }}>
                            {surah.englishNameTranslation} · {surah.numberOfAyahs} ayat
                            {isCp ? ` · Ayat ${session.checkpointAyah}` : ''}
                          </span>
                        </div>
                        <span className="text-base font-arabic flex-shrink-0" style={{ color: '#1D293D', fontFamily: "'Scheherazade New', serif" }}>{surah.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Juz list */}
          {khatamDetailViewMode === "juz" && (
            <div className="flex flex-col gap-2 pb-6">
              {JUZ_DATA.map((juz, i) => (
                <motion.button
                  key={juz.number}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => {
                    setKhatamDetailId(null);
                    setKhatamReadingId(session.id);
                    loadJuz(juz.number);
                  }}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                  style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold" style={{ background: '#F8F8F7', color: '#314158' }}>
                    {juz.number}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>Juz {juz.number}</span>
                    <span className="text-xs" style={{ color: '#838A96' }}>
                      {juz.startSurah} : {juz.startAyah} — {juz.endSurah} : {juz.endAyah}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#90A1B9' }} />
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
      <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button onClick={() => { setShowKhatam(false); setShowNewKhatam(false); }} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>Khatam</h1>
          </div>

          {/* New Khatam form */}
          {showNewKhatam ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-5 flex flex-col gap-4"
              style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.08)' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base" style={{ color: '#1D293D' }}>Target Khatam Baru</span>
                <button onClick={() => setShowNewKhatam(false)}>
                  <X className="h-5 w-5" style={{ color: '#90A1B9' }} />
                </button>
              </div>

              <div>
                <span className="text-xs font-semibold mb-2 block" style={{ color: '#62748E' }}>Pilih durasi</span>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_TEMPLATES.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDuration(d); setUseCustom(false); }}
                      className="rounded-2xl py-3 flex flex-col items-center gap-0.5 transition-all"
                      style={{
                        background: !useCustom && selectedDuration === d ? 'linear-gradient(180deg, #7DF8AD 0%, #D1FAE5 100%)' : '#F8F8F7',
                        border: !useCustom && selectedDuration === d ? '1px solid #FFFFFF' : '1px solid #F3EDE6',
                        boxShadow: !useCustom && selectedDuration === d ? '0px 4px 14px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      <span className="font-bold text-sm" style={{ color: !useCustom && selectedDuration === d ? '#065F46' : '#314158' }}>{d}</span>
                      <span className="text-[10px]" style={{ color: !useCustom && selectedDuration === d ? '#059669' : '#90A1B9' }}>hari</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold mb-2 block" style={{ color: '#62748E' }}>Atau masukkan manual</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseCustom(true)}
                    className="flex items-center justify-center h-5 w-5 rounded-full border-2 flex-shrink-0 transition-all"
                    style={{ borderColor: useCustom ? '#38CA5E' : '#D1D5DB', background: useCustom ? '#38CA5E' : 'transparent' }}
                  >
                    {useCustom && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 120"
                    value={customDuration}
                    onFocus={() => setUseCustom(true)}
                    onChange={(e) => { setCustomDuration(e.target.value); setUseCustom(true); }}
                    className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: '#F8F8F7', border: useCustom ? '1.5px solid #38CA5E' : '1px solid #F3EDE6', color: '#1D293D' }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#62748E' }}>hari</span>
                </div>
              </div>

              {((!useCustom && selectedDuration) || (useCustom && customDuration)) && (
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
                  <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: '#059669' }} />
                  <span className="text-xs" style={{ color: '#065F46' }}>
                    Target selesai pada{' '}
                    <span className="font-bold">
                      {(() => {
                        const d = useCustom ? parseInt(customDuration) : selectedDuration!;
                        if (!d || isNaN(d)) return '...';
                        const t = new Date();
                        t.setDate(t.getDate() + d);
                        return formatDate(t.toISOString());
                      })()}
                    </span>
                  </span>
                </div>
              )}

              <button
                onClick={handleCreateKhatam}
                className="w-full rounded-2xl py-3.5 font-semibold text-sm"
                style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #D1FAE5 100%)', color: '#065F46' }}
              >
                Buat Target Khatam
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowNewKhatam(true)}
              className="w-full rounded-2xl p-4 flex items-center gap-3"
              style={{ background: '#F0FDF4', border: '1.5px dashed #6EE7B7' }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#D1FAE5' }}>
                <Plus className="h-4 w-4" style={{ color: '#059669' }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: '#059669' }}>Buat Target Khatam Baru</span>
            </button>
          )}

          {/* Active sessions */}
          {activeKhatam.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold px-1" style={{ color: '#62748E' }}>SEDANG BERJALAN</span>
              {activeKhatam.map((session, i) => {
                const daysLeft = getDaysRemaining(session.targetDate);
                const elapsed = session.durationDays - daysLeft;
                const pct = Math.min(Math.max((elapsed / session.durationDays) * 100, 0), 100);
                return (
                  <motion.button
                    key={session.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { setShowKhatam(false); setKhatamDetailId(session.id); }}
                    className="w-full rounded-2xl p-4 flex flex-col gap-3 text-left active:scale-[0.99] transition-transform"
                    style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" style={{ color: '#D97706' }} />
                        <span className="font-bold text-sm" style={{ color: '#1D293D' }}>{session.durationDays} Hari</span>
                      </div>
                      <ChevronRight className="h-4 w-4" style={{ color: '#90A1B9' }} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs" style={{ color: '#838A96' }}>
                        <span>Mulai {formatDate(session.startDate)}</span>
                        <span>Target {formatDate(session.targetDate)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6EE7B7, #38CA5E)' }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: '#059669' }}>{Math.round(pct)}% berlalu</span>
                        <span style={{ color: daysLeft < 0 ? '#EF4444' : '#838A96' }}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlewat` : `${daysLeft} hari lagi`}
                        </span>
                      </div>
                      {session.checkpointSurah && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3" style={{ color: '#059669' }} />
                          <span className="text-xs" style={{ color: '#059669' }}>
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

          {/* Completed sessions */}
          {completedKhatam.length > 0 && (
            <div className="flex flex-col gap-2 pb-6">
              <span className="text-xs font-semibold px-1" style={{ color: '#62748E' }}>SELESAI</span>
              {completedKhatam.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: '#F9FAFB', border: '1px solid #F3EDE6' }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0" style={{ background: '#D1FAE5' }}>
                    <Check className="h-4 w-4" style={{ color: '#059669' }} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>Khatam {session.durationDays} Hari</span>
                    <span className="text-xs" style={{ color: '#838A96' }}>
                      Selesai {formatDate(session.completedDate || session.targetDate)}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteKhatam(session.id)}>
                    <X className="h-4 w-4" style={{ color: '#D1D5DB' }} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {khatamSessions.length === 0 && !showNewKhatam && (
            <div className="text-center py-16">
              <Trophy className="h-10 w-10 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
              <span className="text-sm" style={{ color: '#838A96' }}>Belum ada target khatam</span>
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
      <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
        <BgBlobs />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button
              onClick={() => {
                setSelectedJuz(null);
                setJuzAyahs([]);
                if (khatamReadingId) {
                  setKhatamDetailId(khatamReadingId);
                  setKhatamReadingId(null);
                }
              }}
              className="p-2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
            </button>
            <div className="flex-1 text-center pr-10">
              <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>Juz {selectedJuz}</h1>
              <span className="text-xs" style={{ color: '#838A96' }}>{juz?.startSurah} — {juz?.endSurah}</span>
            </div>
          </div>

          {/* Khatam context banner */}
          {isKhatamJuz && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
              <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: '#059669' }} />
              <span className="text-xs font-medium" style={{ color: '#065F46' }}>
                Membaca untuk Khatam · ketuk ayat untuk checkpoint
              </span>
            </div>
          )}

          {juzLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#34D399' }} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-6">
              {juzAyahs.map((ayah) => {
                const isKhatamCp = khatamSession
                  && khatamSession.checkpointSurah === ayah.surahNumber
                  && khatamSession.checkpointAyah === ayah.numberInSurah;
                return (
                  <motion.div
                    key={ayah.number}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={isKhatamJuz ? () => handleAyahTap(ayah) : undefined}
                    className={isKhatamJuz ? "rounded-2xl p-4 flex flex-col gap-3 cursor-pointer active:scale-[0.99] transition-all" : "rounded-2xl p-4 flex flex-col gap-3"}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #F3EDE6',
                      boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)',
                      borderLeft: isKhatamCp ? '3px solid #059669' : '1px solid #F3EDE6',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold" style={{ background: '#F0FDF4', color: '#166534' }}>
                        {ayah.numberInSurah}
                      </div>
                      {ayah.surahName && (
                        <span className="text-xs font-medium" style={{ color: '#90A1B9' }}>{ayah.surahName}</span>
                      )}
                      {isKhatamCp && <MapPin className="h-4 w-4 ml-auto" style={{ color: '#059669' }} />}
                    </div>
                    <p className="text-right text-xl leading-loose" dir="rtl" style={{ color: '#1D293D', fontFamily: "'Scheherazade New', 'Amiri', serif", lineHeight: 2.2 }}>
                      {ayah.text}
                    </p>
                    {ayah.translation && (
                      <p className="text-sm leading-relaxed" style={{ color: '#62748E' }}>{ayah.translation}</p>
                    )}
                  </motion.div>
                );
              })}

              <div className="flex gap-3 pt-2">
                {selectedJuz > 1 && (
                  <button onClick={() => loadJuz(selectedJuz - 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm" style={{ background: '#F8F8F7', color: '#314158' }}>
                    <ChevronLeft className="h-4 w-4" /> Juz Sebelumnya
                  </button>
                )}
                {selectedJuz < 30 && (
                  <button onClick={() => loadJuz(selectedJuz + 1)} className="flex-1 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm" style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #D1FAE5 100%)', color: '#065F46' }}>
                    Juz Selanjutnya <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer — khatam juz context */}
        {isKhatamJuz && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="rounded-t-3xl">
              <DrawerHeader className="pb-2">
                <DrawerTitle className="text-base font-bold" style={{ color: '#1D293D' }}>
                  {selectedAyahForAction?.surahName} : Ayat {selectedAyahForAction?.numberInSurah}
                </DrawerTitle>
                <DrawerDescription className="text-xs" style={{ color: '#838A96' }}>
                  Pilih aksi untuk ayat ini
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-2 px-4 pb-6">
                <button
                  onClick={handleKhatamCheckpoint}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:bg-gray-50"
                  style={{ background: '#F8F8F7' }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#D1FAE5' }}>
                    <MapPin className="h-5 w-5" style={{ color: '#059669' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>Set Checkpoint Khatam</span>
                    <span className="text-xs" style={{ color: '#838A96' }}>Tandai posisi baca khatam di ayat ini</span>
                  </div>
                </button>
                <button
                  onClick={handleCopyAyah}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:bg-gray-50"
                  style={{ background: '#F8F8F7' }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#E0F2FE' }}>
                    <Copy className="h-5 w-5" style={{ color: '#0284C7' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>Salin Ayat</span>
                    <span className="text-xs" style={{ color: '#838A96' }}>Salin teks Arab & terjemahan</span>
                  </div>
                </button>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // SURAH LIST / HOME VIEW
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      <BgBlobs />
      <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
        <div className="flex items-center w-full">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>Al-Quran</h1>
        </div>

        {progress.lastSurah > 0 && (
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => loadSurah(progress.lastSurah)}
            className="w-full rounded-3xl p-5 flex items-center gap-4"
            style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid #FFFFFF', boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)' }}>
              <BookOpen className="h-5 w-5" style={{ color: '#334258' }} strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-base" style={{ color: '#1D293D' }}>Lanjut Membaca</span>
              <span className="text-xs" style={{ color: '#838A96' }}>
                Surah {surahs.find((s) => s.number === progress.lastSurah)?.englishName || progress.lastSurah}
                {progress.lastAyah > 1 && `, Ayat ${progress.lastAyah}`}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 ml-auto" style={{ color: '#90A1B9' }} />
          </motion.button>
        )}

        {/* Checkpoint + Khatam 2-column cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setShowCheckpoints(true)}
            className="rounded-2xl p-4 flex flex-col gap-2 text-left"
            style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#FEF3C7' }}>
              <Flag className="h-4 w-4" style={{ color: '#D97706' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm" style={{ color: '#1D293D' }}>Checkpoint</span>
              <span className="text-xs" style={{ color: '#838A96' }}>
                {bookmarks.length > 0 ? `${bookmarks.length} surah ditandai` : 'Belum ada'}
              </span>
            </div>
          </motion.button>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            onClick={() => setShowKhatam(true)}
            className="rounded-2xl p-4 flex flex-col gap-2 text-left"
            style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#D1FAE5' }}>
              <Trophy className="h-4 w-4" style={{ color: '#059669' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm" style={{ color: '#1D293D' }}>Khatam</span>
              <span className="text-xs" style={{ color: '#838A96' }}>
                {activeKhatam.length > 0 ? `${activeKhatam.length} target aktif` : 'Buat target'}
              </span>
            </div>
          </motion.button>
        </div>

        {/* Surah / Juz tabs */}
        <div className="flex gap-2">
          {(["surah", "juz"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
              style={{
                background: viewMode === mode ? 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)' : '#F8F8F7',
                border: viewMode === mode ? '1px solid #FFFFFF' : '1px solid #F3EDE6',
                color: viewMode === mode ? '#065F46' : '#62748E',
                boxShadow: viewMode === mode ? '0px 4px 14px rgba(0, 0, 0, 0.1)' : 'none',
              }}
            >
              {mode === "surah" ? "Surah" : "Juz"}
            </button>
          ))}
        </div>

        {viewMode === "surah" && (
          <>
            <input
              type="text"
              placeholder="Cari surah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
              style={{ background: '#F8F8F7', border: '1px solid #F3EDE6', color: '#1D293D' }}
            />
            {surahLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#34D399' }} />
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-6">
                {filteredSurahs.map((surah, i) => (
                  <motion.button
                    key={surah.number}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.01, 0.3) }}
                    onClick={() => loadSurah(surah.number)}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                    style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold" style={{ background: '#F8F8F7', color: '#314158' }}>
                      {surah.number}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-sm truncate" style={{ color: '#1D293D' }}>{surah.englishName}</span>
                      <span className="text-xs truncate" style={{ color: '#838A96' }}>{surah.englishNameTranslation} · {surah.numberOfAyahs} ayat</span>
                    </div>
                    <span className="text-base font-arabic flex-shrink-0" style={{ color: '#1D293D', fontFamily: "'Scheherazade New', serif" }}>{surah.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === "juz" && (
          <div className="flex flex-col gap-2 pb-6">
            {JUZ_DATA.map((juz, i) => (
              <motion.button
                key={juz.number}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => loadJuz(juz.number)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold" style={{ background: '#F8F8F7', color: '#314158' }}>
                  {juz.number}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>Juz {juz.number}</span>
                  <span className="text-xs" style={{ color: '#838A96' }}>
                    {juz.startSurah} : {juz.startAyah} — {juz.endSurah} : {juz.endAyah}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#90A1B9' }} />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quran;
