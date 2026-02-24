import { useState } from "react";
import { motion } from "framer-motion";

type ZakatType = "maal" | "profesi" | "fitrah";

const NISAB_EMAS = 85;
const HARGA_EMAS = 1_200_000;
const ZAKAT_RATE = 0.025;
const ZAKAT_FITRAH_PER_ORANG = 35_000;

const formatRupiah = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

const ZakatCalculator = () => {
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
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
      <div className="absolute pointer-events-none" style={{ width: '100%', height: 286, left: 0, top: 0, background: 'var(--page-header-bg)', zIndex: 0 }} />

      <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
        <div className="flex flex-col items-center py-3">
          <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Kalkulator Zakat</h1>
        </div>

        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              className="flex-1 rounded-full py-2.5 text-sm font-bold transition-all"
              style={type === t.key ? {
                background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                border: '1px solid #FFFFFF', boxShadow: 'var(--s-complex)', color: '#314158',
              } : { background: 'var(--c-surface-alt)', color: 'var(--c-text-muted)' }}
            >{t.label}</button>
          ))}
        </div>

        <motion.div key={type} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-3xl p-4 flex flex-col gap-4"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          {type === "maal" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Total Harta (Rp)</label>
                <input type="number" value={harta} onChange={e => setHarta(e.target.value)} placeholder="0"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)', color: 'var(--c-text)' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Total Hutang (Rp)</label>
                <input type="number" value={hutang} onChange={e => setHutang(e.target.value)} placeholder="0"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)', color: 'var(--c-text)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>Nisab: {formatRupiah(nisab)} (85g emas)</span>
            </>
          )}
          {type === "profesi" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Penghasilan Bulanan (Rp)</label>
                <input type="number" value={gaji} onChange={e => setGaji(e.target.value)} placeholder="0"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)', color: 'var(--c-text)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>Nisab tahunan: {formatRupiah(nisab)}</span>
            </>
          )}
          {type === "fitrah" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Jumlah Jiwa</label>
                <input type="number" value={jiwa} onChange={e => setJiwa(e.target.value)} min="1"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)', color: 'var(--c-text)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.15px' }}>Rp 35.000 / jiwa (atau setara 2,5 kg beras)</span>
            </>
          )}
        </motion.div>

        <motion.div key={`result-${type}-${harta}-${hutang}-${gaji}-${jiwa}`}
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full rounded-3xl p-6 flex flex-col items-center gap-2"
          style={{ background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)', border: '1px solid #FFFFFF', boxShadow: 'var(--s-complex)' }}>
          <span className="text-sm font-medium" style={{ color: '#314158' }}>
            {type === "fitrah" ? "Zakat Fitrah" : eligible ? "Zakat yang harus dibayar" : "Belum mencapai nisab"}
          </span>
          <span className="text-3xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>{formatRupiah(result)}</span>
          {type !== "fitrah" && !eligible && (Number(harta) > 0 || Number(gaji) > 0) && (
            <span className="text-xs" style={{ color: '#314158' }}>Harta belum mencapai nisab {formatRupiah(nisab)}</span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ZakatCalculator;
