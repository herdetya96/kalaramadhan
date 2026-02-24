import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { loadDayData, getDayKey, WAJIB_PRAYERS, type DayData } from "@/lib/kala-utils";

const SUNNAH_TASKS = [
  { id: "dhuha", label: "Sholat Dhuha", emoji: "☀️" },
  { id: "tahajud", label: "Tahajud", emoji: "🌙" },
  { id: "dzikir", label: "Dzikir Pagi/Petang", emoji: "📿" },
  { id: "sedekah", label: "Sedekah", emoji: "💝" },
];

interface DayDetailProps {
  date: Date | null;
  onClose: () => void;
}

const DayDetail = ({ date, onClose }: DayDetailProps) => {
  if (!date) return null;

  const data: DayData = loadDayData(date);
  const isFuture = getDayKey(date) > getDayKey(new Date());
  const dateLabel = date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const prayersDone = data.prayerCompleted.filter(Boolean).length;
  const sunnahDone = SUNNAH_TASKS.filter(t => data.sunnahCompleted[t.id]).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full rounded-3xl p-4 flex flex-col gap-4"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border-warm)',
          boxShadow: 'var(--s-card)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>
              Detail Hari
            </h3>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{dateLabel}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
            <X className="h-4 w-4" style={{ color: 'var(--c-text-secondary)' }} />
          </button>
        </div>

        {isFuture ? (
          <div className="text-center py-6">
            <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Hari ini belum tiba</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Sholat Wajib</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>
                  {prayersDone}/5
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ background: 'linear-gradient(90deg, #3AE886 0%, #46C0F1 100%)', width: `${(prayersDone / 5) * 100}%` }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                {WAJIB_PRAYERS.map((prayer, i) => {
                  const done = data.prayerCompleted[i];
                  return (
                    <div key={prayer.name} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--c-surface-elevated)' }}>
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0"
                        style={done ? {
                          background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                        } : { background: 'var(--c-progress-bg)' }}
                      >
                        {done && <Check className="h-3.5 w-3.5" style={{ color: 'var(--c-text-check)' }} strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium" style={{
                        color: done ? 'var(--c-text-completed)' : 'var(--c-text)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>
                        {prayer.name}
                      </span>
                      <span className="text-xs ml-auto" style={{ color: 'var(--c-text-completed)' }}>{prayer.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Ibadah Sunnah</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>
                  {sunnahDone}/{SUNNAH_TASKS.length}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ background: 'linear-gradient(90deg, #F8C77E 0%, #FFE2D2 100%)', width: `${(sunnahDone / SUNNAH_TASKS.length) * 100}%` }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                {SUNNAH_TASKS.map((task) => {
                  const done = data.sunnahCompleted[task.id];
                  return (
                    <div key={task.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--c-surface-elevated)' }}>
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0"
                        style={done ? {
                          background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                        } : { background: 'var(--c-progress-bg)' }}
                      >
                        {done && <Check className="h-3.5 w-3.5" style={{ color: 'var(--c-text-check)' }} strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium" style={{
                        color: done ? 'var(--c-text-completed)' : 'var(--c-text)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>
                        {task.label}
                      </span>
                      <span className="text-lg ml-auto">{task.emoji}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DayDetail;
