import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { PrayerSchedule } from "@/lib/kala-utils";

interface HeroCardProps {
  selectedDate: Date;
  hijriDate: string;
  locationShort: string;
  ramadan: { isRamadan: boolean; dayOfRamadan: number };
  isToday: boolean;
  countdownData: { hours: string; minutes: string; seconds: string };
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

  const imsakiyahPrayers = prayers.filter(p => ["Imsak", "Subuh", "Maghrib", "Isya"].includes(p.name));

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative overflow-hidden rounded-3xl p-4"
      style={{
        background: '#F6FFE7',
        border: '1px solid #FFFFFF',
        boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1), inset 0px -6px 14px rgba(0, 0, 0, 0.05), inset 0px -16px 34px 10px rgba(255, 255, 255, 0.65)',
      }}
    >
      {/* Blurred decorative blobs */}
      <div className="absolute -top-[217px] -left-[67px] w-[560px] h-[341px] rounded-full" style={{ background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0 }} />
      <div className="absolute top-[200px] left-[8px] w-[560px] h-[341px] rounded-full" style={{ background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0 }} />
      <div className="absolute top-[180px] -left-[65px] w-[546px] h-[521px] rounded-full" style={{ background: '#74F7B1', filter: 'blur(100px)', zIndex: 0 }} />
      <div className="absolute top-[150px] -left-[110px] w-[546px] h-[521px] rounded-full" style={{ background: '#00B4D8', filter: 'blur(100px)', zIndex: 0, transform: 'rotate(-76deg)' }} />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Greeting */}
        <div className="flex flex-col items-center gap-1 mt-8">
          <h1 className="text-xl font-medium tracking-tight" style={{ color: '#0F172B' }}>
            Gimana puasamu hari ini?
          </h1>
          <div className="flex items-center gap-1">
            <span className="text-sm" style={{ color: '#62748E' }}>{dateStr}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white border border-white shadow-card" />
            <span className="text-sm" style={{ color: '#62748E' }}>{locationShort}</span>
          </div>
        </div>

        {/* Hijri badge */}
        {ramadan.isRamadan && (
          <div className="flex items-center justify-center px-2 py-1 rounded-full bg-white border border-white shadow-card">
            <span className="text-sm" style={{ color: '#15A450' }}>
              {ramadan.dayOfRamadan} Ramadan 1447H
            </span>
          </div>
        )}
        {!ramadan.isRamadan && (
          <div className="flex items-center justify-center px-2 py-1 rounded-full bg-white border border-white shadow-card">
            <span className="text-sm" style={{ color: '#15A450' }}>{hijriDate}</span>
          </div>
        )}

        {/* Countdown */}
        {isToday && nextPrayerName && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4 py-1">
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl font-bold tracking-tighter gradient-countdown-text">{countdownData.hours}</span>
                <span className="text-xs" style={{ color: '#5D5D5D' }}>jam</span>
              </div>
              <span className="text-3xl font-bold opacity-50 -mt-5" style={{ color: '#000' }}>:</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl font-bold tracking-tighter gradient-countdown-text">{countdownData.minutes}</span>
                <span className="text-xs" style={{ color: '#5D5D5D' }}>menit</span>
              </div>
              <span className="text-3xl font-bold opacity-50 -mt-5" style={{ color: '#000' }}>:</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl font-bold tracking-tighter gradient-countdown-text">{countdownData.seconds}</span>
                <span className="text-xs" style={{ color: '#5D5D5D' }}>detik</span>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-90">
              <Clock className="h-4 w-4" style={{ color: '#124D2F' }} strokeWidth={1.5} />
              <span className="text-sm font-medium" style={{ color: '#124D2F' }}>Menuju {nextPrayerName}</span>
              <span className="text-sm font-medium" style={{ color: '#124D2F' }}>|</span>
              <span className="text-sm font-medium" style={{ color: '#124D2F' }}>Pukul {nextPrayerTime}</span>
            </div>
          </div>
        )}

        {/* Imsakiyah mini schedule */}
        {ramadan.isRamadan && (
          <div className="flex w-full gap-3">
            {imsakiyahPrayers.map((p) => (
              <div key={p.name} className="flex-1 flex flex-col items-center gap-0.5 py-2 bg-white rounded-xl shadow-card">
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
