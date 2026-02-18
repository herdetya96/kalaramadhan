import { motion } from "framer-motion";
import { Calculator, CalendarDays, Moon, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tools = [
  { icon: Calculator, label: "Kalkulator Zakat", desc: "Hitung zakat Maal, Profesi & Fitrah", path: "/tools/zakat" },
  { icon: CalendarDays, label: "Kalender Hijriah", desc: "Konversi tanggal & hari besar Islam", path: "/tools/hijri" },
  { icon: Moon, label: "Info Ramadan", desc: "Jadwal imsakiyah & info puasa", path: "/tools/ramadan" },
];

const Tools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Alat Bantu</h1>
      <div className="space-y-3">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.label}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(tool.path)}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                <Icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Tools;
