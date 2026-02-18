

const SettingsPage = () => (
  <div className="min-h-screen bg-background pb-24 pt-12 px-6">
    <h1 className="text-2xl font-bold text-foreground mb-6">Setelan</h1>
    <div className="space-y-3">
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <p className="font-semibold text-foreground">Lokasi</p>
        <p className="text-sm text-muted-foreground mt-1">Atur lokasi untuk waktu sholat akurat</p>
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <p className="font-semibold text-foreground">Notifikasi Adzan</p>
        <p className="text-sm text-muted-foreground mt-1">Pengingat waktu sholat</p>
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <p className="font-semibold text-foreground">Tentang Kala</p>
        <p className="text-sm text-muted-foreground mt-1">Versi 1.0 — Pendamping ibadah harianmu</p>
      </div>
    </div>
  </div>
);

export default SettingsPage;
