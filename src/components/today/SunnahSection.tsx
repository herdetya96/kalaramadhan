import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { DayData } from "@/lib/kala-utils";

const SUNNAH_TASKS = [
{ id: "dhuha", label: "Sholat Dhuha", emoji: "☀️" },
{ id: "tahajud", label: "Tahajud", emoji: "🌙" },
{ id: "dzikir", label: "Dzikir Pagi/Petang", emoji: "📿" },
{ id: "sedekah", label: "Sedekah", emoji: "💝" }];

interface SunnahSectionProps {
  dayData: DayData;
  onToggleSunnah: (id: string) => void;
}

const SunnahSection = ({ dayData, onToggleSunnah }: SunnahSectionProps) => {
  return (
    <div
      className="rounded-3xl p-4 flex flex-col gap-3"
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border-warm)',
        boxShadow: 'var(--s-card)'
      }}>

      <h2 className="text-lg font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Ibadah Sunnah</h2>

      <div className="flex flex-col gap-2">
        {SUNNAH_TASKS.map((task, i) => {
          const completed = dayData.sunnahCompleted[task.id];
          return (
            <motion.button
              key={task.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              onClick={() => onToggleSunnah(task.id)}
              className="flex w-full items-center justify-between rounded-2xl p-4"
              style={{
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border-warm)',
                boxShadow: 'var(--s-card-light)'
              }}>

              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={completed ? {
                    background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                    border: '1px solid var(--c-surface)',
                    boxShadow: 'var(--s-complex)'
                  } : {
                    background: 'var(--c-surface-alt)'
                  }}>
                  {completed &&
                  <Check className="h-5 w-5" style={{ color: 'var(--c-text-check)' }} strokeWidth={2.5} />
                  }
                </div>
                <span
                  className="font-semibold text-base"
                  style={{
                    color: completed ? 'var(--c-text-completed)' : 'var(--c-text)',
                    textDecoration: completed ? 'line-through' : 'none',
                    letterSpacing: '-0.44px'
                  }}>
                  {task.label}
                </span>
              </div>
              <span className="text-lg">{task.emoji}</span>
            </motion.button>);
        })}
      </div>
    </div>);
};

export default SunnahSection;
