import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import CalendarView from '@/presentation/features/events/components/CalendarView';
import EventListView from '@/presentation/features/events/components/EventListView';
import EventDetailSheet from '@/presentation/features/events/components/detail/EventDetailSheet';
import CreateEventModal from '@/presentation/features/events/components/CreateEventModal';
import { useEvents } from '@/application/features/events/hooks/useEvents';

/**
 * Events Page (v2)
 * Punto de entrada para el calendario y la lista de eventos.
 * Diseñada para ser modular y ultrarrápida.
 */
const EventsV2: React.FC = () => {
    const location = useLocation();
    const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('calendar');

    const {
        currentMonth,
        nextMonth,
        prevMonth,
        selectedDate,
        setSelectedDate,
        monthEvents,
        filteredEvents,
        searchQuery,
        setSearchQuery,
        tabFilter,
        setTabFilter,
        isCreateModalOpen,
        setIsCreateModalOpen,
        handleCreateEvent,
        loading
    } = useEvents();

    // Detectar si se debe abrir el modal desde navegación (Dashboard)
    useEffect(() => {
        if (location.state?.openCreateModal) {
            setIsCreateModalOpen(true);
            // Limpiar el state para evitar que se abra de nuevo al volver
            window.history.replaceState({}, document.title);
        }
    }, [location, setIsCreateModalOpen]);

    const monthName = currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="size-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 py-6 px-4 animate-fade-in">
                {/* 1. Cabecera de Página (Título + Controles) */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Eventos</h1>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Gestión Sabor Real</p>
                    </div>

                    <div className="flex items-center">
                        <div className="flex bg-white/5 rounded-full p-1 border border-white/10 shadow-lg backdrop-blur-md">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`size-9 rounded-full flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                                <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`size-9 rounded-full flex items-center justify-center transition-all ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                                <span className="material-symbols-outlined text-xl">calendar_month</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Área de Contenido (Alternancia Modular) */}
                {viewMode === 'calendar' ? (
                    <CalendarView
                        currentDate={currentMonth}
                        monthName={monthName}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onPrev={prevMonth}
                        onNext={nextMonth}
                        getEventsForDate={(date) => monthEvents.filter((e: any) => e.date === date)}
                    />
                ) : (
                    <EventListView
                        events={filteredEvents}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        activeFilter={tabFilter}
                        onFilterChange={setTabFilter}
                    />
                )}
            </div>

            {/* 3. Detalle de Día (Bottom Sheet Modular) */}
            <EventDetailSheet
                selectedDate={selectedDate}
                onClose={() => setSelectedDate(null)}
                eventsOnDay={monthEvents.filter((e: any) => e.date === selectedDate)}
                onAddEvent={() => setIsCreateModalOpen(true)}
            />

            {/* 4. Modal de Creación Modular */}
            <CreateEventModal
                isOpen={isCreateModalOpen}
                initialDate={selectedDate}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateEvent}
            />
        </MainLayout>
    );
};

export default EventsV2;
