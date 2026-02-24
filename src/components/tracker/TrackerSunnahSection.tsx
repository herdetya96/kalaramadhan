import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { DayData } from "@/lib/kala-utils";

const SUNNAH_TASKS = [
  { id: "dhuha", label: "Sholat Dhuha", emoji: "☀️" },
  { id: "tahajud", label: "Tahajud", emoji: "🌙" },
  { id: "dzikir", label: "Dzikir Pagi/Petang", emoji: "📿" },
  { id: "sedekah", label: "Sedekah", emoji: "💝" },
];

interface TrackerSunnahSectionProps {
  dayData: DayData;
  onToggleSunnah: (id: string) => void;
}

const TrackerSunnahSection = ({ dayData, onToggleSunnah }: TrackerSunnahSectionProps) => {
  const completedCount = SUNNAH_TASKS.filter(t => dayData.sunnahCompleted[t.id]).length;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="w-full rounded-3xl p-4 flex flex-col gap-3"
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border-warm)',
        boxShadow: 'var(--s-card)',
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>
          Ibadah Sunnah
        </h2>
        <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>
          {completedCount}/{SUNNAH_TASKS.length}
        </span>
      </div>

      <div className="h-2 w-full rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #F8C77E 0%, #FFE2D2 100%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / SUNNAH_TASKS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {SUNNAH_TASKS.map((task, i) => {
          const completed = dayData.sunnahCompleted[task.id];
          return (
            <motion.button
              key={task.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onToggleSunnah(task.id)}
              className="flex w-full items-center justify-between rounded-2xl p-4"
              style={{
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border-warm)',
                boxShadow: 'var(--s-card-light)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={completed ? {
                    background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                    border: '1px solid var(--c-surface)',
                    boxShadow: 'var(--s-complex)',
                  } : {
                    background: 'var(--c-surface-alt)',
                  }}
                >
                  {completed && (
                    <Check className="h-5 w-5" style={{ color: 'var(--c-text-check)' }} strokeWidth={2.5} />
                  )}
                </div>
                <span
                  className="font-semibold text-base"
                  style={{
                    color: completed ? 'var(--c-text-completed)' : 'var(--c-text)',
                    textDecoration: completed ? 'line-through' : 'none',
                    letterSpacing: '-0.44px',
                  }}
                >
                  {task.label}
                </span>
              </div>
              <span className="text-lg">{task.emoji}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TrackerSunnahSection;
