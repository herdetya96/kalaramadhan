import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatHijriDate, gregorianToHijri } from "@/lib/kala-utils";

const IMPORTANT_DATES = [
  { month: 1, day: 1, name: "Tahun Baru Hijriah" },
  { month: 1, day: 10, name: "Asyura" },
  { month: 3, day: 12, name: "Maulid Nabi Muhammad SAW" },
  { month: 7, day: 27, name: "Isra' Mi'raj" },
  { month: 8, day: 15, name: "Nisfu Sya'ban" },
  { month: 9, day: 1, name: "Awal Ramadan" },
  { month: 9, day: 17, name: "Nuzulul Quran" },
  { month: 10, day: 1, name: "Idul Fitri" },
  { month: 12, day: 10, name: "Idul Adha" },
];

const HijriCalendar = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Date>(new Date());
  const hijri = gregorianToHijri(selected);

  const matchingEvent = IMPORTANT_DATES.find(
    d => d.month === hijri.month && d.day === hijri.day
  );

  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      <button onClick={() => navigate("/tools")} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-2">Kalender Hijriah</h1>
      <p className="text-sm text-muted-foreground mb-6">Pilih tanggal untuk melihat konversi Hijriah</p>

      <div className="rounded-2xl bg-card shadow-sm p-2 mb-6">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && setSelected(d)}
          className={cn("p-3 pointer-events-auto")}
        />
      </div>

      {/* Hijri info */}
      <div className="rounded-2xl bg-accent/50 p-5 text-center mb-6">
        <p className="text-sm text-muted-foreground">Tanggal Hijriah</p>
        <p className="text-xl font-bold text-foreground mt-1">{formatHijriDate(selected)}</p>
        {matchingEvent && (
          <p className="mt-2 text-sm font-medium text-primary">🌟 {matchingEvent.name}</p>
        )}
      </div>

      {/* Important dates */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Hari Besar Islam</h2>
      <div className="space-y-2">
        {IMPORTANT_DATES.map((d) => (
          <div key={d.name} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-foreground">
              {d.day}/{d.month}
            </div>
            <span className="text-sm font-medium text-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HijriCalendar;
