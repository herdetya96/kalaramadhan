import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Check, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  WAJIB_PRAYERS, DEFAULT_PRAYERS, fetchPrayerTimes, getWajibFromPrayers,
  loadDayData, saveDayData, getDayKey, type DayData, type PrayerSchedule } from
"@/lib/kala-utils";
import TrackerSunnahSection from "@/components/tracker/TrackerSunnahSection";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const Tracker = () => {
  const navigate = useNavigate();
  const realToday = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(realToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDayData(realToday));
  const [prayers, setPrayers] = useState<PrayerSchedule[]>(DEFAULT_PRAYERS);
  const [wajibPrayers, setWajibPrayers] = useState<PrayerSchedule[]>(WAJIB_PRAYERS);
  const [userCoords, setUserCoords] = useState<{lat: number;lon: number;} | null>(null);

  useEffect(() => {
    const savedCoords = localStorage.getItem("kala-user-coords");
    if (savedCoords) setUserCoords(JSON.parse(savedCoords));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => { setDayData(loadDayData(selectedDate)); }, [selectedDate]);

  useEffect(() => {
    if (!userCoords) return;
    fetchPrayerTimes(userCoords.lat, userCoords.lon, selectedDate)
      .then((fetched) => { setPrayers(fetched); setWajibPrayers(getWajibFromPrayers(fetched)); })
      .catch(() => { setPrayers(DEFAULT_PRAYERS); setWajibPrayers(WAJIB_PRAYERS); });
  }, [userCoords, selectedDate]);

  const updateDayData = useCallback((newData: DayData) => { setDayData(newData); saveDayData(selectedDate, newData); }, [selectedDate]);
  const togglePrayer = (index: number) => { const n = [...dayData.prayerCompleted]; n[index] = !n[index]; updateDayData({ ...dayData, prayerCompleted: n }); };
  const toggleSunnah = (id: string) => { updateDayData({ ...dayData, sunnahCompleted: { ...dayData.sunnahCompleted, [id]: !dayData.sunnahCompleted[id] } }); };
  const completeAll = () => { updateDayData({ ...dayData, prayerCompleted: [true, true, true, true, true] }); };

  const completedCount = dayData.prayerCompleted.filter(Boolean).length;
  const percentage = Math.round(completedCount / 5 * 100);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(realToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(startOfWeek); d.setDate(d.getDate() + i); return d; });
  }, []);

  const streak = useMemo(() => {
    const d = new Date(realToday);
    let found = false;
    for (let i = 0; i < 90; i++) { if (loadDayData(d).prayerCompleted.filter(Boolean).length === 5) { found = true; break; } d.setDate(d.getDate() - 1); }
    if (!found) return 0;
    let count = 0;
    while (true) { if (loadDayData(d).prayerCompleted.filter(Boolean).length === 5) { count++; d.setDate(d.getDate() - 1); } else break; }
    return count;
  }, [realToday, completedCount]);

  const dateTitle = selectedDate.toLocaleDateString("id-ID", { month: "long", day: "numeric", year: "numeric" });
  const isToday = getDayKey(selectedDate) === getDayKey(realToday);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage / 100 * circumference;

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
      <div className="absolute pointer-events-none" style={{ width: '100%', height: 286, left: 0, top: 0, background: 'var(--page-header-bg)', zIndex: 0 }} />

      <div className="relative z-10 flex flex-col items-center pt-6 px-4 gap-[16px]">
        <div className="flex flex-col items-center w-full">
          <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>
            {isToday ? "Today" : selectedDate.toLocaleDateString("id-ID", { weekday: "long" })}
          </h1>
          <span className="text-sm" style={{ color: 'var(--c-text-secondary)', letterSpacing: '-0.15px' }}>{dateTitle}</span>
        </div>

        <div className="flex items-start gap-0 w-full justify-between px-1">
          {weekDays.map((d, i) => {
            const isSelected = getDayKey(d) === getDayKey(selectedDate);
            const isTodayDate = getDayKey(d) === getDayKey(realToday);
            return (
              <button key={i} onClick={() => setSelectedDate(d)}
                className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
                style={{
                  width: 48, height: 64, borderRadius: isSelected ? 40 : 16,
                  ...(isSelected ? { background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid var(--c-surface)', boxShadow: 'var(--s-card)' } : {})
                }}>
                <span className="text-[10px] font-medium uppercase" style={{ color: isSelected ? 'var(--c-text-dark)' : 'var(--c-text-dim)', letterSpacing: '0.62px' }}>{DAY_LABELS[d.getDay()]}</span>
                <span className="text-lg font-bold" style={{ color: 'var(--c-text-dark)', letterSpacing: '-0.44px' }}>{d.getDate()}</span>
                {isTodayDate && !isSelected && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-green-accent)' }} />}
              </button>
            );
          })}
        </div>

        {/* Circular progress */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          <svg width="280" height="280" viewBox="0 0 280 280" className="absolute">
            <circle cx="140" cy="140" r={radius} fill="none" stroke="var(--c-progress-bg)" strokeWidth="20" strokeLinecap="round" />
            <circle cx="140" cy="140" r={radius} fill="none" stroke="url(#progressGrad)" strokeWidth="20" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform="rotate(-90 140 140)" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            <defs><linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7DF8AD" /><stop offset="100%" stopColor="#CAFF7B" /></linearGradient></defs>
          </svg>
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-sm font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Tracker Solat Wajib</span>
            <span className="font-semibold" style={{ fontSize: 48, color: 'var(--c-text)', letterSpacing: '-0.44px' }}>{percentage}%</span>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>{completedCount}/5 Completed</span>
          </div>
        </motion.div>

        {/* Streak card */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-3xl p-6 flex items-center justify-between"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>
              {streak > 0 ? `${streak} hari beruntun salat 5 waktu!` : 'Mulai streak salat 5 waktumu!'}
            </span>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>
              {streak > 0 ? 'Jangan sampai bolong ya solatnya!' : 'Selesaikan 5 sholat hari ini'}
            </span>
          </div>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: 'linear-gradient(180deg, #F87D7D 0%, #FFE2D2 100%)', border: '1px solid var(--c-surface)', boxShadow: 'var(--s-complex)', borderRadius: 40 }}>
            <span className="text-lg">🔥</span>
          </div>
        </motion.div>

        {/* Prayer list card */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="w-full rounded-3xl p-4 flex flex-col gap-3"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Sholat Wajib</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>{completedCount}/5</span>
              <button onClick={completeAll} className="text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid #FFFFFF', boxShadow: 'var(--s-complex)', color: '#314158' }}>
                Selesaikan semua
              </button>
            </div>
          </div>

          <div className="h-2 w-full rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3AE886 0%, #46C0F1 100%)' }} initial={{ width: 0 }} animate={{ width: `${completedCount / 5 * 100}%` }} transition={{ duration: 0.4 }} />
          </div>

          <div className="flex flex-col gap-2">
            {wajibPrayers.map((prayer, i) => {
              const completed = dayData.prayerCompleted[i];
              return (
                <motion.button key={prayer.name} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}
                  onClick={() => togglePrayer(i)} className="flex w-full items-center justify-between rounded-2xl p-4"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={completed ? { background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid var(--c-surface)', boxShadow: 'var(--s-complex)' } : { background: 'var(--c-surface-alt)' }}>
                      {completed && <Check className="h-5 w-5" style={{ color: 'var(--c-text-check)' }} strokeWidth={2.5} />}
                    </div>
                    <span className="font-semibold text-base" style={{ color: completed ? 'var(--c-text-completed)' : 'var(--c-text)', textDecoration: completed ? 'line-through' : 'none', letterSpacing: '-0.44px' }}>{prayer.name}</span>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--c-text-completed)', letterSpacing: '-0.15px' }}>{prayer.time}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <TrackerSunnahSection dayData={dayData} onToggleSunnah={toggleSunnah} />

        {/* Progress link */}
        <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          onClick={() => navigate('/progress')} className="w-full rounded-3xl p-5 flex items-center justify-between"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid var(--c-surface)', boxShadow: 'var(--s-small)' }}>
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--c-text-check)' }} strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-base" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Progress Bulanan</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Lihat konsistensi ibadahmu</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5" style={{ color: 'var(--c-text-completed)' }} />
        </motion.button>
      </div>
    </div>
  );
};

export default Tracker;
