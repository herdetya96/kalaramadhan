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
        background: '#FFFFFF',
        border: '1px solid #F3EDE6',
        boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)'
      }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>Sholat Wajib</h2>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#F8F8F7', color: '#314158' }}>
          {completedCount}/5
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full" style={{ background: '#F8F8F7' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #3AE886 0%, #46C0F1 100%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${completedCount / 5 * 100}%` }}
          transition={{ duration: 0.4 }} />

      </div>

      {/* Prayer list */}
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
                background: '#FFFFFF',
                border: '1px solid #F3EDE6',
                boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)'
              }}>

              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={completed ? {
                    background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                    border: '1px solid #FFFFFF',
                    boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)'
                  } : {
                    background: '#F8F8F7'
                  }}>

                  {completed ?
                  <Check className="h-5 w-5" style={{ color: '#334258' }} strokeWidth={2.5} /> :

                  <Icon className="h-5 w-5" style={{ color: '#90A1B9' }} />
                  }
                </div>
                <span
                  className="font-semibold text-base"
                  style={{
                    color: completed ? '#90A1B9' : '#1D293D',
                    textDecoration: completed ? 'line-through' : 'none',
                    letterSpacing: '-0.44px'
                  }}>

                  {prayer.name}
                </span>
              </div>
              <span className="text-sm" style={{ color: '#90A1B9', letterSpacing: '-0.15px' }}>
                {prayer.time}
              </span>
            </motion.button>);

        })}
      </div>
    </div>);

};

export default PrayerCard;