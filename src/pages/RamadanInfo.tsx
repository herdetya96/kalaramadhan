import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isRamadan, gregorianToHijri, DEFAULT_PRAYERS } from "@/lib/kala-utils";

const RamadanInfo = () => {
  const navigate = useNavigate();
  const today = new Date();
  const ramadan = isRamadan(today);
  const hijri = gregorianToHijri(today);

  const imsakTime = DEFAULT_PRAYERS.find(p => p.name === "Imsak")?.time || "04:25";
  const maghribTime = DEFAULT_PRAYERS.find(p => p.name === "Maghrib")?.time || "17:50";
  const subuhTime = DEFAULT_PRAYERS.find(p => p.name === "Subuh")?.time || "04:35";

  // Generate 30-day imsakiyah schedule (simplified)
  const schedule = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    imsak: imsakTime,
    subuh: subuhTime,
    maghrib: maghribTime,
    isToday: ramadan.isRamadan && ramadan.dayOfRamadan === i + 1,
  }));

  const amalanRamadan = [
    { emoji: "📖", label: "Tadarus Al-Quran", desc: "Khatam 1 juz per hari" },
    { emoji: "🤲", label: "Sholat Tarawih", desc: "Sholat malam di bulan Ramadan" },
    { emoji: "💝", label: "Sedekah & Infaq", desc: "Perbanyak amal kebaikan" },
    { emoji: "🌙", label: "I'tikaf", desc: "Berdiam di masjid 10 hari terakhir" },
    { emoji: "🕐", label: "Sahur & Berbuka", desc: "Tepat waktu untuk berkah" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      <button onClick={() => navigate("/tools")} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-2">🌙 Info Ramadan</h1>

      {ramadan.isRamadan ? (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl gradient-primary p-5 text-center mb-6">
          <p className="text-sm text-primary-foreground/80">Ramadan {hijri.year}H</p>
          <p className="text-4xl font-bold text-primary-foreground mt-1">Hari ke-{ramadan.dayOfRamadan}</p>
          <div className="flex justify-center gap-6 mt-3">
            <div>
              <p className="text-xs text-primary-foreground/70">Imsak</p>
              <p className="text-lg font-bold text-primary-foreground">{imsakTime}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Berbuka</p>
              <p className="text-lg font-bold text-primary-foreground">{maghribTime}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl bg-accent/50 p-5 text-center mb-6">
          <p className="text-muted-foreground">Saat ini bukan bulan Ramadan</p>
          <p className="text-sm text-muted-foreground mt-1">
            Bulan saat ini: {hijri.monthName} {hijri.year}H
          </p>
        </div>
      )}

      {/* Amalan Ramadan */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Amalan Ramadan</h2>
      <div className="space-y-2 mb-6">
        {amalanRamadan.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm"
          >
            <span className="text-xl">{a.emoji}</span>
            <div>
              <p className="font-medium text-foreground text-sm">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Imsakiyah schedule */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Jadwal Imsakiyah</h2>
      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 gap-0 px-4 py-2 border-b border-border text-[10px] font-semibold text-muted-foreground">
          <span>Hari</span>
          <span className="text-center">Imsak</span>
          <span className="text-center">Subuh</span>
          <span className="text-center">Maghrib</span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {schedule.map(s => (
            <div key={s.day} className={`grid grid-cols-4 gap-0 px-4 py-2.5 text-xs ${s.isToday ? "bg-accent font-bold" : ""}`}>
              <span className={s.isToday ? "text-primary" : "text-foreground"}>{s.day}</span>
              <span className="text-center text-muted-foreground">{s.imsak}</span>
              <span className="text-center text-muted-foreground">{s.subuh}</span>
              <span className="text-center text-muted-foreground">{s.maghrib}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RamadanInfo;
