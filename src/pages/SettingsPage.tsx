import { useState, useEffect } from "react";
import { MapPin, Bell, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const [currentLocation, setCurrentLocation] = useState<string>(() =>
    localStorage.getItem("kala-user-location") || ""
  );
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleRecalibrate = () => {
    if (isCalibrating) return;
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung browser ini");
      return;
    }

    setIsCalibrating(true);
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
          setCurrentLocation(locationStr);
          localStorage.setItem("kala-user-location", locationStr);
          localStorage.setItem("kala-user-coords", JSON.stringify({ lat: latitude, lon: longitude }));
          toast.success(`Lokasi diperbarui: ${locationStr}`);
        } catch {
          toast.error("Gagal memperbarui lokasi");
        } finally {
          setIsCalibrating(false);
        }
      },
      () => {
        toast.error("Izinkan akses lokasi untuk kalibrasi");
        setIsCalibrating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const settings = [
    {
      icon: MapPin,
      label: "Lokasi",
      desc: isCalibrating
        ? "Mengkalibrasi lokasi..."
        : currentLocation || "Atur lokasi untuk waktu sholat akurat",
      onClick: handleRecalibrate,
    },
    { icon: Bell, label: "Notifikasi Adzan", desc: "Pengingat waktu sholat" },
    { icon: Info, label: "Tentang Kala", desc: "Versi 1.0 — Pendamping ibadah harianmu" },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560, height: 341, left: '50%', top: -209, transform: 'translateX(-50%)',
          background: '#CCFF3F', filter: 'blur(100px)', zIndex: 0,
        }}
      />
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
            const isLocation = item.label === "Lokasi";
            return (
              <div
                key={item.label}
                className={`flex w-full items-center gap-4 rounded-2xl p-4${isLocation ? ' cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F3EDE6',
                  boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.05)',
                }}
                onClick={item.onClick}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full flex-shrink-0"
                  style={{ background: '#F8F8F7' }}
                >
                  {isLocation && isCalibrating ? (
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#334258' }} />
                  ) : (
                    <Icon className="h-5 w-5" style={{ color: '#334258' }} />
                  )}
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
};

export default SettingsPage;
