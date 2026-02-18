import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Gift, Moon, Sun, Sunrise, Sunset, CloudSun, Timer, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  WAJIB_PRAYERS, DEFAULT_PRAYERS, getNextPrayer, formatCountdown,
  isRamadan, formatHijriDate, getDailyQuote,
  loadDayData, saveDayData, getDayKey, type DayData,
} from "@/lib/kala-utils";

const SUNNAH_TASKS = [
  { id: "dhuha", label: "Sholat Dhuha", emoji: "☀️" },
  { id: "tahajud", label: "Tahajud", emoji: "🌙" },
  { id: "dzikir", label: "Dzikir Pagi/Petang", emoji: "📿" },
  { id: "sedekah", label: "Sedekah", emoji: "💝" },
];

const PRAYER_ICONS = [
  <Sunrise className="h-4 w-4" />,
  <Sun className="h-4 w-4" />,
  <CloudSun className="h-4 w-4" />,
  <Sunset className="h-4 w-4" />,
  <Moon className="h-4 w-4" />,
];

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return "Pagi";
  if (h < 15) return "Siang";
  if (h < 18) return "Sore";
  return "Malam";
};

const Today = () => {
  const realToday = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(realToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDayData(realToday));
  const [countdown, setCountdown] = useState("");
  const [nextPrayerName, setNextPrayerName] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isToday = getDayKey(selectedDate) === getDayKey(realToday);
  const ramadan = isRamadan(selectedDate);
  const hijriDate = formatHijriDate(selectedDate);
  const quote = getDailyQuote(selectedDate);

  // Load data when date changes
  useEffect(() => {
    setDayData(loadDayData(selectedDate));
  }, [selectedDate]);

  // Save data when it changes
  const updateDayData = useCallback((newData: DayData) => {
    setDayData(newData);
    saveDayData(selectedDate, newData);
  }, [selectedDate]);

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const next = getNextPrayer(new Date());
      if (next) {
        setCountdown(formatCountdown(next.remainingMinutes));
        setNextPrayerName(next.prayer.name);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const togglePrayer = (index: number) => {
    const newCompleted = [...dayData.prayerCompleted];
    newCompleted[index] = !newCompleted[index];
    updateDayData({ ...dayData, prayerCompleted: newCompleted });
  };

  const toggleSunnah = (id: string) => {
    updateDayData({
      ...dayData,
      sunnahCompleted: { ...dayData.sunnahCompleted, [id]: !dayData.sunnahCompleted[id] },
    });
  };

  const completedCount = dayData.prayerCompleted.filter(Boolean).length;

  // Generate week around selected date
  const dayOfWeek = selectedDate.getDay();
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      day: d.getDate(),
      isSelected: getDayKey(d) === getDayKey(selectedDate),
      isRealToday: getDayKey(d) === getDayKey(realToday),
    };
  });

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const goWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  // Imsak time for Ramadan
  const imsakPrayer = DEFAULT_PRAYERS.find(p => p.name === "Imsak");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-header px-6 pb-4 pt-12">
        <div className="flex items-start justify-between">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-bold text-foreground"
            >
              {getTimeOfDay()},{" "}
              <span className="text-primary">Sahabat</span>
            </motion.h1>
            <p className="mt-1 text-xs text-muted-foreground">{hijriDate}</p>
          </div>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
                <CalendarDays className="h-5 w-5 text-accent-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Ramadan banner */}
        {ramadan.isRamadan && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
          >
            <span className="text-2xl">🌙</span>
            <div>
              <p className="text-sm font-bold text-foreground">Ramadan Hari ke-{ramadan.dayOfRamadan}</p>
              <p className="text-xs text-muted-foreground">Imsak: {imsakPrayer?.time} • Selamat berpuasa!</p>
            </div>
          </motion.div>
        )}

        {/* Next prayer countdown */}
        {isToday && nextPrayerName && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-3 flex items-center gap-3 rounded-2xl gradient-primary p-3 shadow-md"
          >
            <Timer className="h-5 w-5 text-primary-foreground" />
            <div className="flex-1">
              <p className="text-xs text-primary-foreground/80">{nextPrayerName} dalam</p>
              <p className="text-lg font-bold text-primary-foreground">{countdown}</p>
            </div>
          </motion.div>
        )}

        {/* Week selector */}
        <div className="mt-4 flex items-center gap-1">
          <button onClick={() => goWeek(-1)} className="p-1 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 gap-1.5">
            {weekDays.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-medium transition-all ${
                  d.isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : d.isRealToday
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span className="text-[10px]">{dayNames[i]}</span>
                <span className="mt-0.5 font-semibold">{d.day}</span>
              </button>
            ))}
          </div>
          <button onClick={() => goWeek(1)} className="p-1 text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-6">
        {/* Not today indicator */}
        {!isToday && (
          <button
            onClick={() => setSelectedDate(realToday)}
            className="mt-3 w-full rounded-xl bg-accent/50 py-2 text-center text-xs font-medium text-primary"
          >
            📅 Melihat {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })} — Tap untuk kembali ke hari ini
          </button>
        )}

        {/* Prayer progress */}
        <div className="mb-2 mt-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Sholat Wajib</h2>
          <span className="text-xs font-medium text-primary">{completedCount}/5</span>
        </div>

        {/* Progress bar */}
        <div className="mb-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / 5) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Prayer list */}
        <div className="space-y-2.5">
          {WAJIB_PRAYERS.map((prayer, i) => (
            <motion.button
              key={prayer.name}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => togglePrayer(i)}
              className={`flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all ${
                dayData.prayerCompleted[i] ? "opacity-60" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  dayData.prayerCompleted[i]
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-border bg-background"
                }`}
              >
                {dayData.prayerCompleted[i] && <Check className="h-4 w-4" />}
              </div>
              <span className={`flex-1 text-left font-medium ${dayData.prayerCompleted[i] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {prayer.name}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                {PRAYER_ICONS[i]}
                <span className="text-sm">{prayer.time}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Sunnah section */}
        <div className="mb-2 mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Ibadah Sunnah</h2>
        </div>

        <div className="space-y-2.5">
          {SUNNAH_TASKS.map((task, i) => (
            <motion.button
              key={task.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              onClick={() => toggleSunnah(task.id)}
              className={`flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all ${
                dayData.sunnahCompleted[task.id] ? "opacity-60" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  dayData.sunnahCompleted[task.id]
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-border bg-background"
                }`}
              >
                {dayData.sunnahCompleted[task.id] && <Check className="h-4 w-4" />}
              </div>
              <span className={`flex-1 text-left font-medium ${dayData.sunnahCompleted[task.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.label}
              </span>
              <span className="text-lg">{task.emoji}</span>
            </motion.button>
          ))}
        </div>

        {/* Daily quote */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 mb-4 rounded-2xl bg-accent/50 p-5"
        >
          <p className="text-sm font-medium text-accent-foreground italic leading-relaxed">
            "{quote.text}"
          </p>
          <p className="mt-2 text-xs text-muted-foreground">— {quote.source}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Today;
