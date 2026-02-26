import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { getDayKey, loadDayData, saveDayData, isRamadan, gregorianToHijri, DEFAULT_PRAYERS, fetchPrayerTimes, type DayData, type PrayerSchedule } from "@/lib/kala-utils";

const PUASA_TASKS = [
  { id: "sahur", label: "Makan Sahur" },
  { id: "puasa", label: "Puasa Ramadhan" },
  { id: "sedekah", label: "Sedekah" },
  { id: "terawih", label: "Sholat Terawih" },
];

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const Puasa = () => {
  const realToday = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(realToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDayData(realToday));
  const [prayers, setPrayers] = useState<PrayerSchedule[]>(DEFAULT_PRAYERS);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [imsakiyahData, setImsakiyahData] = useState<{ imsak: string; subuh: string; maghrib: string }[]>([]);

  // Load coords
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

  // Fetch prayer times for selected date
  useEffect(() => {
    if (!userCoords) return;
    fetchPrayerTimes(userCoords.lat, userCoords.lon, selectedDate)
      .then((fetched) => setPrayers(fetched))
      .catch(() => setPrayers(DEFAULT_PRAYERS));
  }, [userCoords, selectedDate]);

  // Fetch full Ramadan month imsakiyah from Aladhan hijri calendar API
  useEffect(() => {
    if (!userCoords) return;
    const hijri = gregorianToHijri(realToday);
    const ramadanYear = hijri.month <= 9 ? hijri.year : hijri.year + 1;
    const cacheKey = `kala-imsakiyah-${ramadanYear}-${userCoords.lat.toFixed(2)}-${userCoords.lon.toFixed(2)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setImsakiyahData(JSON.parse(cached));
      return;
    }
    fetch(`https://api.aladhan.com/v1/hijriCalendar/9/${ramadanYear}?latitude=${userCoords.lat}&longitude=${userCoords.lon}&method=20`)
      .then(r => r.json())
      .then(data => {
        if (data.code === 200 && data.data) {
          const schedule = data.data.map((day: any) => ({
            imsak: day.timings.Imsak?.split(' ')[0] || '-',
            subuh: day.timings.Fajr?.split(' ')[0] || '-',
            maghrib: day.timings.Maghrib?.split(' ')[0] || '-',
          }));
          setImsakiyahData(schedule);
          localStorage.setItem(cacheKey, JSON.stringify(schedule));
        }
      })
      .catch(() => {});
  }, [userCoords]);

  useEffect(() => {
    setDayData(loadDayData(selectedDate));
  }, [selectedDate]);

  const updateDayData = useCallback((newData: DayData) => {
    setDayData(newData);
    saveDayData(selectedDate, newData);
  }, [selectedDate]);

  const toggle = (id: string) => {
    const newSunnah = { ...dayData.sunnahCompleted, [id]: !dayData.sunnahCompleted[id] };
    updateDayData({ ...dayData, sunnahCompleted: newSunnah });
  };

  const completeAll = () => {
    const newSunnah = { ...dayData.sunnahCompleted };
    PUASA_TASKS.forEach((t) => { newSunnah[t.id] = true; });
    updateDayData({ ...dayData, sunnahCompleted: newSunnah });
  };

  const completedCount = PUASA_TASKS.filter((t) => dayData.sunnahCompleted[t.id]).length;
  const percentage = Math.round((completedCount / PUASA_TASKS.length) * 100);

  // Ramadan info
  const ramadan = isRamadan(selectedDate);
  const dayOfRamadan = ramadan.isRamadan ? ramadan.dayOfRamadan : 1;

  // Days until Eid (approx: Ramadan is 30 days)
  const daysToEid = ramadan.isRamadan ? Math.max(0, 30 - dayOfRamadan) : 0;

  // Week days around selected date
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const navigateWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  // Streak — find the most recent day with puasa, then count consecutive days backwards
  const streak = useMemo(() => {
    const d = new Date(realToday);
    // Find the most recent day with puasa checked (scan up to 90 days back)
    let found = false;
    for (let i = 0; i < 90; i++) {
      const data = loadDayData(d);
      if (data.sunnahCompleted["puasa"]) {
        found = true;
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    if (!found) return 0;
    // Count consecutive days from that point backwards
    let count = 0;
    while (true) {
      const data = loadDayData(d);
      if (data.sunnahCompleted["puasa"]) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  }, [realToday, dayData]);

  const dateTitle = selectedDate.toLocaleDateString("id-ID", { month: "long", day: "numeric", year: "numeric" });
  const isToday = getDayKey(selectedDate) === getDayKey(realToday);

  // Circular progress
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
      <div className="absolute pointer-events-none" style={{ width: '100%', height: 286, left: 0, top: 0, background: 'var(--page-header-bg)', zIndex: 0 }} />

      <div className="relative z-10 flex flex-col items-center pt-6 px-4 gap-4">
        {/* Header with week nav */}
        <div className="flex items-center justify-between w-full">
          <button onClick={() => navigateWeek(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Ramadhan Tracker</h1>
            <span className="text-sm font-medium" style={{ color: 'var(--c-text-secondary)', letterSpacing: '-0.15px' }}>{dateTitle}</span>
          </div>
          <button onClick={() => navigateWeek(1)} className="p-2 rounded-full">
            <ChevronRight className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
          </button>
        </div>

        {/* Week day selector */}
        <div className="flex items-start gap-0 w-full justify-between px-1" style={{ scrollbarWidth: 'none' }}>
          {weekDays.map((d, i) => {
            const isSelected = getDayKey(d) === getDayKey(selectedDate);
            const isTodayDate = getDayKey(d) === getDayKey(realToday);
            const dData = loadDayData(d);
            const hasPuasa = dData.sunnahCompleted["puasa"];
            return (
              <button key={i} onClick={() => setSelectedDate(d)}
                className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
                style={{
                  width: 48, height: 64,
                  borderRadius: isSelected ? 40 : 16,
                  ...(isSelected ? {
                    background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                    border: '1px solid #314158',
                    boxShadow: 'var(--s-card)',
                  } : {}),
                }}>
                <span className="text-[10px] font-medium uppercase" style={{ color: isSelected ? '#314158' : 'var(--c-text-dim)', letterSpacing: '0.62px' }}>
                  {DAY_LABELS[d.getDay()]}
                </span>
                <span className="text-lg font-bold" style={{ color: isSelected ? '#314158' : 'var(--c-text-dark)', letterSpacing: '-0.44px' }}>
                  {d.getDate()}
                </span>
                {isTodayDate && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-green-accent)' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Top card - Puasa hari ke-X */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-3xl p-4 flex flex-col gap-4"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)' }}>
          <div className="flex items-center gap-4">
            <div className="flex flex-col flex-1 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Puasa Hari ke-{dayOfRamadan}</span>
                <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>Selalu semangat ya!</span>
              </div>
              <div className="flex items-center px-3 py-1.5 rounded-full self-start"
                style={{ border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
                <span className="text-xs font-bold" style={{ color: '#38CA5E' }}>
                  {daysToEid > 0 ? `${daysToEid} hari menuju Lebaran!` : '🎉 Selamat Hari Raya!'}
                </span>
              </div>
            </div>
            <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 86, height: 86 }}>
              <svg width="86" height="86" viewBox="0 0 86 86">
                <circle cx="43" cy="43" r={radius} fill="none" stroke="var(--c-progress-bg)" strokeWidth="8" strokeLinecap="round" />
                <circle cx="43" cy="43" r={radius} fill="none" stroke="url(#puasaGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform="rotate(-90 43 43)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                <defs><linearGradient id="puasaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7DF8AD" /><stop offset="100%" stopColor="#CAFF7B" /></linearGradient></defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.13px' }}>{percentage}%</span>
              </div>
            </div>
          </div>

          {/* Imsak & Buka Puasa times */}
          <div className="flex gap-3 w-full">
            <div className="flex-1 flex flex-col items-center justify-center py-3 rounded-2xl"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)' }}>
              <span className="text-2xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>
                {prayers.find(p => p.name === "Imsak")?.time || "04:55"}
              </span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>Imsak</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-3 rounded-2xl"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)' }}>
              <span className="text-2xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>
                {prayers.find(p => p.name === "Maghrib")?.time || "18:02"}
              </span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>Buka Puasa</span>
            </div>
          </div>
        </motion.div>

        {/* Streak card */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
          className="w-full rounded-3xl p-6 flex items-center justify-between"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>
              {streak > 0 ? `${streak} hari beruntun puasa!` : 'Mulai streak puasamu!'}
            </span>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>
              {streak > 0 ? 'Jangan sampai bolong ya puasanya!' : 'Tandai puasa untuk memulai'}
            </span>
          </div>
          <div className="flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, background: 'linear-gradient(180deg, #F87D7D 0%, #FFE2D2 100%)',
              border: '1px solid #FFFFFF', boxShadow: 'var(--s-complex)', borderRadius: 40 }}>
            <span className="text-lg">🔥</span>
          </div>
        </motion.div>

        {/* Puasa Tracker checklist card */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="w-full rounded-3xl p-4 flex flex-col gap-3"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Puasa Tracker</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>
                {completedCount}/{PUASA_TASKS.length}
              </span>
              <button onClick={completeAll} className="text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid #FFFFFF', boxShadow: 'var(--s-complex)', color: '#314158' }}>
                Selesaikan semua
              </button>
            </div>
          </div>
          <div className="h-2 w-full rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3AE886 0%, #46C0F1 100%)' }}
              initial={{ width: 0 }} animate={{ width: `${(completedCount / PUASA_TASKS.length) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div className="flex flex-col gap-2">
            {PUASA_TASKS.map((task, i) => {
              const completed = dayData.sunnahCompleted[task.id];
              return (
                <motion.button key={task.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }} onClick={() => toggle(task.id)}
                  className="flex w-full items-center justify-between rounded-2xl p-4"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={completed ? {
                        background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                        border: '1px solid #FFFFFF', boxShadow: 'var(--s-complex)',
                      } : { background: 'var(--c-surface-alt)' }}>
                      {completed && <Check className="h-5 w-5" style={{ color: '#334258' }} strokeWidth={2.5} />}
                    </div>
                    <span className="font-semibold text-base"
                      style={{ color: completed ? 'var(--c-text-completed)' : 'var(--c-text)', textDecoration: completed ? 'line-through' : 'none', letterSpacing: '-0.44px' }}>
                      {task.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Jadwal Imsakiyah */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="w-full rounded-3xl p-4 flex flex-col gap-3"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Jadwal Imsakiyah</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border-warm)' }}>
            <div className="grid grid-cols-4 gap-0 px-4 py-2.5" style={{ background: 'var(--c-surface-alt)' }}>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--c-text-muted)' }}>Hari</span>
              <span className="text-[10px] font-semibold text-center" style={{ color: 'var(--c-text-muted)' }}>Imsak</span>
              <span className="text-[10px] font-semibold text-center" style={{ color: 'var(--c-text-muted)' }}>Subuh</span>
              <span className="text-[10px] font-semibold text-center" style={{ color: 'var(--c-text-muted)' }}>Maghrib</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {Array.from({ length: imsakiyahData.length || 30 }, (_, i) => {
                const daySchedule = imsakiyahData[i];
                const imsakTime = daySchedule?.imsak || prayers.find(p => p.name === "Imsak")?.time || "-";
                const subuhTime = daySchedule?.subuh || prayers.find(p => p.name === "Subuh")?.time || "-";
                const maghribTime = daySchedule?.maghrib || prayers.find(p => p.name === "Maghrib")?.time || "-";
                const isCurrent = ramadan.isRamadan && ramadan.dayOfRamadan === i + 1;
                return (
                  <div key={i} className="grid grid-cols-4 gap-0 px-4 py-2.5 text-xs"
                    style={{ borderTop: '1px solid var(--c-border-warm)',
                      ...(isCurrent ? { background: 'linear-gradient(180deg, rgba(125,248,173,0.15) 0%, rgba(249,255,210,0.15) 100%)' } : {}) }}>
                    <span className="font-semibold" style={{ color: isCurrent ? '#38CA5E' : 'var(--c-text)' }}>{i + 1}</span>
                    <span className="text-center" style={{ color: 'var(--c-text-secondary)' }}>{imsakTime}</span>
                    <span className="text-center" style={{ color: 'var(--c-text-secondary)' }}>{subuhTime}</span>
                    <span className="text-center" style={{ color: 'var(--c-text-secondary)' }}>{maghribTime}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Puasa;
