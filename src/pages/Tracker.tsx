import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  WAJIB_PRAYERS, DEFAULT_PRAYERS, fetchPrayerTimes, getWajibFromPrayers,
  loadDayData, saveDayData, getDayKey, type DayData, type PrayerSchedule
} from "@/lib/kala-utils";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const Tracker = () => {
  const realToday = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(realToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDayData(realToday));
  const [prayers, setPrayers] = useState<PrayerSchedule[]>(DEFAULT_PRAYERS);
  const [wajibPrayers, setWajibPrayers] = useState<PrayerSchedule[]>(WAJIB_PRAYERS);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

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

  useEffect(() => {
    setDayData(loadDayData(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    if (!userCoords) return;
    fetchPrayerTimes(userCoords.lat, userCoords.lon, selectedDate)
      .then((fetched) => {
        setPrayers(fetched);
        setWajibPrayers(getWajibFromPrayers(fetched));
      })
      .catch(() => {
        setPrayers(DEFAULT_PRAYERS);
        setWajibPrayers(WAJIB_PRAYERS);
      });
  }, [userCoords, selectedDate]);

  const updateDayData = useCallback((newData: DayData) => {
    setDayData(newData);
    saveDayData(selectedDate, newData);
  }, [selectedDate]);

  const togglePrayer = (index: number) => {
    const newCompleted = [...dayData.prayerCompleted];
    newCompleted[index] = !newCompleted[index];
    updateDayData({ ...dayData, prayerCompleted: newCompleted });
  };

  const completeAll = () => {
    updateDayData({ ...dayData, prayerCompleted: [true, true, true, true, true] });
  };

  const completedCount = dayData.prayerCompleted.filter(Boolean).length;
  const percentage = Math.round((completedCount / 5) * 100);

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

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date(realToday);
    // Check from yesterday backwards
    d.setDate(d.getDate() - 1);
    while (true) {
      const data = loadDayData(d);
      if (data.prayerCompleted.filter(Boolean).length === 5) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    // Also check today
    if (completedCount === 5) count++;
    return count;
  }, [realToday, completedCount]);

  const dateTitle = selectedDate.toLocaleDateString("id-ID", { month: "long", day: "numeric", year: "numeric" });
  const isToday = getDayKey(selectedDate) === getDayKey(realToday);

  // Circular progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      {/* Green blur bg */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560, height: 341,
          left: '50%', top: -280,
          transform: 'translateX(-50%)',
          background: '#CCFF3F',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex flex-col items-center pt-6 gap-6 px-4">
        {/* Header with month nav */}
        <div className="flex items-center justify-between w-full">
          <button onClick={() => navigateWeek(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              {isToday ? "Today" : selectedDate.toLocaleDateString("id-ID", { weekday: "long" })}
            </h1>
            <span className="text-sm" style={{ color: '#62748E', letterSpacing: '-0.15px' }}>{dateTitle}</span>
          </div>
          <button onClick={() => navigateWeek(1)} className="p-2 rounded-full">
            <ChevronRight className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
        </div>

        {/* Week day selector */}
        <div className="flex items-start gap-3 overflow-x-auto w-full pl-2" style={{ scrollbarWidth: 'none' }}>
          {weekDays.map((d, i) => {
            const isSelected = getDayKey(d) === getDayKey(selectedDate);
            const isTodayDate = getDayKey(d) === getDayKey(realToday);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
                style={{
                  width: 48, height: 64,
                  borderRadius: isSelected ? 40 : 16,
                  ...(isSelected ? {
                    background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                    border: '1px solid #FFFFFF',
                    boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
                  } : {}),
                }}
              >
                <span
                  className="text-[10px] font-medium uppercase"
                  style={{ color: isSelected ? '#314158' : '#5C5C5C', letterSpacing: '0.62px' }}
                >
                  {DAY_LABELS[d.getDay()]}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: '#314158', letterSpacing: '-0.44px' }}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Circular progress */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex items-center justify-center"
          style={{ width: 280, height: 280 }}
        >
          <svg width="280" height="280" viewBox="0 0 280 280" className="absolute">
            {/* Background circle */}
            <circle
              cx="140" cy="140" r={radius}
              fill="none"
              stroke="#EFEFEF"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <circle
              cx="140" cy="140" r={radius}
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 140 140)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7DF8AD" />
                <stop offset="100%" stopColor="#CAFF7B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-sm font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              Tracker Solat Wajib
            </span>
            <span className="font-semibold" style={{ fontSize: 48, color: '#1D293D', letterSpacing: '-0.44px' }}>
              {percentage}%
            </span>
            <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
              {completedCount}/5 Completed
            </span>
          </div>
        </motion.div>

        {/* Streak card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-3xl p-6 flex items-center justify-between"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
          }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              {streak > 0 ? `${streak} hari beruntun salat 5 waktu!` : 'Mulai streak salat 5 waktumu!'}
            </span>
            <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
              {streak > 0 ? 'Jangan sampai bolong ya solatnya!' : 'Selesaikan 5 sholat hari ini'}
            </span>
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 40, height: 40,
              background: 'linear-gradient(180deg, #F87D7D 0%, #FFE2D2 100%)',
              border: '1px solid #FFFFFF',
              boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
              borderRadius: 40,
            }}
          >
            <span className="text-lg">🔥</span>
          </div>
        </motion.div>

        {/* Prayer list card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full rounded-3xl p-4 flex flex-col gap-3"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              Sholat Wajib
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: '#F8F8F7', color: '#314158' }}
              >
                {completedCount}/5
              </span>
              <button
                onClick={completeAll}
                className="text-xs font-bold px-4 py-2 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                  border: '1px solid #FFFFFF',
                  boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
                  color: '#314158',
                }}
              >
                Selesaikan semua
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full" style={{ background: '#F8F8F7' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3AE886 0%, #46C0F1 100%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 5) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Prayer items */}
          <div className="flex flex-col gap-2">
            {wajibPrayers.map((prayer, i) => {
              const completed = dayData.prayerCompleted[i];
              return (
                <motion.button
                  key={prayer.name}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => togglePrayer(i)}
                  className="flex w-full items-center justify-between rounded-2xl p-4"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #F3EDE6',
                    boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={completed ? {
                        background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                        border: '1px solid #FFFFFF',
                        boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
                      } : {
                        background: '#F8F8F7',
                      }}
                    >
                      {completed && (
                        <Check className="h-5 w-5" style={{ color: '#334258' }} strokeWidth={2.5} />
                      )}
                    </div>
                    <span
                      className="font-semibold text-lg"
                      style={{
                        color: completed ? '#90A1B9' : '#1D293D',
                        textDecoration: completed ? 'line-through' : 'none',
                        letterSpacing: '-0.44px',
                      }}
                    >
                      {prayer.name}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: '#90A1B9', letterSpacing: '-0.15px' }}>
                    {prayer.time}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Tracker;
