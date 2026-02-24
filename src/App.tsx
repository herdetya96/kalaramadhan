import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Today from "./pages/Today";
import Tracker from "./pages/Tracker";
import Puasa from "./pages/Puasa";
import Quran from "./pages/Quran";
import DoaHarian from "./pages/DoaHarian";
import Qibla from "./pages/Qibla";
import Tools from "./pages/Tools";
import ZakatCalculator from "./pages/ZakatCalculator";
import HijriCalendar from "./pages/HijriCalendar";
import RamadanInfo from "./pages/RamadanInfo";
import SettingsPage from "./pages/SettingsPage";
import Progress from "./pages/Progress";
import Install from "./pages/Install";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Apply saved theme on app load (without useTheme hook, just read localStorage)
const initTheme = () => {
  const saved = localStorage.getItem("kala-theme");
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
initTheme();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-md min-h-screen relative">
    {children}
    <BottomNav />
  </div>
);

const App = () => {
  const isOnboarded = localStorage.getItem("kala_onboarded") === "true";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isOnboarded ? <Navigate to="/today" replace /> : <Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<div className="mx-auto max-w-md"><Welcome /></div>} />
            <Route path="/today" element={<AppLayout><Today /></AppLayout>} />
            <Route path="/tracker" element={<AppLayout><Tracker /></AppLayout>} />
            <Route path="/progress" element={<AppLayout><Progress /></AppLayout>} />
            <Route path="/puasa" element={<AppLayout><Puasa /></AppLayout>} />
            <Route path="/quran" element={<AppLayout><Quran /></AppLayout>} />
            <Route path="/doa" element={<AppLayout><DoaHarian /></AppLayout>} />
            <Route path="/qibla" element={<AppLayout><Qibla /></AppLayout>} />
            <Route path="/tools" element={<AppLayout><ZakatCalculator /></AppLayout>} />
            <Route path="/tools/zakat" element={<AppLayout><ZakatCalculator /></AppLayout>} />
            <Route path="/tools/ramadan" element={<AppLayout><RamadanInfo /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="/install" element={<div className="mx-auto max-w-md"><Install /></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
