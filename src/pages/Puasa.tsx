import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { getDayKey, loadDayData, saveDayData, isRamadan, type DayData } from "@/lib/kala-utils";

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

  // Streak
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date(realToday);
    d.setDate(d.getDate() - 1);
    while (true) {
      const data = loadDayData(d);
      if (data.sunnahCompleted["puasa"]) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    if (dayData.sunnahCompleted["puasa"]) count++;
    return count;
  }, [realToday, dayData]);

  const dateTitle = selectedDate.toLocaleDateString("id-ID", { month: "long", day: "numeric", year: "numeric" });
  const isToday = getDayKey(selectedDate) === getDayKey(realToday);

  // Circular progress
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      {/* bg atas - green */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560, height: 341,
          left: '50%', top: -209,
          transform: 'translateX(-50%)',
          background: '#CCFF3F',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />
      {/* bg - blue */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 546, height: 521,
          left: 19, top: -535,
          background: '#00B4D8',
          filter: 'blur(100px)',
          transform: 'rotate(-76.22deg)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 flex flex-col items-center pt-6 px-4 gap-4">
        {/* Header with week nav */}
        <div className="flex items-center justify-between w-full">
          <button onClick={() => navigateWeek(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              {isToday ? "Ramadhan Tracker" : "Ramadhan Tracker"}
            </h1>
            <span className="text-sm font-medium" style={{ color: '#62748E', letterSpacing: '-0.15px' }}>
              {dateTitle}
            </span>
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
            const dData = loadDayData(d);
            const hasPuasa = dData.sunnahCompleted["puasa"];
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
                <span className="text-[10px] font-medium uppercase" style={{ color: isSelected ? '#314158' : '#5C5C5C', letterSpacing: '0.62px' }}>
                  {DAY_LABELS[d.getDay()]}
                </span>
                <span className="text-lg font-bold" style={{ color: '#314158', letterSpacing: '-0.44px' }}>
                  {d.getDate()}
                </span>
                {hasPuasa && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3AE886' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Top card - Puasa hari ke-X */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-3xl p-4 flex items-center gap-4"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
          }}
        >
          <div className="flex flex-col flex-1 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
                Puasa Hari ke-{dayOfRamadan}
              </span>
              <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
                Selalu semangat ya!
              </span>
            </div>
            <div
              className="flex items-center px-3 py-1.5 rounded-full self-start"
              style={{ border: '1px solid #F3EDE6', boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)' }}
            >
              <span className="text-xs font-bold" style={{ color: '#38CA5E' }}>
                {daysToEid > 0 ? `${daysToEid} hari menuju Lebaran!` : '🎉 Selamat Hari Raya!'}
              </span>
            </div>
          </div>

          {/* Circular progress mini */}
          <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 86, height: 86 }}>
            <svg width="86" height="86" viewBox="0 0 86 86">
              <circle cx="43" cy="43" r={radius} fill="none" stroke="#EFEFEF" strokeWidth="8" strokeLinecap="round" />
              <circle
                cx="43" cy="43" r={radius}
                fill="none"
                stroke="url(#puasaGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 43 43)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <defs>
                <linearGradient id="puasaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7DF8AD" />
                  <stop offset="100%" stopColor="#CAFF7B" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-sm font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.13px' }}>
                {percentage}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Streak card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="w-full rounded-3xl p-6 flex items-center justify-between"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
          }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
              {streak > 0 ? `${streak} hari beruntun puasa!` : 'Mulai streak puasamu!'}
            </span>
            <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
              {streak > 0 ? 'Jangan sampai bolong ya puasanya!' : 'Tandai puasa untuk memulai'}
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

        {/* Puasa Tracker checklist card */}
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
              Puasa Tracker
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: '#F8F8F7', color: '#314158' }}
              >
                {completedCount}/{PUASA_TASKS.length}
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
              animate={{ width: `${(completedCount / PUASA_TASKS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Task items */}
          <div className="flex flex-col gap-2">
            {PUASA_TASKS.map((task, i) => {
              const completed = dayData.sunnahCompleted[task.id];
              return (
                <motion.button
                  key={task.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggle(task.id)}
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
                      className="font-semibold text-base"
                      style={{
                        color: completed ? '#90A1B9' : '#1D293D',
                        textDecoration: completed ? 'line-through' : 'none',
                        letterSpacing: '-0.44px',
                      }}
                    >
                      {task.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Puasa;
