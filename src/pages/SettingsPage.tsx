import { MapPin, Bell, Info } from "lucide-react";

const settings = [
  { icon: MapPin, label: "Lokasi", desc: "Atur lokasi untuk waktu sholat akurat" },
  { icon: Bell, label: "Notifikasi Adzan", desc: "Pengingat waktu sholat" },
  { icon: Info, label: "Tentang Kala", desc: "Versi 1.0 — Pendamping ibadah harianmu" },
];

const SettingsPage = () => (
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
      <div className="flex flex-col items-center py-3">
        <h1 className="text-xl font-bold" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>Setelan</h1>
      </div>

      <div className="flex flex-col gap-2">
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex w-full items-center gap-4 rounded-2xl p-4"
              style={{
                background: '#FFFFFF',
                border: '1px solid #F3EDE6',
                boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)',
              }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full flex-shrink-0"
                style={{ background: '#F8F8F7' }}
              >
                <Icon className="h-5 w-5" style={{ color: '#334258' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>{item.label}</p>
                <p className="text-xs" style={{ color: '#838A96', letterSpacing: '-0.15px' }}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default SettingsPage;