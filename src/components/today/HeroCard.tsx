import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { PrayerSchedule } from "@/lib/kala-utils";

interface HeroCardProps {
  selectedDate: Date;
  hijriDate: string;
  locationShort: string;
  ramadan: {isRamadan: boolean;dayOfRamadan: number;};
  isToday: boolean;
  countdownData: {hours: string;minutes: string;seconds: string;};
  nextPrayerName: string;
  nextPrayerTime: string;
  prayers: PrayerSchedule[];
}

const HeroCard = ({
  selectedDate, hijriDate, locationShort, ramadan,
  isToday, countdownData, nextPrayerName, nextPrayerTime, prayers
}: HeroCardProps) => {
  const dateStr = selectedDate.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const imsakiyahPrayers = prayers.filter((p) => ["Imsak", "Subuh", "Maghrib", "Isya"].includes(p.name));

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative overflow-hidden rounded-3xl p-4"
      style={{
        background: '#F6FFE7',
        border: '1px solid #FFFFFF',
        boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1), inset 0px -6px 14px rgba(0, 0, 0, 0.05), inset 0px -16px 34px 10px rgba(255, 255, 255, 0.65)',
        isolation: 'isolate',
      }}>

      {/* bg atas */}
      <div className="absolute" style={{ width: 560, height: 341, left: -67, top: -217, background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0 }} />

      {/* bg bawah group */}
      <div className="absolute" style={{ width: 546, height: 521, left: -65, top: 375, background: '#74F7B1', filter: 'blur(100px)', zIndex: 1 }} />
      <div className="absolute" style={{ width: 546, height: 521, left: -110, top: 308, background: '#00B4D8', filter: 'blur(100px)', zIndex: 1, transform: 'rotate(-76.22deg)' }} />

      <div className="relative flex flex-col items-center gap-[42px]" style={{ zIndex: 4 }}>
        {/* Greeting */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-medium" style={{ color: '#0F172B', letterSpacing: '-0.02em' }}>
            Gimana puasamu hari ini?
          </h1>
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm" style={{ color: '#62748E', letterSpacing: '-0.15px' }}>{dateStr}</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#62748E', boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)' }} />
            <span className="text-sm" style={{ color: '#62748E', letterSpacing: '-0.15px' }}>{locationShort}</span>
          </div>
        </div>

        {/* Counter section: badge + countdown + next prayer */}
        <div className="flex flex-col items-center gap-4">
          {/* Ramadan / Hijri badge */}
          {ramadan.isRamadan ? (
            <div className="flex items-center justify-center px-2 py-1 rounded-full" style={{
              background: '#FFFFFF', border: '1px solid #FFFFFF',
              boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
              borderRadius: 40,
            }}>
              <span className="text-sm" style={{ color: '#15A450', letterSpacing: '-0.15px' }}>
                {ramadan.dayOfRamadan} Ramadan 1447H
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center px-2 py-1 rounded-full" style={{
              background: '#FFFFFF', border: '1px solid #FFFFFF',
              boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
              borderRadius: 40,
            }}>
              <span className="text-sm" style={{ color: '#15A450', letterSpacing: '-0.15px' }}>{hijriDate}</span>
            </div>
          )}

          {isToday && nextPrayerName && (
            <>
              {/* Countdown numbers */}
              <div className="flex items-center justify-center gap-4 py-1">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold gradient-countdown-text" style={{ fontSize: 48, lineHeight: '48px', letterSpacing: '-2.4px' }}>{countdownData.hours}</span>
                  <span className="text-xs" style={{ color: '#5D5D5D' }}>jam</span>
                </div>
                <span className="font-bold opacity-50" style={{ fontSize: 30, lineHeight: '36px', color: '#000', letterSpacing: '0.4px' }}>:</span>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold gradient-countdown-text" style={{ fontSize: 48, lineHeight: '48px', letterSpacing: '-2.4px' }}>{countdownData.minutes}</span>
                  <span className="text-xs" style={{ color: '#5D5D5D' }}>menit</span>
                </div>
                <span className="font-bold opacity-50" style={{ fontSize: 30, lineHeight: '36px', color: '#000', letterSpacing: '0.4px' }}>:</span>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold gradient-countdown-text" style={{ fontSize: 48, lineHeight: '48px', letterSpacing: '-2.4px' }}>{countdownData.seconds}</span>
                  <span className="text-xs" style={{ color: '#5D5D5D' }}>detik</span>
                </div>
              </div>

              {/* Next prayer info */}
              <div className="flex items-center gap-2 opacity-90">
                <Clock className="h-4 w-4" style={{ color: '#124D2F' }} strokeWidth={1.5} />
                <span className="text-sm font-medium" style={{ color: '#124D2F', letterSpacing: '-0.01em' }}>Menuju {nextPrayerName}</span>
                <span className="text-sm font-medium" style={{ color: '#124D2F', letterSpacing: '-0.01em' }}>|</span>
                <span className="text-sm font-medium" style={{ color: '#124D2F', letterSpacing: '-0.01em' }}>Pukul {nextPrayerTime}</span>
              </div>
            </>
          )}
        </div>

        {/* Imsakiyah mini schedule */}
        {ramadan.isRamadan && (
          <div className="flex w-full gap-3">
            {imsakiyahPrayers.map((p) => (
              <div key={p.name} className="flex-1 flex flex-col items-center gap-0.5 py-2" style={{
                background: '#FFFFFF',
                boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
                borderRadius: 12,
              }}>
                <span className="text-xs" style={{ color: '#62748E' }}>{p.name}</span>
                <span className="text-sm font-bold" style={{ color: '#0F172B', letterSpacing: '-0.5px' }}>{p.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HeroCard;
