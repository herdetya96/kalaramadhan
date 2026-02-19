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
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      {/* bg atas - green */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560, height: 341, left: '50%', top: -209, transform: 'translateX(-50%)',
          background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0,
        }}
      />
      {/* bg - blue */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 546, height: 521, left: 19, top: -535,
          background: '#00B4D8', filter: 'blur(100px)', transform: 'rotate(-76.22deg)', zIndex: 1,
        }}
      />

      <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
        {/* Header */}
        <div className="flex flex-col items-center py-3">
          <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
            Kalkulator Zakat
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className="flex-1 rounded-full py-2.5 text-sm font-bold transition-all"
              style={type === t.key ? {
                background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
                border: '1px solid #FFFFFF',
                boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
                color: '#314158',
              } : {
                background: '#F8F8F7',
                color: '#838A96',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input card */}
        <motion.div
          key={type}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-3xl p-4 flex flex-col gap-4"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3EDE6',
            boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
          }}
        >
          {type === "maal" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
                  Total Harta (Rp)
                </label>
                <input
                  type="number"
                  value={harta}
                  onChange={e => setHarta(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: '#F8F8F7', border: '1px solid #F3EDE6', color: '#1D293D' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
                  Total Hutang (Rp)
                </label>
                <input
                  type="number"
                  value={hutang}
                  onChange={e => setHutang(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: '#F8F8F7', border: '1px solid #F3EDE6', color: '#1D293D' }}
                />
              </div>
              <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
                Nisab: {formatRupiah(nisab)} (85g emas)
              </span>
            </>
          )}
          {type === "profesi" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
                  Penghasilan Bulanan (Rp)
                </label>
                <input
                  type="number"
                  value={gaji}
                  onChange={e => setGaji(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: '#F8F8F7', border: '1px solid #F3EDE6', color: '#1D293D' }}
                />
              </div>
              <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
                Nisab tahunan: {formatRupiah(nisab)}
              </span>
            </>
          )}
          {type === "fitrah" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
                  Jumlah Jiwa
                </label>
                <input
                  type="number"
                  value={jiwa}
                  onChange={e => setJiwa(e.target.value)}
                  min="1"
                  className="w-full rounded-2xl p-3 text-sm outline-none"
                  style={{ background: '#F8F8F7', border: '1px solid #F3EDE6', color: '#1D293D' }}
                />
              </div>
              <span className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>
                Rp 35.000 / jiwa (atau setara 2,5 kg beras)
              </span>
            </>
          )}
        </motion.div>

        {/* Result card */}
        <motion.div
          key={`result-${type}-${harta}-${hutang}-${gaji}-${jiwa}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full rounded-3xl p-6 flex flex-col items-center gap-2"
          style={{
            background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
            border: '1px solid #FFFFFF',
            boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1), 0px 30px 46px rgba(223, 150, 55, 0.1)',
          }}
        >
          <span className="text-sm font-medium" style={{ color: '#314158' }}>
            {type === "fitrah" ? "Zakat Fitrah" : eligible ? "Zakat yang harus dibayar" : "Belum mencapai nisab"}
          </span>
          <span className="text-3xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
            {formatRupiah(result)}
          </span>
          {type !== "fitrah" && !eligible && (Number(harta) > 0 || Number(gaji) > 0) && (
            <span className="text-xs" style={{ color: '#314158' }}>
              Harta belum mencapai nisab {formatRupiah(nisab)}
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ZakatCalculator;