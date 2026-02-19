import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BookOpen, ChevronRight, Loader2, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

const QURAN_PROGRESS_KEY = "kala_quran_progress";

function getQuranProgress(): { lastSurah: number; lastAyah: number } {
  const saved = localStorage.getItem(QURAN_PROGRESS_KEY);
  if (saved) return JSON.parse(saved);
  return { lastSurah: 1, lastAyah: 1 };
}

function saveQuranProgress(surah: number, ayah: number) {
  localStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify({ lastSurah: surah, lastAyah: ayah }));
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
  const progress = { lastSurah: bookmarkedSurah, lastAyah: bookmarkedAyah };

  // Fetch surah list
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

  // Fetch ayahs for selected surah
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

  // Auto-scroll to bookmarked ayah after loading
  useEffect(() => {
    if (!loading && ayahs.length > 0 && selectedSurah === bookmarkedSurah) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${bookmarkedAyah}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [loading, ayahs, selectedSurah, bookmarkedSurah, bookmarkedAyah]);

  const handleBookmark = (surahNum: number, ayahNum: number) => {
    saveQuranProgress(surahNum, ayahNum);
    setBookmarkedSurah(surahNum);
    setBookmarkedAyah(ayahNum);
    toast.success("Terakhir dibaca disimpan ✓");
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery
  );

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
                const isBookmarked = bookmarkedSurah === selectedSurah && bookmarkedAyah === ayah.numberInSurah;
                return (
                  <motion.div
                    key={ayah.number}
                    id={`ayah-${ayah.numberInSurah}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleBookmark(selectedSurah, ayah.numberInSurah)}
                    className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.99]"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #F3EDE6',
                      boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)',
                      borderLeft: isBookmarked ? '3px solid #38CA5E' : '1px solid #F3EDE6',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold"
                          style={{
                            background: isBookmarked ? '#38CA5E' : '#F0FDF4',
                            color: isBookmarked ? '#FFFFFF' : '#166534',
                          }}
                        >
                          {ayah.numberInSurah}
                        </div>
                        {isBookmarked && <Bookmark className="h-4 w-4" style={{ color: '#38CA5E' }} fill="#38CA5E" />}
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
      </div>
    </div>
  );
};

export default Quran;
