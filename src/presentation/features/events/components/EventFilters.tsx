import React from 'react';

interface EventFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

/**
 * EventFilters (v2)
 * Burbujas de filtrado modular para la lista de eventos.
 */
const EventFilters: React.FC<EventFiltersProps> = ({ activeFilter, onFilterChange }) => {
    const filters = ['Confirmados', 'Historial', 'Pendientes'];

    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filters.map(f => (
                <button
                    key={f}
                    onClick={() => onFilterChange(f)}
                    className={`px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-all border ${activeFilter === f
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20'
                        }`}>
                    {f}
                </button>
            ))}
        </div>
    );
};

export default EventFilters;
