import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Event } from '../context/AppContext';

export default function Events() {
    const navigate = useNavigate();
    const location = useLocation();
    const { events, musicians, addEvent, deleteEvent, loading } = useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('Confirmados');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteEvent_modal, setDeleteEvent_modal] = useState<Event | null>(null);

    // CALENDAR VIEW STATE
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [currentDate, setCurrentDate] = useState(new Date()); // For month navigation
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // 'YYYY-MM-DD' for bottom sheet

    // CALENDAR HELPERS
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

    // Generate Calendar Grid
    const calendarDays = useMemo(() => {
        const days = [];
        // Fill empty slots for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // Fill days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push(dateStr);
        }
        return days;
    }, [currentDate, daysInMonth, firstDayOfMonth]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    // Filter events for specific date (Calendar)
    const getEventsForDate = (dateStr: string) => {
        return events.filter(e => e.date === dateStr);
    };

    // Form states - TODOS LOS CAMPOS PROFESIONALES
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventType, setNewEventType] = useState<Event['type']>('privado');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [newEventLocation, setNewEventLocation] = useState('');
    const [newEventDireccionExacta, setNewEventDireccionExacta] = useState('');
    const [newEventGoogleMapsLink, setNewEventGoogleMapsLink] = useState('');
    const [newEventHoraInicio, setNewEventHoraInicio] = useState('');
    const [newEventHoraFin, setNewEventHoraFin] = useState('');

    // Cliente
    const [newEventClienteNombre, setNewEventClienteNombre] = useState('');
    const [newEventClienteTelefono, setNewEventClienteTelefono] = useState('');
    const [newEventClienteEmail, setNewEventClienteEmail] = useState('');
    const [newEventClienteEmpresa, setNewEventClienteEmpresa] = useState('');

    // Financiero
    const [newEventPrecio, setNewEventPrecio] = useState('');
    const [newEventAdelanto, setNewEventAdelanto] = useState('');

    // Estado
    const [newEventStatus, setNewEventStatus] = useState<Event['status']>('Pendiente');
    const [newEventNotas, setNewEventNotas] = useState('');
    const [driverTravelRate, setDriverTravelRate] = useState(''); // New state for manual driver rate (Travel)

    // Auto-open modal if navigated from Dashboard
    useEffect(() => {
        if (location.state?.openModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleAddEvent = async () => {
        if (!newEventTitle || !newEventDate || !newEventTime) {
            alert('Por favor completa al menos: Título, Fecha y Hora');
            return;
        }

        try {
            const precio = parseFloat(newEventPrecio) || 0;
            const adelanto = parseFloat(newEventAdelanto) || 0;

            const newEvent: any = {
                title: newEventTitle,
                type: newEventType,
                date: newEventDate,
                time: newEventTime,
                location: newEventLocation,
                precio,
                adelanto,
                saldo: precio - adelanto,
                gastos: [],
                status: newEventStatus,
            };

            // Solo agregar campos opcionales si tienen valor
            if (newEventDireccionExacta) newEvent.direccionExacta = newEventDireccionExacta;
            if (newEventGoogleMapsLink) newEvent.googleMapsLink = newEventGoogleMapsLink;
            if (newEventHoraInicio) newEvent.horaInicio = newEventHoraInicio;
            if (newEventHoraFin) newEvent.horaFin = newEventHoraFin;
            if (newEventNotas) newEvent.notas = newEventNotas;

            // Cliente: solo agregar si hay al menos un campo
            if (newEventClienteNombre || newEventClienteTelefono || newEventClienteEmail || newEventClienteEmpresa) {
                newEvent.cliente = {};
                if (newEventClienteNombre) newEvent.cliente.nombre = newEventClienteNombre;
                if (newEventClienteTelefono) newEvent.cliente.telefono = newEventClienteTelefono;
                if (newEventClienteEmail) newEvent.cliente.email = newEventClienteEmail;
                if (newEventClienteEmpresa) newEvent.cliente.empresa = newEventClienteEmpresa;
            }

            // AUTOMÁTICAMENTE agregar TODOS los músicos activos con sus tarifas
            newEvent.musicosAsignados = musicians
                .filter(m => m.status === 'activo')
                .map(musician => {
                    let monto = musician.tarifas[newEventType] || 0;

                    // LÓGICA ESPECIAL PARA CHOFERES
                    if (musician.category === 'chofer') {
                        // CASO 1: VIAJE (Prioridad Manual o Tarifa)
                        if (newEventType === 'viaje' || newEventType === 'viaje_3h' || newEventType === 'viaje_discoteca') {
                            if (driverTravelRate) {
                                monto = parseFloat(driverTravelRate); // Override manual
                            }
                        }
                        // CASO 2: CIUDAD (Tarifa Reducida si ya tiene evento hoy)
                        else {
                            // Buscar otros eventos ACTIVOS en la misma fecha donde este chofer ya esté asignado
                            const existingEventsToday = events.filter(e =>
                                e.date === newEventDate &&
                                e.status !== 'Cancelado' &&
                                e.musicosAsignados.some(ma => ma.musicianId === musician.id)
                            );

                            if (existingEventsToday.length > 0) {
                                // Ya tiene evento hoy -> Tarifa Reducida
                                monto = musician.tarifas.chofer_extra || 100;
                            }
                        }
                    }

                    return {
                        musicianId: musician.id,
                        asistio: false, // Por defecto NO marcado - se marca después del evento
                        montoPagar: monto,
                        pagado: false
                    };
                });

            await addEvent(newEvent);

            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            alert('Error al crear evento');
        }
    };

    const handleDeleteEvent = async () => {
        if (!deleteEvent_modal) return;
        try {
            await deleteEvent(deleteEvent_modal.id);
            setDeleteEvent_modal(null);
        } catch (error) {
            console.error(error);
            alert('Error al eliminar evento');
        }
    };

    const resetForm = () => {
        setNewEventTitle('');
        setNewEventType('privado');
        setNewEventDate('');
        setNewEventTime('');
        setNewEventLocation('');
        setNewEventDireccionExacta('');
        setNewEventGoogleMapsLink('');
        setNewEventHoraInicio('');
        setNewEventHoraFin('');
        setNewEventClienteNombre('');
        setNewEventClienteTelefono('');
        setNewEventClienteEmail('');
        setNewEventClienteEmpresa('');
        setNewEventPrecio('');
        setNewEventAdelanto('');
        setNewEventStatus('Pendiente');
        setNewEventNotas('');
        setDriverTravelRate('');
    };

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            // 1. GLOBAL SEARCH (Overrides everything - shows matches from ALL lists)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchDate = searchQuery; // Allow direct date search

                const matchesTitle = e.title?.toLowerCase().includes(query);
                const matchesDate = e.date?.includes(searchDate);
                const matchesTime = e.time?.includes(query);
                const matchesLocation = e.location?.toLowerCase().includes(query);
                const matchesClient = e.cliente?.nombre?.toLowerCase().includes(query);

                return matchesTitle || matchesDate || matchesTime || matchesLocation || matchesClient;
            }

            // 2. TAB FILTERS (Only active if NOT searching)

            // 'Historial' shows ONLY locked events (Past/Finalized/Cancelled)
            if (filter === 'Historial') {
                return e.locked === true;
            }

            // All other tabs show ONLY UNLOCKED events (Active)
            if (e.locked) return false;

            if (filter === 'Confirmados') return e.status === 'Confirmado';
            if (filter === 'Pendientes') return e.status === 'Pendiente';

            // 'Todos' shows all unlocked
            return true;
        });
    }, [events, searchQuery, filter]);

    const eventImages: Record<string, string> = {
        discoteca: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', // Party/Club
        privado: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',   // Elegant/Wedding
        viaje: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',     // Travel
        ensayo: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=800',    // Studio
        privado_3h: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800', // Reusing Privado
        viaje_3h: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',   // Reusing Viaje
        viaje_discoteca: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', // Reusing Discoteca
    };

    const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'; // Generic Crowd

    return (
        <div className="relative z-10 min-h-screen pb-20">
            {/* Header Glass - Compacto */}
            <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between shrink-0">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 group">
                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back_ios_new</span>
                </button>

                {/* View Toggle */}
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                        Calendario
                    </button>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center size-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:scale-110 transition-all border border-white/20">
                    <span className="material-symbols-outlined text-2xl">add</span>
                </button>
            </header>

            {viewMode === 'list' ? (
                <>
                    {/* Smart Search Bar */}
                    <div className="px-4 mt-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500 group-focus-within:text-purple-400 transition-colors">search</span>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar evento, cliente o fecha..."
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-purple-500/30 transition-all shadow-lg"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                        {['Confirmados', 'Historial', 'Pendientes'].map(f => (
                            <button
                                key={f}
                                onClick={() => {
                                    setFilter(f);
                                    setSearchQuery(''); // Clear search when switching tabs
                                }}
                                className={`px-5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-all border ${filter === f
                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                    : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20'
                                    }`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Events List */}
                    <div className="px-4 space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-white/30 animate-pulse">
                                <span className="material-symbols-outlined text-5xl mb-4">hourglass_top</span>
                                <p className="text-sm font-medium">Cargando eventos...</p>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-white/30 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 mx-4">
                                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">event_busy</span>
                                <p className="text-sm font-medium">No se encontraron eventos</p>
                            </div>
                        ) : (
                            filteredEvents.map((event: Event) => (
                                <div
                                    key={event.id}
                                    onClick={() => navigate(`/event/${event.id}`)}
                                    className={`group relative bg-black/40 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden ${event.locked ? 'grayscale opacity-60' : ''}`}>

                                    {/* Background Image with Gradient Overlay */}
                                    <div className="absolute inset-0 z-0">
                                        <img
                                            src={eventImages[event.type] || defaultImage}
                                            alt="Event Background"
                                            loading="lazy"
                                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                    </div>


                                    {/* Hover Glow Effect */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors pointer-events-none"></div>

                                    <div className="flex items-start justify-between gap-4 relative z-10">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${event.type === 'discoteca' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
                                                    event.type === 'privado' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                                                        event.type === 'viaje' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                                                            event.type === 'privado_3h' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' :
                                                                event.type === 'viaje_3h' ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' :
                                                                    event.type === 'viaje_discoteca' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' :
                                                                        'bg-gray-500/10 border-gray-500/30 text-gray-300'
                                                    }`}>
                                                    {event.type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${event.status === 'Confirmado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                                                    event.status === 'Pendiente' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                                                        event.status === 'Finalizado' ? 'bg-gray-500/10 border-gray-500/30 text-gray-400' :
                                                            'bg-red-500/10 border-red-500/30 text-red-300'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors truncate mb-3">
                                                {event.title}
                                            </h3>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="size-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                    </div>
                                                    <span className="text-gray-300">{event.date} • {event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="size-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                                    </div>
                                                    <span className="truncate text-gray-300">{event.location}</span>
                                                </div>
                                                {event.cliente?.nombre && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <div className="size-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                        </div>
                                                        <span className="truncate text-gray-300">{event.cliente.nombre}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{event.precio} <span className="text-xs text-white/50 font-normal">Bs</span></div>
                                            {event.adelanto > 0 && (
                                                <div className="text-[10px] text-emerald-400 font-medium mt-1 inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                                    Adelanto: {event.adelanto}
                                                </div>
                                            )}
                                            {event.musicosAsignados.length > 0 && (
                                                <div className="text-[10px] text-gray-500 mt-2 flex items-center justify-end gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">groups</span>
                                                    {event.musicosAsignados.length} músicos
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                // CALENDAR GRID
                <div className="px-4 py-6 animate-fade-in">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6 bg-white/5 p-4 rounded-3xl border border-white/10">
                        <button onClick={() => changeMonth(-1)} className="size-10 flex items-center justify-center rounded-xl bg-black/40 text-white hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <h2 className="text-xl font-bold capitalize text-white">
                            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)} className="size-10 flex items-center justify-center rounded-xl bg-black/40 text-white hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-4">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((dateStr, i) => {
                            if (!dateStr) return <div key={`empty-${i}`} className="aspect-square"></div>;

                            const dayNumber = parseInt(dateStr.split('-')[2]);
                            const eventsOnDay = getEventsForDate(dateStr);
                            const hasEvents = eventsOnDay.length > 0;
                            const isSelected = selectedDate === dateStr;
                            // Fix: Use local time instead of UTC to avoid timezone issues
                            const today = new Date();
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            const isToday = dateStr === todayStr;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border
                                        ${isSelected ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30' :
                                            hasEvents ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' :
                                                'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                                        } cursor-pointer ${isToday ? 'ring-1 ring-emerald-500 text-emerald-400 font-bold' : ''}`}>

                                    <span className="text-sm">{dayNumber}</span>

                                    {/* Event Dots */}
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
            )}

            {/* Add Event Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
                    <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up will-change-transform">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400">add_circle</span>
                                Nuevo Evento
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Información Principal</h3>

                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">TÍTULO DEL EVENTO *</label>
                                    <input
                                        type="text"
                                        value={newEventTitle}
                                        onChange={(e) => setNewEventTitle(e.target.value)}
                                        placeholder="Ej: Boda Familia Pérez"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">TIPO</label>
                                        <select
                                            value={newEventType}
                                            onChange={(e) => setNewEventType(e.target.value as Event['type'])}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 appearance-none">
                                            <option value="discoteca" className="bg-gray-900 text-white">Discoteca/Bar</option>
                                            <option value="privado" className="bg-gray-900 text-white">Evento Privado</option>
                                            <option value="privado_3h" className="bg-gray-900 text-white">Privado (3 Horas)</option>
                                            <option value="viaje" className="bg-gray-900 text-white">Viaje</option>
                                            <option value="viaje_3h" className="bg-gray-900 text-white">Viaje (3 Horas)</option>
                                            <option value="viaje_discoteca" className="bg-gray-900 text-white">Viaje (Discoteca)</option>
                                            <option value="ensayo" className="bg-gray-900 text-white">Ensayo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">ESTADO</label>
                                        <select
                                            value={newEventStatus}
                                            onChange={(e) => setNewEventStatus(e.target.value as Event['status'])}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 appearance-none">
                                            <option value="Pendiente" className="bg-gray-900 text-yellow-400">Pendiente</option>
                                            <option value="Confirmado" className="bg-gray-900 text-emerald-400">Confirmado</option>
                                            <option value="Finalizado" className="bg-gray-900 text-gray-400">Finalizado</option>
                                            <option value="Cancelado" className="bg-gray-900 text-red-400">Cancelado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">FECHA *</label>
                                        <input
                                            type="date"
                                            value={newEventDate}
                                            onChange={(e) => setNewEventDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 [&::-webkit-calendar-picker-indicator]:invert"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">HORA *</label>
                                        <input
                                            type="time"
                                            value={newEventTime}
                                            onChange={(e) => setNewEventTime(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 [&::-webkit-calendar-picker-indicator]:invert"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">UBICACIÓN</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newEventLocation}
                                            onChange={(e) => setNewEventLocation(e.target.value)}
                                            placeholder="Salón de Eventos..."
                                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-medium"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500">location_on</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-white/10 my-2"></div>

                            {/* SECCIÓN 2: CLIENTE */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Datos del Cliente</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={newEventClienteNombre}
                                        onChange={(e) => setNewEventClienteNombre(e.target.value)}
                                        placeholder="Nombre"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
                                    />
                                    <input
                                        type="tel"
                                        value={newEventClienteTelefono}
                                        onChange={(e) => setNewEventClienteTelefono(e.target.value)}
                                        placeholder="Teléfono"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-white/10 my-2"></div>

                            {/* SECCIÓN 3: FINANCIERO */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Finanzas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">PRECIO TOTAL (Bs)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={newEventPrecio}
                                                onChange={(e) => setNewEventPrecio(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-emerald-400 font-bold placeholder-white/10 focus:outline-none focus:border-emerald-500/50"
                                            />
                                            <span className="absolute left-3 top-3 text-emerald-500/50 font-bold">Bs</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">ADELANTO (Bs)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={newEventAdelanto}
                                                onChange={(e) => setNewEventAdelanto(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-emerald-400 font-bold placeholder-white/10 focus:outline-none focus:border-emerald-500/50"
                                            />
                                            <span className="absolute left-3 top-3 text-emerald-500/50 font-bold">Bs</span>
                                        </div>
                                    </div>

                                    {/* Input especial para Choferes en Viajes */}
                                    {(newEventType === 'viaje' || newEventType === 'viaje_3h' || newEventType === 'viaje_discoteca') && (
                                        <div className="mt-4 animate-fade-in">
                                            <label className="block text-blue-400 text-xs font-bold mb-1.5 ml-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                                TARIFA CHOFERES (Manual)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={driverTravelRate}
                                                    onChange={(e) => setDriverTravelRate(e.target.value)}
                                                    placeholder="Monto acordado..."
                                                    className="w-full pl-8 pr-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 font-bold placeholder-blue-300/30 focus:outline-none focus:border-blue-500/50"
                                                />
                                                <span className="absolute left-3 top-3 text-blue-500/50 font-bold">Bs</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1 ml-1">
                                                * Si se deja vacío, usa la tarifa de perfil.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                            <button
                                onClick={handleAddEvent}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                <span className="material-symbols-outlined">save</span>
                                Guardar Evento
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )
            }

            {/* Delete Confirmation */}
            {
                deleteEvent_modal && createPortal(
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
                        <div className="w-full max-w-sm bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-scale-in will-change-transform">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
                                    <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Evento?</h3>
                                    <p className="text-gray-400 text-sm">
                                        Estás a punto de eliminar <br /><span className="text-white font-bold">"{deleteEvent_modal.title}"</span>.
                                        <br />Esta acción es irreversible.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setDeleteEvent_modal(null)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors">
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteEvent}
                                        className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 transition-colors">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
            {/* Day Detail Bottom Sheet */}
            {
                selectedDate && createPortal(
                    <div
                        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
                        onClick={() => setSelectedDate(null)}
                    >
                        <div
                            className="w-full max-w-md bg-[#0a0a0a] rounded-t-3xl border-t border-white/10 p-6 animate-slide-up shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Handle */}
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white capitalize">
                                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4 pb-10">
                                {getEventsForDate(selectedDate).length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-2">Sin eventos programados</p>
                                        <p className="text-xs text-gray-600">Toca el botón de abajo para agregar uno.</p>
                                    </div>
                                ) : (
                                    getEventsForDate(selectedDate).map((event: Event) => (
                                        <div
                                            key={event.id}
                                            onClick={() => {
                                                setSelectedDate(null);
                                                navigate(`/event/${event.id}`);
                                            }}
                                            className={`group relative bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/5 transition-all cursor-pointer overflow-hidden active:scale-95 ${event.locked ? 'grayscale opacity-60' : ''}`}
                                        >
                                            {/* Simplificado para Bottom Sheet */}
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="text-white font-bold text-lg leading-tight mb-1 truncate">{event.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${event.type === 'discoteca' ? 'text-purple-300 bg-purple-500/10' :
                                                            event.type === 'privado' ? 'text-blue-300 bg-blue-500/10' : 'text-gray-300 bg-gray-500/10'
                                                            }`}>{event.type}</span>
                                                        <span>• {event.time}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="block text-emerald-400 font-bold text-lg">{event.precio} <span className="text-xs font-normal text-white/50">Bs</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <button
                                    onClick={() => {
                                        // Pre-fill date for new event
                                        setNewEventDate(selectedDate);
                                        setSelectedDate(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="w-full py-4 mt-2 rounded-xl bg-white/5 border border-white/10 text-purple-400 font-bold hover:bg-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Agregar Evento este Día
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
}
