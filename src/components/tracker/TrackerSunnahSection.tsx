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
        background: '#FFFFFF',
        border: '1px solid #F3EDE6',
        boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
          Ibadah Sunnah
        </h2>
        <span
          className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: '#F8F8F7', color: '#314158' }}
        >
          {completedCount}/{SUNNAH_TASKS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full" style={{ background: '#F8F8F7' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #F8C77E 0%, #FFE2D2 100%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / SUNNAH_TASKS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Sunnah items */}
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
              <span className="text-lg">{task.emoji}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TrackerSunnahSection;
