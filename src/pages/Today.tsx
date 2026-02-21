import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Clock, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  WAJIB_PRAYERS, DEFAULT_PRAYERS, getNextPrayer, formatCountdown,
  isRamadan, formatHijriDate, getDailyTrivia, fetchPrayerTimes, getWajibFromPrayers,
  loadDayData, saveDayData, getDayKey, type DayData, type PrayerSchedule
} from "@/lib/kala-utils";
import HeroCard from "@/components/today/HeroCard";
import WeekSelector from "@/components/today/WeekSelector";
import PrayerCard from "@/components/today/PrayerCard";
import SunnahSection from "@/components/today/SunnahSection";
import TriviaCard from "@/components/today/TriviaCard";

const Today = () => {
  const navigate = useNavigate();
  const realToday = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(realToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDayData(realToday));
  const [countdownData, setCountdownData] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [nextPrayerName, setNextPrayerName] = useState("");
  const [nextPrayerTime, setNextPrayerTime] = useState("");
  const [userLocation, setUserLocation] = useState<string>("Memuat lokasi...");
  const [prayers, setPrayers] = useState<PrayerSchedule[]>(DEFAULT_PRAYERS);
  const [wajibPrayers, setWajibPrayers] = useState<PrayerSchedule[]>(WAJIB_PRAYERS);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  // GPS location detection
  useEffect(() => {
    const saved = localStorage.getItem("kala-user-location");
    if (saved) setUserLocation(saved);

    if (!navigator.geolocation) {
      setUserLocation("Lokasi tidak tersedia");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lon: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
          const state = data.address?.state || "";
          const locationStr = city ? `${city}, ${state}` : state || "Lokasi ditemukan";
          setUserLocation(locationStr);
          localStorage.setItem("kala-user-location", locationStr);
          localStorage.setItem("kala-user-coords", JSON.stringify({ lat: latitude, lon: longitude }));
        } catch {
          setUserLocation("Gagal memuat lokasi");
        }
      },
      () => {
        const savedCoords = localStorage.getItem("kala-user-coords");
        if (savedCoords) setUserCoords(JSON.parse(savedCoords));
        if (!saved) setUserLocation("Izinkan akses lokasi");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const isToday = getDayKey(selectedDate) === getDayKey(realToday);
  const ramadan = isRamadan(selectedDate);
  const hijriDate = formatHijriDate(selectedDate);
  const trivia = getDailyTrivia(selectedDate);

  useEffect(() => {
    setDayData(loadDayData(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    if (!userCoords) return;
    fetchPrayerTimes(userCoords.lat, userCoords.lon, selectedDate)
      .then((fetched) => {
        setPrayers(fetched);
        setWajibPrayers(getWajibFromPrayers(fetched));
      })
      .catch(() => {
        setPrayers(DEFAULT_PRAYERS);
        setWajibPrayers(WAJIB_PRAYERS);
      });
  }, [userCoords, selectedDate]);

  const updateDayData = useCallback((newData: DayData) => {
    setDayData(newData);
    saveDayData(selectedDate, newData);
  }, [selectedDate]);

  useEffect(() => {
    const update = () => {
      const next = getNextPrayer(new Date(), wajibPrayers);
      if (next) {
        setCountdownData(formatCountdown(next.remainingSeconds));
        setNextPrayerName(next.prayer.name);
        setNextPrayerTime(next.prayer.time);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [wajibPrayers]);

  const togglePrayer = (index: number) => {
    const newCompleted = [...dayData.prayerCompleted];
    newCompleted[index] = !newCompleted[index];
    updateDayData({ ...dayData, prayerCompleted: newCompleted });
  };

  const toggleSunnah = (id: string) => {
    updateDayData({
      ...dayData,
      sunnahCompleted: { ...dayData.sunnahCompleted, [id]: !dayData.sunnahCompleted[id] }
    });
  };

  const completedCount = dayData.prayerCompleted.filter(Boolean).length;

  // Location short name (city only)
  const locationShort = userLocation.split(",")[0]?.trim() || userLocation;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Card */}
      <div className="px-4 pt-6">
        <HeroCard
          selectedDate={selectedDate}
          hijriDate={hijriDate}
          locationShort={locationShort}
          ramadan={ramadan}
          isToday={isToday}
          countdownData={countdownData}
          nextPrayerName={nextPrayerName}
          nextPrayerTime={nextPrayerTime}
          prayers={prayers}
        />
      </div>

      {/* Puasa Check-in Card */}
      <div className="px-4 mt-2">
        <button
          onClick={() => navigate('/puasa')}
          className="w-full rounded-3xl p-4 flex flex-col gap-4 text-left"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
                Check-in puasa harian
              </span>
              <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
                Check-in baru bisa dilakukan setelah Maghrib ya!
              </span>
            </div>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40, height: 40,
                background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                border: '1px solid #FFFFFF',
                boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
                borderRadius: 40,
              }}
            >
              <ChevronRightIcon className="h-5 w-5" style={{ color: '#334258' }} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ border: '1px solid #F3EDE6', letterSpacing: '-0.15px' }}
            >
              <span style={{ color: '#62748E' }}>Durasi puasa hari ini </span><span style={{ color: '#38CA5E', fontWeight: 700 }}>13j 25m</span>
            </span>
            <span
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ border: '1px solid #F3EDE6', letterSpacing: '-0.15px' }}
            >
              <span style={{ color: '#62748E' }}>Streak </span><span style={{ color: '#38CA5E', fontWeight: 700 }}>{(() => { let c = 0; const d = new Date(); const td = loadDayData(d); if (!td.sunnahCompleted["puasa"]) d.setDate(d.getDate() - 1); while (true) { const data = loadDayData(d); if (data.sunnahCompleted["puasa"]) { c++; d.setDate(d.getDate() - 1); } else break; } return c; })()} hari</span>
            </span>
          </div>
        </button>
      </div>

      {/* Week Selector */}
      <div className="px-4 mt-2">
        <WeekSelector
          selectedDate={selectedDate}
          realToday={realToday}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Content */}
      <div className="px-4 mt-2 flex flex-col gap-2">
        {/* Not today indicator */}
        {!isToday && (
          <button
            onClick={() => setSelectedDate(realToday)}
            className="w-full rounded-xl bg-accent/50 py-2 text-center text-xs font-medium text-accent-foreground"
          >
            📅 Melihat {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })} — Tap untuk kembali ke hari ini
          </button>
        )}

        {/* Prayer Card */}
        <PrayerCard
          wajibPrayers={wajibPrayers}
          dayData={dayData}
          completedCount={completedCount}
          onTogglePrayer={togglePrayer}
        />

        {/* Sunnah Section */}
        <SunnahSection
          dayData={dayData}
          onToggleSunnah={toggleSunnah}
        />

        {/* Trivia */}
        <TriviaCard trivia={trivia} ramadan={ramadan} />
      </div>
    </div>
  );
};

export default Today;
