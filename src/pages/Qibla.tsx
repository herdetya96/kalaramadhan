import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass as CompassIcon, Navigation, MapPin } from "lucide-react";

function calculateQibla(lat: number, lng: number): number {
  const kaabaLat = 21.4225 * (Math.PI / 180);
  const kaabaLng = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLng = lng * (Math.PI / 180);
  const dLng = kaabaLng - userLng;
  const x = Math.sin(dLng);
  const y = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(dLng);
  let qibla = Math.atan2(x, y) * (180 / Math.PI);
  return (qibla + 360) % 360;
}

const Qibla = () => {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [locationName, setLocationName] = useState("Mencari lokasi...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung browser ini");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const angle = calculateQibla(pos.coords.latitude, pos.coords.longitude);
        setQiblaAngle(angle);
        setLocationName(`${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`);
      },
      () => {
        setError("Izinkan akses lokasi untuk menentukan arah kiblat");
        // Default to Jakarta
        setQiblaAngle(calculateQibla(-6.2, 106.8));
        setLocationName("Jakarta (default)");
      }
    );
  }, []);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) setHeading(e.alpha);
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const rotation = qiblaAngle !== null ? qiblaAngle - heading : 0;

  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">Kompas Kiblat</h1>
      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-8">
        <MapPin className="h-3.5 w-3.5" />
        <span>{locationName}</span>
      </div>

      {/* Compass */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex items-center justify-center"
      >
        {/* Outer ring */}
        <div className="relative h-64 w-64 rounded-full border-4 border-accent flex items-center justify-center">
          {/* Cardinal directions */}
          {["U", "T", "S", "B"].map((dir, i) => (
            <span
              key={dir}
              className="absolute text-xs font-bold text-muted-foreground"
              style={{
                top: i === 0 ? "8px" : i === 2 ? "auto" : "50%",
                bottom: i === 2 ? "8px" : "auto",
                left: i === 3 ? "8px" : i === 1 ? "auto" : "50%",
                right: i === 1 ? "8px" : "auto",
                transform: i === 0 || i === 2 ? "translateX(-50%)" : "translateY(-50%)",
              }}
            >
              {dir}
            </span>
          ))}

          {/* Qibla needle */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <Navigation className="h-8 w-8 text-primary -rotate-0 fill-primary" />
              <span className="text-[10px] font-bold text-primary mt-1">KIBLAT</span>
            </div>
            <div className="absolute top-6 w-0.5 h-20 gradient-primary rounded-full" />
          </motion.div>

          {/* Center dot */}
          <div className="h-4 w-4 rounded-full bg-primary shadow-lg z-10" />
        </div>
      </motion.div>

      {qiblaAngle !== null && (
        <p className="mt-6 text-sm text-muted-foreground text-center">
          Arah kiblat: <span className="font-semibold text-foreground">{qiblaAngle.toFixed(1)}°</span> dari Utara
        </p>
      )}

      {error && (
        <p className="mt-4 text-xs text-destructive text-center px-8">{error}</p>
      )}

      <p className="mt-4 text-xs text-muted-foreground text-center px-8">
        Arahkan bagian atas ponsel ke Utara untuk hasil akurat. Pada desktop, arah ditunjukkan berdasarkan derajat.
      </p>
    </div>
  );
};

export default Qibla;
