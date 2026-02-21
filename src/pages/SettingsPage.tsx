import { useState, useRef } from "react";
import { MapPin, Bell, Info, Loader2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const [currentLocation, setCurrentLocation] = useState<string>(() =>
    localStorage.getItem("kala-user-location") || ""
  );
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Record<string, any> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = () => {
    const data: Record<string, any> = { dailyData: {} };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      try {
        if (key.startsWith("kala_data_")) {
          data.dailyData[key.replace("kala_data_", "")] = JSON.parse(localStorage.getItem(key)!);
        } else if (key === "kala_quran_progress") {
          data.quranProgress = JSON.parse(localStorage.getItem(key)!);
        } else if (key === "kala_quran_bookmarks") {
          data.quranBookmarks = JSON.parse(localStorage.getItem(key)!);
        } else if (key === "kala_quran_khatam") {
          data.quranKhatam = JSON.parse(localStorage.getItem(key)!);
        }
      } catch { /* skip malformed */ }
    }

    const loc = localStorage.getItem("kala-user-location");
    const coords = localStorage.getItem("kala-user-coords");
    if (loc) data.location = loc;
    if (coords) try { data.coords = JSON.parse(coords); } catch {}

    const backup = {
      version: "1.0",
      appName: "Kala",
      exportDate: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kala-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data berhasil diekspor");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.version || !parsed.appName || parsed.appName !== "Kala" || !parsed.data) {
          toast.error("Format file tidak valid");
          return;
        }
        setPendingImportData(parsed.data);
        setImportDialogOpen(true);
      } catch {
        toast.error("Format file tidak valid");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!pendingImportData) return;
    const d = pendingImportData;

    if (d.dailyData && typeof d.dailyData === "object") {
      Object.entries(d.dailyData).forEach(([date, val]) => {
        localStorage.setItem(`kala_data_${date}`, JSON.stringify(val));
      });
    }
    if (d.quranProgress !== undefined) localStorage.setItem("kala_quran_progress", JSON.stringify(d.quranProgress));
    if (d.quranBookmarks !== undefined) localStorage.setItem("kala_quran_bookmarks", JSON.stringify(d.quranBookmarks));
    if (d.quranKhatam !== undefined) localStorage.setItem("kala_quran_khatam", JSON.stringify(d.quranKhatam));
    if (d.location) localStorage.setItem("kala-user-location", d.location);
    if (d.coords) localStorage.setItem("kala-user-coords", JSON.stringify(d.coords));

    toast.success("Data berhasil diimpor, memuat ulang...");
    setPendingImportData(null);
    setImportDialogOpen(false);
    setTimeout(() => window.location.reload(), 800);
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
    { icon: Download, label: "Export Data", desc: "Unduh backup data ibadahmu", onClick: handleExport },
    { icon: Upload, label: "Import Data", desc: "Pulihkan data dari file backup", onClick: handleImportClick },
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
            const isClickable = !!item.onClick;
            return (
              <div
                key={item.label}
                className={`flex w-full items-center gap-4 rounded-2xl p-4${isClickable ? ' cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
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
                  {item.label === "Lokasi" && isCalibrating ? (
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent className="rounded-2xl mx-4 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Impor Data</AlertDialogTitle>
            <AlertDialogDescription>
              Data saat ini akan ditimpa dengan data dari file backup. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImportData(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Ya, Impor</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
