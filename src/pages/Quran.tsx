import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen, ChevronRight, Loader2, Bookmark, Copy, BookMarked, HandHeart } from "lucide-react";
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
}

interface BookmarkedAyah {
  surah: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translation: string;
}

const QURAN_PROGRESS_KEY = "kala_quran_progress";
const QURAN_BOOKMARKS_KEY = "kala_quran_bookmarks";

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
  const progress = { lastSurah: bookmarkedSurah, lastAyah: bookmarkedAyah };

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

  const handleToggleBookmark = () => {
    if (!selectedAyahForAction || selectedSurah === null) return;
    const surah = surahs.find((s) => s.number === selectedSurah);
    const existing = bookmarks.findIndex(
      (b) => b.surah === selectedSurah && b.ayahNumber === selectedAyahForAction.numberInSurah
    );
    let updated: BookmarkedAyah[];
    if (existing !== -1) {
      updated = bookmarks.filter((_, i) => i !== existing);
      toast.success("Bookmark dihapus");
    } else {
      updated = [
        ...bookmarks,
        {
          surah: selectedSurah,
          surahName: surah?.englishName || "",
          ayahNumber: selectedAyahForAction.numberInSurah,
          arabicText: selectedAyahForAction.text,
          translation: selectedAyahForAction.translation || "",
        },
      ];
      toast.success("Ditambahkan ke bookmark ✓");
    }
    setBookmarks(updated);
    saveBookmarks(updated);
    setDrawerOpen(false);
  };

  const isAyahBookmarked = (surahNum: number, ayahNum: number) =>
    bookmarks.some((b) => b.surah === surahNum && b.ayahNumber === ayahNum);

  const filteredSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery
  );

  const currentSurahForDrawer = surahs.find((s) => s.number === selectedSurah);
  const isSelectedBookmarked = selectedAyahForAction && selectedSurah !== null
    ? isAyahBookmarked(selectedSurah, selectedAyahForAction.numberInSurah)
    : false;
  const isSelectedLastRead = selectedAyahForAction && selectedSurah !== null
    ? bookmarkedSurah === selectedSurah && bookmarkedAyah === selectedAyahForAction.numberInSurah
    : false;

  // Surah reading view
  if (selectedSurah !== null) {
    const surah = surahs.find((s) => s.number === selectedSurah);
    return (
      <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
        <div className="absolute pointer-events-none" style={{ width: 560, height: 341, left: '50%', top: -209, transform: 'translateX(-50%)', background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0 }} />
        <div className="absolute pointer-events-none" style={{ width: 546, height: 521, left: 19, top: -535, background: '#00B4D8', filter: 'blur(100px)', transform: 'rotate(-76.22deg)', zIndex: 1 }} />
        <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
          <div className="flex items-center w-full">
            <button onClick={() => { setSelectedSurah(null); setAyahs([]); }} className="p-2 rounded-full">
              <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
            </button>
            <div className="flex-1 text-center pr-10">
              <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>{surah?.englishName}</h1>
              <span className="text-xs" style={{ color: '#838A96' }}>{surah?.englishNameTranslation} · {surah?.numberOfAyahs} ayat</span>
            </div>
          </div>

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
                      borderLeft: isLastRead ? '3px solid #38CA5E' : isSaved ? '3px solid #3B82F6' : '1px solid #F3EDE6',
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
                        {isSaved && <Bookmark className="h-4 w-4" style={{ color: '#3B82F6' }} fill="#3B82F6" />}
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

              {/* Bookmark */}
              <button
                onClick={handleToggleBookmark}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors active:bg-gray-50"
                style={{ background: '#F8F8F7' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: isSelectedBookmarked ? '#DBEAFE' : '#FEF3C7' }}>
                  <Bookmark className="h-5 w-5" style={{ color: isSelectedBookmarked ? '#3B82F6' : '#D97706' }} fill={isSelectedBookmarked ? '#3B82F6' : 'none'} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>
                    {isSelectedBookmarked ? 'Hapus Bookmark' : 'Tambah Bookmark'}
                  </span>
                  <span className="text-xs" style={{ color: '#838A96' }}>
                    {isSelectedBookmarked ? 'Hapus ayat dari daftar bookmark' : 'Simpan ayat ke daftar bookmark'}
                  </span>
                </div>
              </button>

              {/* Mark Last Read */}
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
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Surah list view
  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      <div className="absolute pointer-events-none" style={{ width: 560, height: 341, left: '50%', top: -209, transform: 'translateX(-50%)', background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ width: 546, height: 521, left: 19, top: -535, background: '#00B4D8', filter: 'blur(100px)', transform: 'rotate(-76.22deg)', zIndex: 1 }} />
      <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
        <div className="flex items-center w-full">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>Al-Quran</h1>
        </div>

        {/* Doa Harian link */}
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate('/doa')}
          className="w-full rounded-3xl p-4 flex items-center gap-4"
          style={{ background: '#FFFFFF', border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'linear-gradient(180deg, #F9FFD2 0%, #7DF8AD 100%)', border: '1px solid #FFFFFF', boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)' }}>
            <HandHeart className="h-5 w-5" style={{ color: '#334258' }} strokeWidth={2} />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-base" style={{ color: '#1D293D' }}>Doa Harian</span>
            <span className="text-xs" style={{ color: '#838A96' }}>Kumpulan doa sehari-hari</span>
          </div>
          <ChevronRight className="h-5 w-5 ml-auto" style={{ color: '#90A1B9' }} />
        </motion.button>

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

        {/* Bookmark list */}
        {bookmarks.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-semibold text-sm" style={{ color: '#1D293D' }}>Bookmark ({bookmarks.length})</span>
            </div>
            {bookmarks.map((bm, i) => (
              <motion.button
                key={`${bm.surah}-${bm.ayahNumber}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                onClick={() => {
                  setBookmarkedSurah(prev => prev);
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: '#F8F8F7' }}>
                  <Bookmark className="h-4 w-4" style={{ color: '#166534' }} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate" style={{ color: '#1D293D' }}>
                    {bm.surahName} : {bm.ayahNumber}
                  </span>
                  <span className="text-xs truncate" style={{ color: '#838A96' }}>
                    {bm.translation.slice(0, 60)}{bm.translation.length > 60 ? '...' : ''}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#90A1B9' }} />
              </motion.button>
            ))}
          </div>
        )}

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
              <motion.div
                key={juz.number}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="rounded-2xl p-4 flex items-center gap-4"
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quran;
