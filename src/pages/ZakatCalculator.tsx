import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ZakatType = "maal" | "profesi" | "fitrah";

const NISAB_EMAS = 85; // gram
const HARGA_EMAS = 1_200_000; // per gram IDR (approximate)
const ZAKAT_RATE = 0.025;
const ZAKAT_FITRAH_PER_ORANG = 35_000; // IDR

const formatRupiah = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

const ZakatCalculator = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<ZakatType>("maal");
  const [harta, setHarta] = useState("");
  const [hutang, setHutang] = useState("");
  const [gaji, setGaji] = useState("");
  const [jiwa, setJiwa] = useState("1");

  const nisab = NISAB_EMAS * HARGA_EMAS;

  let result = 0;
  let eligible = false;

  if (type === "maal") {
    const total = Number(harta) - Number(hutang || 0);
    eligible = total >= nisab;
    result = eligible ? total * ZAKAT_RATE : 0;
  } else if (type === "profesi") {
    const total = Number(gaji);
    eligible = total * 12 >= nisab;
    result = eligible ? total * ZAKAT_RATE : 0;
  } else {
    result = Number(jiwa || 1) * ZAKAT_FITRAH_PER_ORANG;
    eligible = true;
  }

  const tabs: { key: ZakatType; label: string }[] = [
    { key: "maal", label: "Maal" },
    { key: "profesi", label: "Profesi" },
    { key: "fitrah", label: "Fitrah" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      <button onClick={() => navigate("/tools")} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-6">Kalkulator Zakat</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              type === t.key ? "gradient-primary text-primary-foreground shadow-md" : "bg-card text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {type === "maal" && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Total Harta (Rp)</label>
              <input
                type="number"
                value={harta}
                onChange={e => setHarta(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl bg-card border border-border p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Total Hutang (Rp)</label>
              <input
                type="number"
                value={hutang}
                onChange={e => setHutang(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl bg-card border border-border p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground">Nisab: {formatRupiah(nisab)} (85g emas)</p>
          </>
        )}
        {type === "profesi" && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Penghasilan Bulanan (Rp)</label>
              <input
                type="number"
                value={gaji}
                onChange={e => setGaji(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl bg-card border border-border p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground">Nisab tahunan: {formatRupiah(nisab)}</p>
          </>
        )}
        {type === "fitrah" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Jumlah Jiwa</label>
            <input
              type="number"
              value={jiwa}
              onChange={e => setJiwa(e.target.value)}
              min="1"
              className="w-full rounded-xl bg-card border border-border p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">Rp 35.000 / jiwa (atau setara 2,5 kg beras)</p>
          </div>
        )}
      </div>

      {/* Result */}
      <motion.div
        key={`${type}-${harta}-${hutang}-${gaji}-${jiwa}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-6 rounded-2xl gradient-primary p-5 text-center"
      >
        <p className="text-sm text-primary-foreground/80">
          {type === "fitrah" ? "Zakat Fitrah" : eligible ? "Zakat yang harus dibayar" : "Belum mencapai nisab"}
        </p>
        <p className="text-3xl font-bold text-primary-foreground mt-1">
          {formatRupiah(result)}
        </p>
        {type !== "fitrah" && !eligible && (Number(harta) > 0 || Number(gaji) > 0) && (
          <p className="text-xs text-primary-foreground/70 mt-2">
            Harta belum mencapai nisab {formatRupiah(nisab)}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ZakatCalculator;
