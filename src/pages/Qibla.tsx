import { Compass } from "lucide-react";

const Qibla = () => (
  <div className="min-h-screen bg-background pb-24 pt-12 px-6 flex flex-col items-center justify-center">
    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-accent mb-6">
      <Compass className="h-20 w-20 text-accent-foreground" />
    </div>
    <h1 className="text-2xl font-bold text-foreground mb-2">Kompas Kiblat</h1>
    <p className="text-muted-foreground text-center">Arah kiblat berdasarkan lokasi akan segera tersedia.</p>
  </div>
);

export default Qibla;
