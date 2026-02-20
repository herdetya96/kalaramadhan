import { useLocation, useNavigate } from "react-router-dom";
import { HandHelping, Calculator, Settings, Sun, BookOpen, Moon, HandHeart } from "lucide-react";

const tabs = [
  { path: "/today", label: "Hari Ini", icon: Sun },
  { path: "/tracker", label: "Sholat", icon: HandHelping },
  { path: "/puasa", label: "Puasa", icon: Moon },
  { path: "/quran", label: "Quran", icon: BookOpen },
  { path: "/doa", label: "Doa", icon: HandHeart },
  { path: "/tools", label: "Zakat", icon: Calculator },
  { path: "/settings", label: "Setelan", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 safe-bottom" style={{ width: 'calc(100% - 32px)', maxWidth: 'calc(448px - 32px)' }}>
      <div className="flex items-center justify-around rounded-2xl bg-white px-4 pt-2 pb-1" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`flex items-center justify-center w-[34px] h-[34px] rounded-[14px] ${isActive ? 'bg-[#E8FAED]' : ''}`}>
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.3 : 1.8} style={{ color: isActive ? '#38CA5E' : '#90A1B9' }} />
              </div>
              <span className="text-[10px] font-medium tracking-wide" style={{ color: isActive ? '#38CA5E' : '#90A1B9' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
