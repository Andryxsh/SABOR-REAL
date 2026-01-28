import { useState, useMemo } from 'react';
// import { useApp } from '@/context/AppContext'; // REMOVED: Migrated to Zustand
import { useEventStore } from '@/application/store/useEventStore';
import { useMusicianStore } from '@/application/store/useMusicianStore';

/**
 * useEvents (v2 - Estado Nivel Máximo)
 * Hook de aplicación para gestionar la lógica del calendario y la lista de eventos.
 * Separa la matemática de fechas y filtros de la vista.
 * Powered by Zustand 🏎️
 */
export const useEvents = () => {
    // 1. ZUSTAND STORES
    const {
        events,
        loading: loadingEvents,
        addEvent
    } = useEventStore();

    // Necesitamos músicos para la asignación automática
    const { musicians } = useMusicianStore();

    // Suscripción manejada globalmente por useGlobalStoreInitializer

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [tabFilter, setTabFilter] = useState('Confirmados');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filtrar eventos por el mes actual (Optimizado)
    const monthEvents = useMemo(() => {
        const monthStr = currentMonth.toISOString().slice(0, 7); // "YYYY-MM"
        return events.filter(e => e.date.startsWith(monthStr));
    }, [events, currentMonth]);

    // Calcular eventos del día seleccionado
    const selectedDayEvents = useMemo(() => {
        return events.filter(e => e.date === selectedDate);
    }, [events, selectedDate]);

    // Filtrar lista de eventos (Modo Lista)
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            // 1. GLOBAL SEARCH (Overrides everything)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    e.title?.toLowerCase().includes(query) ||
                    e.date?.includes(query) ||
                    e.location?.toLowerCase().includes(query) ||
                    e.cliente?.nombre?.toLowerCase().includes(query)
                );
            }

            // 2. TAB FILTERS
            if (tabFilter === 'Historial') return e.locked === true;
            if (e.locked) return false;

            if (tabFilter === 'Confirmados') return e.status === 'Confirmado';
            if (tabFilter === 'Pendientes') return e.status === 'Pendiente';

            return true;
        });
    }, [events, searchQuery, tabFilter]);

    // Navegación de calendario
    const nextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        setCurrentMonth(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(prev.getMonth() - 1);
        setCurrentMonth(prev);
    };

    // Crear Evento (Lógica Profesional del original)
    const handleCreateEvent = async (formData: any) => {
        try {
            const precio = parseFloat(formData.precio) || 0;
            const adelanto = parseFloat(formData.adelanto) || 0;

            const newEvent: any = {
                ...formData,
                precio,
                adelanto,
                saldo: precio - adelanto,
                gastos: [],
            };

            // Asignación automática de músicos
            newEvent.musicosAsignados = musicians
                .filter(m => m.status === 'activo')
                .map(musician => {
                    let monto = (musician.tarifas as any)[formData.type] || 0;

                    if (musician.category === 'chofer') {
                        // Lógica de choferes (Viajes vs Ciudad)
                        if (['viaje', 'viaje_3h', 'viaje_discoteca'].includes(formData.type)) {
                            if (formData.driverTravelRate) monto = parseFloat(formData.driverTravelRate);
                        } else {
                            const existsToday = events.some(e =>
                                e.date === formData.date &&
                                e.status !== 'Cancelado' &&
                                e.musicosAsignados.some(ma => ma.musicianId === musician.id)
                            );
                            if (existsToday) monto = musician.tarifas.chofer_extra || 100;
                        }
                    }

                    return {
                        musicianId: musician.id,
                        asistio: false,
                        montoPagar: monto,
                        pagado: false
                    };
                });

            await addEvent(newEvent);
            setIsCreateModalOpen(false);
            return true;
        } catch (error) {
            console.error('Error creating event:', error);
            return false;
        }
    };

    return {
        selectedDate,
        setSelectedDate,
        currentMonth,
        nextMonth,
        prevMonth,
        monthEvents,
        selectedDayEvents,
        filteredEvents,
        searchQuery,
        setSearchQuery,
        tabFilter,
        setTabFilter,
        isCreateModalOpen,
        setIsCreateModalOpen,
        handleCreateEvent,
        loading: loadingEvents
    };
};
