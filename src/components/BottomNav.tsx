import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Compass, LayoutGrid, Settings, Sun } from "lucide-react";

const tabs = [
  { path: "/today", label: "Hari Ini", icon: Sun },
  { path: "/tracker", label: "Tracker", icon: CalendarDays },
  { path: "/qibla", label: "Kiblat", icon: Compass },
  { path: "/tools", label: "Alat", icon: LayoutGrid },
  { path: "/settings", label: "Setelan", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
