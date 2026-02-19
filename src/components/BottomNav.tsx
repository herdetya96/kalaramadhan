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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F1F5F9] safe-bottom" style={{ boxShadow: '0px -4px 20px -4px rgba(0, 0, 0, 0.1)', borderRadius: '16px 16px 0 0' }}>
      <div className="mx-auto flex max-w-md items-center justify-around px-6 pt-2 pb-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`flex items-center justify-center w-[34px] h-[34px] rounded-[14px] ${isActive ? 'bg-[#EEF2FF]' : ''}`}>
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.3 : 1.8} style={{ color: isActive ? '#4F39F6' : '#90A1B9' }} />
              </div>
              <span className="text-[10px] font-medium tracking-wide" style={{ color: isActive ? '#4F39F6' : '#90A1B9' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
