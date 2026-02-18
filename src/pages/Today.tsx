import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Moon, Sun, Sunrise, Sunset, CloudSun, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  WAJIB_PRAYERS, DEFAULT_PRAYERS, getNextPrayer, formatCountdown,
  isRamadan, formatHijriDate, getDailyTrivia,
  loadDayData, saveDayData, getDayKey, type DayData } from
"@/lib/kala-utils";

const SUNNAH_TASKS = [
{ id: "dhuha", label: "Sholat Dhuha", emoji: "☀️" },
{ id: "tahajud", label: "Tahajud", emoji: "🌙" },
{ id: "dzikir", label: "Dzikir Pagi/Petang", emoji: "📿" },
{ id: "sedekah", label: "Sedekah", emoji: "💝" }];


const PRAYER_ICONS = [
<Sunrise className="h-4 w-4" />,
<Sun className="h-4 w-4" />,
<CloudSun className="h-4 w-4" />,
<Sunset className="h-4 w-4" />,
<Moon className="h-4 w-4" />];


const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return "Pagi";
  if (h < 15) return "Siang";
  if (h < 18) return "Sore";
  return "Malam";
};

const Today = () => {
  const realToday = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(realToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDayData(realToday));
  const [countdownData, setCountdownData] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [nextPrayerName, setNextPrayerName] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("Memuat lokasi...");

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
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
          const state = data.address?.state || "";
          const locationStr = city ? `${city}, ${state}` : state || "Lokasi ditemukan";
          setUserLocation(locationStr);
          localStorage.setItem("kala-user-location", locationStr);
        } catch {
          setUserLocation("Gagal memuat lokasi");
        }
      },
      () => {
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

  const updateDayData = useCallback((newData: DayData) => {
    setDayData(newData);
    saveDayData(selectedDate, newData);
  }, [selectedDate]);

  // Live countdown timer - updates every second
  useEffect(() => {
    const update = () => {
      const next = getNextPrayer(new Date());
      if (next) {
        setCountdownData(formatCountdown(next.remainingSeconds));
        setNextPrayerName(next.prayer.name);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const dayOfWeek = selectedDate.getDay();
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      day: d.getDate(),
      isSelected: getDayKey(d) === getDayKey(selectedDate),
      isRealToday: getDayKey(d) === getDayKey(realToday)
    };
  });

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const goWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  const imsakPrayer = DEFAULT_PRAYERS.find((p) => p.name === "Imsak");
  const maghribPrayer = DEFAULT_PRAYERS.find((p) => p.name === "Maghrib");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-header px-6 pb-4 pt-12">
        <div className="flex items-start justify-between">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-bold text-foreground">

              {getTimeOfDay()},{" "}
              <span className="text-primary">Sahabat</span>
            </motion.h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • {hijriDate}
            </p>
          </div>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
                <CalendarDays className="h-5 w-5 text-accent-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {if (d) {setSelectedDate(d);setCalendarOpen(false);}}}
                className={cn("p-3 pointer-events-auto")} />

            </PopoverContent>
          </Popover>
        </div>

        {/* Ramadan banner */}
        {ramadan.isRamadan &&
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-3 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">

            <span className="text-2xl">🌙</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Ramadan Hari ke-{ramadan.dayOfRamadan}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{userLocation}</p>
              </div>
            </div>
          </motion.div>
        }

        {/* Beautiful countdown */}
        {isToday && nextPrayerName &&
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-3 rounded-[24px] gradient-countdown p-4 shadow-countdown relative overflow-hidden py-[24px]">

            {/* Decorative circles */}

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-primary-foreground/70" />
                <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
                  Menuju {nextPrayerName}
                </p>
              </div>

              {/* Digital clock style countdown */}
              <div className="flex items-baseline gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-4xl text-primary-foreground tabular-nums font-normal">
                    {countdownData.hours}
                  </span>
                  <span className="text-xl font-bold text-primary-foreground/50 mb-0.5">:</span>
                  <span className="text-4xl text-primary-foreground tabular-nums font-normal">
                    {countdownData.minutes}
                  </span>
                  <span className="text-xl font-bold text-primary-foreground/50 mb-0.5">:</span>
                  <span className="text-4xl text-primary-foreground tabular-nums font-normal">
                    {countdownData.seconds}
                  </span>
                </div>
              </div>

              <div className="flex gap-8 mt-1">
                <span className="text-[9px] text-primary-foreground/50 ml-1">jam</span>
                <span className="text-[9px] text-primary-foreground/50">menit</span>
                <span className="text-[9px] text-primary-foreground/50">detik</span>
              </div>
            </div>
          </motion.div>
        }

        {/* Week selector */}
        <div className="mt-4 flex items-center gap-1">
          <button onClick={() => goWeek(-1)} className="p-1 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 gap-1.5">
            {weekDays.map((d, i) =>
            <button
              key={i}
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-medium transition-all ${
              d.isSelected ?
              "bg-primary text-primary-foreground shadow-md" :
              d.isRealToday ?
              "bg-accent text-accent-foreground" :
              "text-muted-foreground"}`
              }>

                <span className="text-[10px]">{dayNames[i]}</span>
                <span className="mt-0.5 font-semibold">{d.day}</span>
              </button>
            )}
          </div>
          <button onClick={() => goWeek(1)} className="p-1 text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-6">
        {/* Not today indicator */}
        {!isToday &&
        <button
          onClick={() => setSelectedDate(realToday)}
          className="mt-3 w-full rounded-xl bg-accent/50 py-2 text-center text-xs font-medium text-primary">

            📅 Melihat {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })} — Tap untuk kembali ke hari ini
          </button>
        }

        {/* Imsakiyah mini schedule (only during Ramadan) */}
        {ramadan.isRamadan &&
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 rounded-2xl bg-card p-4 shadow-sm">

            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              🕌 Jadwal Imsakiyah
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_PRAYERS.filter((p) => ["Imsak", "Subuh", "Maghrib", "Isya"].includes(p.name)).map((p) =>
            <div key={p.name} className="text-center rounded-xl bg-accent/40 py-2.5 px-1">
                  <p className="text-[10px] text-muted-foreground font-medium">{p.name}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{p.time}</p>
                </div>
            )}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/30 px-3 py-2">
              <span className="text-xs text-muted-foreground">Durasi puasa hari ini</span>
              <span className="text-xs font-bold text-foreground">
                {imsakPrayer && maghribPrayer ?
              `${Math.floor((maghribPrayer.minutes - imsakPrayer.minutes) / 60)}j ${(maghribPrayer.minutes - imsakPrayer.minutes) % 60}m` :
              "-"
              }
              </span>
            </div>
          </motion.div>
        }

        {/* Prayer progress */}
        <div className="mb-2 mt-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Sholat Wajib</h2>
          <span className="text-xs font-medium text-primary">{completedCount}/5</span>
        </div>

        {/* Progress bar */}
        <div className="mb-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${completedCount / 5 * 100}%` }}
            transition={{ duration: 0.4 }} />

        </div>

        {/* Prayer list */}
        <div className="space-y-2.5">
          {WAJIB_PRAYERS.map((prayer, i) =>
          <motion.button
            key={prayer.name}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => togglePrayer(i)}
            className={`flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all ${
            dayData.prayerCompleted[i] ? "opacity-60" : ""}`
            }>

              <div
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              dayData.prayerCompleted[i] ?
              "bg-primary text-primary-foreground" :
              "border-2 border-border bg-background"}`
              }>

                {dayData.prayerCompleted[i] && <Check className="h-4 w-4" />}
              </div>
              <span className={`flex-1 text-left font-medium ${dayData.prayerCompleted[i] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {prayer.name}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                {PRAYER_ICONS[i]}
                <span className="text-sm">{prayer.time}</span>
              </div>
            </motion.button>
          )}
        </div>

        {/* Sunnah section */}
        <div className="mb-2 mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Ibadah Sunnah</h2>
        </div>

        <div className="space-y-2.5">
          {SUNNAH_TASKS.map((task, i) =>
          <motion.button
            key={task.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.04 }}
            onClick={() => toggleSunnah(task.id)}
            className={`flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all ${
            dayData.sunnahCompleted[task.id] ? "opacity-60" : ""}`
            }>

              <div
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              dayData.sunnahCompleted[task.id] ?
              "bg-primary text-primary-foreground" :
              "border-2 border-border bg-background"}`
              }>

                {dayData.sunnahCompleted[task.id] && <Check className="h-4 w-4" />}
              </div>
              <span className={`flex-1 text-left font-medium ${dayData.sunnahCompleted[task.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.label}
              </span>
              <span className="text-lg">{task.emoji}</span>
            </motion.button>
          )}
        </div>

        {/* Trivia section */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 mb-4 rounded-2xl bg-card p-5 shadow-sm border border-border">

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{trivia.emoji}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-accent px-2 py-0.5 rounded-full">
              {trivia.category === "sejarah" ? "Sejarah Islam" : trivia.category === "kisah" ? "Kisah Nabi" : trivia.category === "fakta" ? "Fakta Menarik" : "Hikmah"}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {trivia.text}
          </p>
          {ramadan.isRamadan &&
          <p className="mt-3 text-[10px] text-muted-foreground">
              Trivia Ramadan hari ke-{ramadan.dayOfRamadan}
            </p>
          }
        </motion.div>
      </div>
    </div>);

};

export default Today;