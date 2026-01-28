import React from 'react';

interface CalendarHeaderProps {
    monthName: string;
    onPrev: () => void;
    onNext: () => void;
}

/**
 * CalendarHeader (v2)
 * Parte superior del calendario para navegación de meses.
 */
const CalendarHeader: React.FC<CalendarHeaderProps> = ({ monthName, onPrev, onNext }) => {
    return (
        <div className="flex items-center justify-between mb-6 bg-white/5 p-4 rounded-3xl border border-white/10">
            <button
                onClick={onPrev}
                className="size-10 flex items-center justify-center rounded-xl bg-black/40 text-white hover:bg-white/10 transition-colors border border-white/5"
            >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <h2 className="text-xl font-bold capitalize text-white">
                {monthName}
            </h2>
            <button
                onClick={onNext}
                className="size-10 flex items-center justify-center rounded-xl bg-black/40 text-white hover:bg-white/10 transition-colors border border-white/5"
            >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
        </div>
    );
};

export default CalendarHeader;
