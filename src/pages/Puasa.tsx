import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Moon, Sun } from "lucide-react";
import { getDayKey, loadDayData, saveDayData, type DayData } from "@/lib/kala-utils";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const Puasa = () => {
  const realToday = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(realToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDayData(realToday));

  useEffect(() => {
    setDayData(loadDayData(selectedDate));
  }, [selectedDate]);

  const updateDayData = useCallback((newData: DayData) => {
    setDayData(newData);
    saveDayData(selectedDate, newData);
  }, [selectedDate]);

  const toggleFasting = (key: "sahur" | "buka") => {
    const newSunnah = { ...dayData.sunnahCompleted, [key]: !dayData.sunnahCompleted[key] };
    updateDayData({ ...dayData, sunnahCompleted: newSunnah });
  };

  const isSahur = dayData.sunnahCompleted["sahur"] || false;
  const isBuka = dayData.sunnahCompleted["buka"] || false;
  const isFasting = isSahur && isBuka;

  // Week days
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

  // Streak
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date(realToday);
    d.setDate(d.getDate() - 1);
    while (true) {
      const data = loadDayData(d);
      if (data.sunnahCompleted["sahur"] && data.sunnahCompleted["buka"]) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    if (isFasting) count++;
    return count;
  }, [realToday, isFasting]);

  const dateTitle = selectedDate.toLocaleDateString("id-ID", { month: "long", day: "numeric", year: "numeric" });
  const isToday = getDayKey(selectedDate) === getDayKey(realToday);

  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      {/* Purple blur bg */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560, height: 341,
          left: '50%', top: -280,
          transform: 'translateX(-50%)',
          background: '#A78BFA',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex flex-col items-center pt-6 px-4 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <button onClick={() => navigateWeek(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              {isToday ? "Puasa Hari Ini" : "Puasa"}
            </h1>
            <span className="text-sm" style={{ color: '#62748E', letterSpacing: '-0.15px' }}>{dateTitle}</span>
          </div>
          <button onClick={() => navigateWeek(1)} className="p-2 rounded-full">
            <ChevronRight className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
        </div>

        {/* Week selector */}
        <div className="flex items-start gap-3 overflow-x-auto w-full pl-2" style={{ scrollbarWidth: 'none' }}>
          {weekDays.map((d, i) => {
            const isSelected = getDayKey(d) === getDayKey(selectedDate);
            const dayData = loadDayData(d);
            const hasFasted = dayData.sunnahCompleted["sahur"] && dayData.sunnahCompleted["buka"];
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
                style={{
                  width: 48, height: 64,
                  borderRadius: isSelected ? 40 : 16,
                  ...(isSelected ? {
                    background: 'linear-gradient(180deg, #C4B5FD 0%, #F5F3FF 100%)',
                    border: '1px solid #FFFFFF',
                    boxShadow: '0px 30px 46px rgba(139, 92, 246, 0.1)',
                  } : {}),
                }}
              >
                <span className="text-[10px] font-medium uppercase" style={{ color: isSelected ? '#5B21B6' : '#5C5C5C', letterSpacing: '0.62px' }}>
                  {DAY_LABELS[d.getDay()]}
                </span>
                <span className="text-lg font-bold" style={{ color: '#314158', letterSpacing: '-0.44px' }}>
                  {d.getDate()}
                </span>
                {hasFasted && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Status card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full rounded-3xl p-6 flex flex-col items-center gap-4"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(139, 92, 246, 0.1)',
          }}
        >
          <div className="text-5xl">{isFasting ? "🌙" : isSahur ? "⏳" : "🍽️"}</div>
          <div className="text-center">
            <h2 className="text-lg font-bold" style={{ color: '#1D293D' }}>
              {isFasting ? "Alhamdulillah, puasa selesai!" : isSahur ? "Sedang berpuasa..." : "Belum puasa hari ini"}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#838A96' }}>
              {isFasting ? "Semoga diterima amalnya" : isSahur ? "Semangat sampai Maghrib!" : "Tandai sahur untuk mulai tracking"}
            </p>
          </div>
        </motion.div>

        {/* Sahur card */}
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          onClick={() => toggleFasting("sahur")}
          className="w-full rounded-3xl p-5 flex items-center justify-between"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(139, 92, 246, 0.05)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={isSahur ? {
                background: 'linear-gradient(180deg, #C4B5FD 0%, #F5F3FF 100%)',
                border: '1px solid #FFFFFF',
                boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)',
              } : { background: '#F8F8F7' }}
            >
              {isSahur ? <Check className="h-5 w-5" style={{ color: '#5B21B6' }} strokeWidth={2.5} /> : <Moon className="h-5 w-5" style={{ color: '#90A1B9' }} />}
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg" style={{ color: isSahur ? '#90A1B9' : '#1D293D', textDecoration: isSahur ? 'line-through' : 'none', letterSpacing: '-0.44px' }}>Sahur</span>
              <span className="text-xs" style={{ color: '#838A96' }}>Sudah makan sahur</span>
            </div>
          </div>
          <span className="text-2xl">🌙</span>
        </motion.button>

        {/* Buka card */}
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => toggleFasting("buka")}
          className="w-full rounded-3xl p-5 flex items-center justify-between"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(139, 92, 246, 0.05)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={isBuka ? {
                background: 'linear-gradient(180deg, #C4B5FD 0%, #F5F3FF 100%)',
                border: '1px solid #FFFFFF',
                boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)',
              } : { background: '#F8F8F7' }}
            >
              {isBuka ? <Check className="h-5 w-5" style={{ color: '#5B21B6' }} strokeWidth={2.5} /> : <Sun className="h-5 w-5" style={{ color: '#90A1B9' }} />}
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg" style={{ color: isBuka ? '#90A1B9' : '#1D293D', textDecoration: isBuka ? 'line-through' : 'none', letterSpacing: '-0.44px' }}>Buka Puasa</span>
              <span className="text-xs" style={{ color: '#838A96' }}>Sudah berbuka puasa</span>
            </div>
          </div>
          <span className="text-2xl">🌅</span>
        </motion.button>

        {/* Streak */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full rounded-3xl p-6 flex items-center justify-between"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(139, 92, 246, 0.1)',
          }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              {streak > 0 ? `${streak} hari beruntun puasa!` : "Mulai streak puasamu!"}
            </span>
            <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
              {streak > 0 ? "Terus konsisten berpuasa!" : "Tandai sahur & buka untuk memulai"}
            </span>
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 40, height: 40,
              background: 'linear-gradient(180deg, #A78BFA 0%, #F5F3FF 100%)',
              border: '1px solid #FFFFFF',
              boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)',
              borderRadius: 40,
            }}
          >
            <span className="text-lg">🔥</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Puasa;
