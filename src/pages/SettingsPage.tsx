import { useState, useRef } from "react";
import { MapPin, Bell, Info, Loader2, Download, Upload, User, ChevronRight, LogIn, Moon as MoonIcon, Sun as SunIcon } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [currentLocation, setCurrentLocation] = useState<string>(() =>
  localStorage.getItem("kala-user-location") || ""
  );
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Record<string, any> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = false;

  const handleRecalibrate = () => {
    if (isCalibrating) return;
    if (!navigator.geolocation) { toast.error("Geolocation tidak didukung browser ini"); return; }
    setIsCalibrating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
          const state = data.address?.state || "";
          const locationStr = city ? `${city}, ${state}` : state || "Lokasi ditemukan";
          setCurrentLocation(locationStr);
          localStorage.setItem("kala-user-location", locationStr);
          localStorage.setItem("kala-user-coords", JSON.stringify({ lat: latitude, lon: longitude }));
          toast.success(`Lokasi diperbarui: ${locationStr}`);
        } catch { toast.error("Gagal memperbarui lokasi"); }
        finally { setIsCalibrating(false); }
      },
      () => { toast.error("Izinkan akses lokasi untuk kalibrasi"); setIsCalibrating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleExport = () => {
    const data: Record<string, any> = { dailyData: {} };
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      try {
        if (key.startsWith("kala_data_")) { data.dailyData[key.replace("kala_data_", "")] = JSON.parse(localStorage.getItem(key)!); }
        else if (key === "kala_quran_progress") { data.quranProgress = JSON.parse(localStorage.getItem(key)!); }
        else if (key === "kala_quran_bookmarks") { data.quranBookmarks = JSON.parse(localStorage.getItem(key)!); }
        else if (key === "kala_quran_khatam") { data.quranKhatam = JSON.parse(localStorage.getItem(key)!); }
      } catch {}
    }
    const loc = localStorage.getItem("kala-user-location");
    const coords = localStorage.getItem("kala-user-coords");
    if (loc) data.location = loc;
    if (coords) try { data.coords = JSON.parse(coords); } catch {}
    const backup = { version: "1.0", appName: "Kala", exportDate: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `kala-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Data berhasil diekspor");
  };

  const handleImportClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.version || !parsed.appName || parsed.appName !== "Kala" || !parsed.data) { toast.error("Format file tidak valid"); return; }
        setPendingImportData(parsed.data); setImportDialogOpen(true);
      } catch { toast.error("Format file tidak valid"); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const confirmImport = () => {
    if (!pendingImportData) return;
    const d = pendingImportData;
    if (d.dailyData && typeof d.dailyData === "object") { Object.entries(d.dailyData).forEach(([date, val]) => { localStorage.setItem(`kala_data_${date}`, JSON.stringify(val)); }); }
    if (d.quranProgress !== undefined) localStorage.setItem("kala_quran_progress", JSON.stringify(d.quranProgress));
    if (d.quranBookmarks !== undefined) localStorage.setItem("kala_quran_bookmarks", JSON.stringify(d.quranBookmarks));
    if (d.quranKhatam !== undefined) localStorage.setItem("kala_quran_khatam", JSON.stringify(d.quranKhatam));
    if (d.location) localStorage.setItem("kala-user-location", d.location);
    if (d.coords) localStorage.setItem("kala-user-coords", JSON.stringify(d.coords));
    toast.success("Data berhasil diimpor, memuat ulang...");
    setPendingImportData(null); setImportDialogOpen(false);
    setTimeout(() => window.location.reload(), 800);
  };

  type SettingItem = { icon: typeof MapPin; label: string; desc: string; onClick?: () => void; rightElement?: React.ReactNode; };

  const settingGroups: {title: string;items: SettingItem[];}[] = [
  {
    title: "Umum",
    items: [
    {
      icon: MapPin,
      label: "Lokasi",
      desc: isCalibrating ? "Mengkalibrasi lokasi..." : currentLocation || "Atur lokasi untuk waktu sholat akurat",
      onClick: handleRecalibrate
    },
    {
      icon: theme === "dark" ? MoonIcon : SunIcon,
      label: "Mode Gelap",
      desc: theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif",
      onClick: toggleTheme,
      rightElement: (
        <div className="flex items-center justify-center w-12 h-7 rounded-full transition-colors" style={{ background: theme === "dark" ? '#38CA5E' : 'var(--c-progress-bg)' }}>
          <div className="w-5 h-5 rounded-full transition-transform" style={{ background: 'var(--c-surface)', transform: theme === "dark" ? 'translateX(10px)' : 'translateX(-10px)' }} />
        </div>
      )
    },
    { icon: Bell, label: "Notifikasi Adzan", desc: "Pengingat waktu sholat" }]
  },
  {
    title: "Data",
    items: [
    { icon: Download, label: "Export Data", desc: "Unduh backup data ibadahmu", onClick: handleExport },
    { icon: Upload, label: "Import Data", desc: "Pulihkan data dari file backup", onClick: handleImportClick }]
  },
  {
    title: "Lainnya",
    items: [
    { icon: Info, label: "Tentang Kala", desc: "Versi 1.0 — Pendamping ibadah harianmu" }]
  }];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
      <div className="absolute pointer-events-none" style={{ width: '100%', height: 286, left: 0, top: 0, background: 'var(--page-header-bg)', zIndex: 0 }} />

      <div className="relative z-10 flex flex-col pt-6 px-4 gap-5">
        <div className="flex flex-col items-center py-2">
          <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Setelan</h1>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, hsl(150 70% 96%) 0%, hsl(80 100% 96%) 100%)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card)' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0" style={{ background: 'hsl(var(--primary) / 0.12)' }}>
            {isLoggedIn ? <img src="" alt="avatar" className="h-12 w-12 rounded-full object-cover" /> : <User className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            {isLoggedIn ? (
              <><p className="font-semibold text-base truncate" style={{ color: 'var(--c-text)' }}>Nama User</p><p className="text-xs truncate" style={{ color: 'var(--c-text-muted)' }}>email@example.com</p></>
            ) : (
              <><p className="font-semibold text-base" style={{ color: 'var(--c-text)' }}>Masuk ke Akun</p><p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Fitur ini akan tersedia secepatnya!</p></>
            )}
          </div>
          {!isLoggedIn && <LogIn className="h-5 w-5 text-primary flex-shrink-0" />}
          {isLoggedIn && <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--c-text-muted)' }} />}
        </div>

        {/* Setting Groups */}
        {settingGroups.map((group) =>
        <div key={group.title} className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider pl-1 mb-1" style={{ color: 'var(--c-text-muted)' }}>{group.title}</p>
            <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}>
              {group.items.map((item, idx) => {
              const Icon = item.icon;
              const isClickable = !!item.onClick;
              const isLocation = item.label === "Lokasi";
              return (
                <div key={item.label}
                  className={`flex w-full items-center gap-4 p-4${isClickable ? ' cursor-pointer active:bg-muted transition-colors' : ''}${idx < group.items.length - 1 ? ' border-b border-border' : ''}`}
                  style={{ background: 'var(--c-surface)' }}
                  onClick={item.onClick}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: 'var(--c-surface-alt)' }}>
                      {isLocation && isCalibrating ?
                    <Loader2 className="h-[18px] w-[18px] animate-spin" style={{ color: 'var(--c-text-secondary)' }} /> :
                    <Icon className="h-[18px] w-[18px]" style={{ color: 'var(--c-text-secondary)' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[15px]" style={{ color: 'var(--c-text)', letterSpacing: '-0.3px' }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)', letterSpacing: '-0.1px' }}>{item.desc}</p>
                    </div>
                    {item.rightElement ? item.rightElement : isClickable && <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-text-muted)' }} />}
                  </div>);
            })}
            </div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent className="rounded-2xl mx-4 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Impor Data</AlertDialogTitle>
            <AlertDialogDescription>Data saat ini akan ditimpa dengan data dari file backup. Lanjutkan?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImportData(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Ya, Impor</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
};

export default SettingsPage;
