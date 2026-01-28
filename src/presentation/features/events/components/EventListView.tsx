import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '@/core/domain/entities/Event';
import { V2_ROUTES } from '@/constants/Routes';
import EventSearchBar from './EventSearchBar';
import EventFilters from './EventFilters';
import EventCard from './EventCard';

interface EventListViewProps {
    events: Event[];
    searchQuery: string;
    onSearchChange: (val: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

/**
 * EventListView (v2)
 * Contenedor modular para la lista de eventos con sus controles y tarjetas premium.
 */
const EventListView: React.FC<EventListViewProps> = ({
    events,
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange
}) => {
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in space-y-6">
            {/* 1. Controles de Filtrado */}
            <div className="space-y-4">
                <EventSearchBar value={searchQuery} onChange={onSearchChange} />
                <EventFilters activeFilter={activeFilter} onFilterChange={onFilterChange} />
            </div>

            {/* 2. Lista de Tarjetas */}
            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/30 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 mx-4">
                        <span className="material-symbols-outlined text-5xl mb-4 opacity-50">event_busy</span>
                        <p className="text-sm font-black uppercase tracking-widest">No hay eventos</p>
                        <p className="text-[10px] mt-1 italic opacity-60">Intenta con otros filtros o búsqueda.</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onClick={(id) => navigate(V2_ROUTES.EVENT_DETAIL(id))}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default EventListView;
