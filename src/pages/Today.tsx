import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Gift, Moon, Sun, Sunrise, Sunset, CloudSun } from "lucide-react";

interface PrayerTime {
  name: string;
  time: string;
  icon: React.ReactNode;
  completed: boolean;
}

const STORAGE_KEY = "kala_prayer_data";

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return "Pagi";
  if (h < 15) return "Siang";
  if (h < 18) return "Sore";
  return "Malam";
};

const getDefaultPrayers = (): PrayerTime[] => [
  { name: "Subuh", time: "04:35", icon: <Sunrise className="h-4 w-4" />, completed: false },
  { name: "Dzuhur", time: "11:55", icon: <Sun className="h-4 w-4" />, completed: false },
  { name: "Ashar", time: "15:15", icon: <CloudSun className="h-4 w-4" />, completed: false },
  { name: "Maghrib", time: "17:50", icon: <Sunset className="h-4 w-4" />, completed: false },
  { name: "Isya", time: "19:05", icon: <Moon className="h-4 w-4" />, completed: false },
];

const sunnahTasks = [
  { id: "dhuha", label: "Sholat Dhuha", emoji: "☀️" },
  { id: "tahajud", label: "Tahajud", emoji: "🌙" },
  { id: "dzikir", label: "Dzikir Pagi/Petang", emoji: "📿" },
  { id: "sedekah", label: "Sedekah", emoji: "💝" },
];

const Today = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const [prayers, setPrayers] = useState<PrayerTime[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const savedDate = parsed.date;
      if (savedDate === today.toDateString()) {
        return getDefaultPrayers().map((p, i) => ({ ...p, completed: parsed.completed[i] }));
      }
    }
    return getDefaultPrayers();
  });

  const [sunnahCompleted, setSunnahCompleted] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_sunnah");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today.toDateString()) return parsed.data;
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: today.toDateString(),
      completed: prayers.map(p => p.completed),
    }));
  }, [prayers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_sunnah", JSON.stringify({
      date: today.toDateString(),
      data: sunnahCompleted,
    }));
  }, [sunnahCompleted]);

  const togglePrayer = (index: number) => {
    setPrayers(prev => prev.map((p, i) => i === index ? { ...p, completed: !p.completed } : p));
  };

  const toggleSunnah = (id: string) => {
    setSunnahCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = prayers.filter(p => p.completed).length;

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOfWeek + i);
    return { day: d.getDate(), isToday: d.toDateString() === today.toDateString() };
  });

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with gradient */}
      <div className="gradient-header px-6 pb-6 pt-12">
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
          </div>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
            <Gift className="h-5 w-5 text-accent-foreground" />
          </button>
        </div>

        {/* Week tracker */}
        <div className="mt-5 flex gap-2">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className={`flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-medium transition-all ${
                d.isToday
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-[10px]">{dayNames[i]}</span>
              <span className="mt-0.5 font-semibold">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6">
        {/* Prayer progress */}
        <div className="mb-2 mt-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Sholat Wajib</h2>
          <span className="text-xs font-medium text-primary">{completedCount}/5</span>
        </div>

        {/* Prayer list */}
        <div className="space-y-2.5">
          {prayers.map((prayer, i) => (
            <motion.button
              key={prayer.name}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => togglePrayer(i)}
              className={`flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all ${
                prayer.completed ? "opacity-60" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  prayer.completed
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-border bg-background"
                }`}
              >
                {prayer.completed && <Check className="h-4 w-4" />}
              </div>
              <span className={`flex-1 text-left font-medium ${prayer.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {prayer.name}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                {prayer.icon}
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
          {sunnahTasks.map((task, i) => (
            <motion.button
              key={task.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              onClick={() => toggleSunnah(task.id)}
              className={`flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all ${
                sunnahCompleted[task.id] ? "opacity-60" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  sunnahCompleted[task.id]
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-border bg-background"
                }`}
              >
                {sunnahCompleted[task.id] && <Check className="h-4 w-4" />}
              </div>
              <span className={`flex-1 text-left font-medium ${sunnahCompleted[task.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
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
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl bg-accent/50 p-5"
        >
          <p className="text-sm font-medium text-accent-foreground italic leading-relaxed">
            "Sesungguhnya sholat itu mencegah dari perbuatan keji dan mungkar."
          </p>
          <p className="mt-2 text-xs text-muted-foreground">— QS. Al-Ankabut: 45</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Today;
