import React, { useMemo } from 'react';

interface CalendarGridProps {
    currentDate: Date;
    selectedDate: string | null;
    onDateSelect: (date: string | null) => void;
    getEventsForDate: (date: string) => any[];
}

/**
 * CalendarGrid (v2)
 * RÉPLICA EXACTA del diseño original con arquitectura modular.
 */
const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentDate,
    selectedDate,
    onDateSelect,
    getEventsForDate
}) => {
    // 1. Cálculos de fechas
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push(dateStr);
        }
        return days;
    }, [currentDate, daysInMonth, firstDayOfMonth]);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="px-4 py-6 animate-fade-in">
            {/* Weekdays - Estilo Original */}
            <div className="grid grid-cols-7 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid - Estilo Original */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dateStr, i) => {
                    if (!dateStr) return <div key={`empty-${i}`} className="aspect-square"></div>;

                    const dayNumber = parseInt(dateStr.split('-')[2]);
                    const eventsOnDay = getEventsForDate(dateStr);
                    const hasEvents = eventsOnDay.length > 0;
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === todayStr;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateSelect(dateStr)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all border
                                ${isSelected ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30' :
                                    hasEvents ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' :
                                        'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                                } cursor-pointer ${isToday ? 'ring-1 ring-emerald-500 text-emerald-400 font-bold' : ''}`}>

                            <span className="text-sm">{dayNumber}</span>

                            {/* Event Dots - Estilo Original */}
                            <div className="flex gap-0.5 mt-1">
                                {eventsOnDay.slice(0, 3).map((e, idx) => (
                                    <div key={idx} className={`size-1.5 rounded-full 
                                        ${e.type === 'discoteca' ? 'bg-purple-400' :
                                            e.type === 'privado' ? 'bg-blue-400' :
                                                e.type === 'viaje' ? 'bg-green-400' :
                                                    e.type === 'privado_3h' ? 'bg-indigo-400' :
                                                        e.type === 'viaje_3h' ? 'bg-teal-400' :
                                                            e.type === 'viaje_discoteca' ? 'bg-orange-400' : 'bg-gray-400'}`}
                                    />
                                ))}
                                {eventsOnDay.length > 3 && <div className="size-1.5 rounded-full bg-white/50" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;
