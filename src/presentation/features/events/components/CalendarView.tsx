import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';

interface CalendarViewProps {
    currentDate: Date;
    monthName: string;
    selectedDate: string | null;
    onDateSelect: (date: string | null) => void;
    onPrev: () => void;
    onNext: () => void;
    getEventsForDate: (date: string) => any[];
}

/**
 * CalendarView (v2)
 * Ahora es un contenedor transparente que deja que el Grid y el Header usen sus propios contenedores,
 * imitando perfectamente la estructura original de px-4 py-6.
 */
const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    monthName,
    selectedDate,
    onDateSelect,
    onPrev,
    onNext,
    getEventsForDate
}) => {
    return (
        <div className="flex flex-col animate-fade-in">
            {/* 1. Cabecera de Navegación */}
            <CalendarHeader
                monthName={monthName}
                onPrev={onPrev}
                onNext={onNext}
            />

            {/* 2. Cuadrícula de Días */}
            <CalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
                getEventsForDate={getEventsForDate}
            />
        </div>
    );
};

export default CalendarView;
