import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDayKey } from "@/lib/kala-utils";

interface WeekSelectorProps {
  selectedDate: Date;
  realToday: Date;
  onSelectDate: (date: Date) => void;
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const WeekSelector = ({ selectedDate, realToday, onSelectDate }: WeekSelectorProps) => {
  const dayOfWeek = selectedDate.getDay();
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      day: d.getDate(),
      isSelected: getDayKey(d) === getDayKey(selectedDate),
      isRealToday: getDayKey(d) === getDayKey(realToday),
    };
  });

  const goWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    onSelectDate(d);
  };

  return (
    <div className="flex items-center gap-0 pt-2">
      <button onClick={() => goWeek(-1)} className="p-1 rounded-full bg-white/50 shadow-sm" style={{ color: '#62748E' }}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex flex-1 gap-0.5 px-1">
        {weekDays.map((d, i) => (
          <button
            key={i}
            onClick={() => onSelectDate(d.date)}
            className="flex flex-1 flex-col items-center rounded-[40px] py-2 transition-all"
            style={d.isSelected ? {
              background: 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)',
              border: '1px solid #FFFFFF',
              boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
            } : {}}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: d.isSelected ? '#314158' : '#5C5C5C' }}>
              {dayNames[i]}
            </span>
            <span className="mt-0.5 text-lg font-bold" style={{ color: '#314158', letterSpacing: '-0.44px' }}>
              {d.day}
            </span>
          </button>
        ))}
      </div>
      <button onClick={() => goWeek(1)} className="p-1 rounded-full bg-white/50 shadow-sm" style={{ color: '#62748E' }}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default WeekSelector;
