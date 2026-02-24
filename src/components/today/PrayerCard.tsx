import { motion } from "framer-motion";
import { Check, Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";
import type { PrayerSchedule, DayData } from "@/lib/kala-utils";

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

interface PrayerCardProps {
  wajibPrayers: PrayerSchedule[];
  dayData: DayData;
  completedCount: number;
  onTogglePrayer: (index: number) => void;
}

const PrayerCard = ({ wajibPrayers, dayData, completedCount, onTogglePrayer }: PrayerCardProps) => {
  return (
    <div
      className="rounded-3xl p-4 flex flex-col gap-3"
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border-warm)',
        boxShadow: 'var(--s-card)'
      }}>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Sholat Wajib</h2>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--c-surface-alt)', color: 'var(--c-text-dark)' }}>
          {completedCount}/5
        </span>
      </div>

      <div className="h-2 w-full rounded-full" style={{ background: 'var(--c-surface-alt)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #3AE886 0%, #46C0F1 100%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${completedCount / 5 * 100}%` }}
          transition={{ duration: 0.4 }} />
      </div>

      <div className="flex flex-col gap-2">
        {wajibPrayers.map((prayer, i) => {
          const completed = dayData.prayerCompleted[i];
          const Icon = PRAYER_ICONS[i];
          return (
            <motion.button
              key={prayer.name}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onTogglePrayer(i)}
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
                  {prayer.name}
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--c-text-completed)', letterSpacing: '-0.15px' }}>
                {prayer.time}
              </span>
            </motion.button>);
        })}
      </div>
    </div>);
};

export default PrayerCard;
