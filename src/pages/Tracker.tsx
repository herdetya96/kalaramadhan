import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { getMonthData, loadDayData, WAJIB_PRAYERS } from "@/lib/kala-utils";

const SUNNAH_IDS = ["dhuha", "tahajud", "dzikir", "sedekah"];

const Tracker = () => {
  const [viewMonth, setViewMonth] = useState(new Date());
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const monthData = useMemo(() => getMonthData(year, month), [year, month]);

  const chartData = monthData.map(({ date, data }) => {
    const prayerCount = data.prayerCompleted.filter(Boolean).length;
    const sunnahCount = SUNNAH_IDS.filter(id => data.sunnahCompleted[id]).length;
    return {
      day: date.getDate(),
      sholat: prayerCount,
      sunnah: sunnahCount,
      total: prayerCount + sunnahCount,
    };
  });

  const totalPrayers = chartData.reduce((s, d) => s + d.sholat, 0);
  const totalSunnah = chartData.reduce((s, d) => s + d.sunnah, 0);
  const totalDays = monthData.length;
  const activeDays = chartData.filter(d => d.total > 0).length;
  const avgPrayer = activeDays > 0 ? (totalPrayers / activeDays).toFixed(1) : "0";

  const prevMonth = () => setViewMonth(new Date(year, month - 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1));

  const monthName = viewMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // Weekly heatmap for current month
  const weeksInMonth: number[][] = [];
  let currentWeek: number[] = [];
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  for (let i = 0; i < firstDayOfMonth; i++) currentWeek.push(-1);
  for (let d = 1; d <= totalDays; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeksInMonth.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(-1);
    weeksInMonth.push(currentWeek);
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-full bg-accent">
          <ChevronLeft className="h-4 w-4 text-accent-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground capitalize">{monthName}</h1>
        <button onClick={nextMonth} className="p-2 rounded-full bg-accent">
          <ChevronRight className="h-4 w-4 text-accent-foreground" />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-2xl bg-card p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{totalPrayers}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Sholat Wajib</p>
        </motion.div>
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-card p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{totalSunnah}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Ibadah Sunnah</p>
        </motion.div>
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{activeDays}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Hari Aktif</p>
        </motion.div>
      </div>

      {/* Bar chart */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-card p-4 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Sholat Wajib Harian</h2>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barSize={8}>
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={4} />
            <YAxis domain={[0, 5]} hide />
            <Bar dataKey="sholat" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.sholat === 5 ? "hsl(var(--primary))" : entry.sholat > 0 ? "hsl(var(--accent))" : "hsl(var(--muted))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Heatmap calendar */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Konsistensi</h2>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weeksInMonth.flat().map((day, i) => {
            if (day === -1) return <div key={i} />;
            const dayInfo = chartData.find(d => d.day === day);
            const level = dayInfo ? dayInfo.sholat : 0;
            const bgClass = level === 5 ? "bg-primary" : level >= 3 ? "bg-primary/60" : level > 0 ? "bg-primary/30" : "bg-muted";
            return (
              <div key={i} className={`aspect-square rounded-md ${bgClass} flex items-center justify-center`}>
                <span className={`text-[9px] font-medium ${level >= 3 ? "text-primary-foreground" : "text-muted-foreground"}`}>{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[9px] text-muted-foreground">Kurang</span>
          {[0, 1, 3, 5].map(l => (
            <div key={l} className={`h-3 w-3 rounded-sm ${l === 5 ? "bg-primary" : l === 3 ? "bg-primary/60" : l === 1 ? "bg-primary/30" : "bg-muted"}`} />
          ))}
          <span className="text-[9px] text-muted-foreground">Sempurna</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Tracker;
