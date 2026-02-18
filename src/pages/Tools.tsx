import { Calculator, CalendarDays, Moon } from "lucide-react";

const tools = [
  { icon: Calculator, label: "Kalkulator Zakat", desc: "Hitung zakat Maal, Profesi & Fitrah" },
  { icon: CalendarDays, label: "Kalender Hijriah", desc: "Tanggal penting Islam" },
  { icon: Moon, label: "Mode Ramadan", desc: "Jadwal imsakiyah & amalan khusus" },
];

const Tools = () => (
  <div className="min-h-screen bg-background pb-24 pt-12 px-6">
    <h1 className="text-2xl font-bold text-foreground mb-6">Alat Bantu</h1>
    <div className="space-y-3">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <div key={tool.label} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <Icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{tool.label}</p>
              <p className="text-xs text-muted-foreground">{tool.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default Tools;
