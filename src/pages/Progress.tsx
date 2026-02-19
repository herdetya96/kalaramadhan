import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MonthlyProgress from "@/components/tracker/MonthlyProgress";
import DayDetail from "@/components/tracker/DayDetail";

const Progress = () => {
  const navigate = useNavigate();
  const [monthViewDate, setMonthViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const handleMonthChange = (dir: number) => {
    const d = new Date(monthViewDate);
    d.setMonth(d.getMonth() + dir);
    setMonthViewDate(d);
    setSelectedDay(null);
  };

  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center pt-6 gap-6 px-4">
        {/* Header */}
        <div className="flex items-center w-full">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: '#62748E' }} strokeWidth={2} />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: '#1D293D', letterSpacing: '-0.44px' }}>
            Progress Bulanan
          </h1>
        </div>

        <MonthlyProgress selectedDate={monthViewDate} onMonthChange={handleMonthChange} onDayClick={setSelectedDay} />

        {selectedDay && <DayDetail date={selectedDay} onClose={() => setSelectedDay(null)} />}
      </div>
    </div>
  );
};

export default Progress;
