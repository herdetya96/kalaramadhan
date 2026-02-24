import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { loadDayData, getDayKey } from "@/lib/kala-utils";

interface MonthlyProgressProps {
  selectedDate: Date;
  onMonthChange: (dir: number) => void;
  onDayClick?: (date: Date) => void;
}

const DAY_HEADERS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const MonthlyProgress = ({ selectedDate, onMonthChange, onDayClick }: MonthlyProgressProps) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const todayKey = getDayKey(new Date());

  const monthLabel = new Date(year, month).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: {date: Date | null;completed: number;total: number;}[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, completed: 0, total: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const data = loadDayData(date);
      const prayerDone = data.prayerCompleted.filter(Boolean).length;
      const sunnahDone = Object.values(data.sunnahCompleted).filter(Boolean).length;
      days.push({ date, completed: prayerDone + sunnahDone, total: 5 + 4 });
    }
    return days;
  }, [year, month]);

  const stats = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let perfectDays = 0;
    let totalPrayers = 0;
    let totalSunnah = 0;
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date > today) break;
      const data = loadDayData(date);
      const prayerDone = data.prayerCompleted.filter(Boolean).length;
      const sunnahDone = Object.values(data.sunnahCompleted).filter(Boolean).length;
      totalPrayers += prayerDone;
      totalSunnah += sunnahDone;
      if (prayerDone === 5) perfectDays++;
    }
    return { perfectDays, totalPrayers, totalSunnah };
  }, [year, month]);

  const getColorForDay = (completed: number, total: number) => {
    if (completed === 0) return 'var(--c-surface-alt)';
    const ratio = completed / total;
    if (ratio >= 0.9) return '#7DF8AD';
    if (ratio >= 0.5) return '#CAFF7B';
    return '#FFE2D2';
  };

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full rounded-3xl p-4 flex flex-col gap-4"
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border-warm)',
        boxShadow: 'var(--s-card)'
      }}>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Progress</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => onMonthChange(-1)} className="p-1 rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
            <ChevronLeft className="h-4 w-4" style={{ color: 'var(--c-text-secondary)' }} />
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--c-text-dark)', minWidth: 120, textAlign: 'center' }}>
            {monthLabel}
          </span>
          <button onClick={() => onMonthChange(1)} className="p-1 rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
            <ChevronRight className="h-4 w-4" style={{ color: 'var(--c-text-secondary)' }} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'var(--c-surface-alt)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{stats.perfectDays}</div>
          <div className="text-[10px] font-medium" style={{ color: 'var(--c-text-muted)' }}>Hari Sempurna</div>
        </div>
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'var(--c-surface-alt)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{stats.totalPrayers}</div>
          <div className="text-[10px] font-medium" style={{ color: 'var(--c-text-muted)' }}>Sholat Wajib</div>
        </div>
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'var(--c-surface-alt)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{stats.totalSunnah}</div>
          <div className="text-[10px] font-medium" style={{ color: 'var(--c-text-muted)' }}>Ibadah Sunnah</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) =>
        <div key={d} className="text-center text-[10px] font-medium uppercase pb-1" style={{ color: 'var(--c-text-muted)', letterSpacing: '0.5px' }}>
            {d}
          </div>
        )}
        {calendarDays.map((day, i) => {
          if (!day.date) return <div key={`empty-${i}`} />;
          const isToday = getDayKey(day.date) === todayKey;
          const dayKey = getDayKey(day.date);
          const isFuture = dayKey > todayKey;
          return (
            <button
              key={i}
              onClick={() => !isFuture && onDayClick?.(day.date!)}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-transform active:scale-90"
              style={{
                background: isFuture ? 'transparent' : getColorForDay(day.completed, day.total),
                color: isFuture ? 'var(--c-disabled)' : 'var(--c-text-dark)',
                border: isToday ? '2px solid #3AE886' : 'none',
                cursor: isFuture ? 'default' : 'pointer',
              }}>
              {day.date.getDate()}
            </button>);
        })}
      </div>

      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: 'var(--c-surface-alt)' }} />
          <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>Belum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: '#FFE2D2' }} />
          <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>&lt;50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: '#CAFF7B' }} />
          <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>50%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: '#7DF8AD' }} />
          <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>90%+</span>
        </div>
      </div>
    </motion.div>);
};

export default MonthlyProgress;
