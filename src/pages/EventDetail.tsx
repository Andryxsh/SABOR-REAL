import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Event } from '../context/AppContext';

export default function EventDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { events, musicians, updateEvent, deleteEvent, payments } = useApp();

    const [event, setEvent] = useState<Event | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddMusicianModalOpen, setIsAddMusicianModalOpen] = useState(false);
    const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Replacement Logic State
    const [isReplacementMode, setIsReplacementMode] = useState(false);
    const [repName, setRepName] = useState('');
    const [repLastName, setRepLastName] = useState('');
    const [repRole, setRepRole] = useState('');
    const [repFee, setRepFee] = useState('');

    const [cobroAmount, setCobroAmount] = useState('');
    const [cobroMode, setCobroMode] = useState<'add' | 'fix'>('add'); // New state for correction mode

    // Edit Form States
    const [editTitle, setEditTitle] = useState('');
    const [editType, setEditType] = useState<Event['type']>('privado');
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editPrecio, setEditPrecio] = useState('');
    const [editStatus, setEditStatus] = useState<Event['status']>('Pendiente');
    const [editClienteNombre, setEditClienteNombre] = useState('');
    const [editClienteTelefono, setEditClienteTelefono] = useState('');
    const [editNotas, setEditNotas] = useState('');

    // Find the event
    useEffect(() => {
        const foundEvent = events.find(e => e.id === id);
        if (foundEvent) {
            setEvent(foundEvent);
            // Populate edit form when event loads
            setEditTitle(foundEvent.title);
            setEditType(foundEvent.type);
            setEditDate(foundEvent.date);
            setEditTime(foundEvent.time);
            setEditLocation(foundEvent.location);
            setEditPrecio(foundEvent.precio.toString());
            setEditStatus(foundEvent.status);
            setEditClienteNombre(foundEvent.cliente?.nombre || '');
            setEditClienteTelefono(foundEvent.cliente?.telefono || '');
            setEditNotas(foundEvent.notas || '');
        }
    }, [id, events]);

    if (!event) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-dark">
                <div className="text-center">
                    <div className="text-gray-400 mb-4">Evento no encontrado</div>
                    <button
                        onClick={() => navigate('/events')}
                        className="px-6 py-2 bg-primary text-white rounded-xl">
                        Volver a Eventos
                    </button>
                </div>
            </div>
        );
    }

    const toggleAttendance = async (musicianId: string) => {
        if (event.locked) return; // Protected
        const updated = event.musicosAsignados.map(m =>
            m.musicianId === musicianId ? { ...m, asistio: !m.asistio } : m
        );
        await updateEvent(event.id, { musicosAsignados: updated });
    };

    const addMusicianToEvent = async (musicianId: string, montoPagar: number) => {
        if (event.locked) return; // Protected
        const newMusician = {
            musicianId,
            asistio: false,
            montoPagar,
            pagado: false,
        };
        const updated = [...event.musicosAsignados, newMusician];
        await updateEvent(event.id, { musicosAsignados: updated });
        setIsAddMusicianModalOpen(false);
    };

    const removeMusicianFromEvent = async (musicianId: string) => {
        if (event.locked) return; // Protected
        const updated = event.musicosAsignados.filter(m => m.musicianId !== musicianId);
        await updateEvent(event.id, { musicosAsignados: updated });
    };

    const handleDeleteEvent = async () => {
        if (event.locked) return;
        await deleteEvent(event.id);
        navigate('/events');
    };

    const toggleLock = async () => {
        await updateEvent(event.id, { locked: !event.locked });
    };

    const handleRegistrarCobro = async () => {
        if (!cobroAmount) return;
        const amount = parseFloat(cobroAmount);

        // Validation based on mode
        if (isNaN(amount) || amount < 0) { // Allow 0 for corrections
            alert('Monto inválido');
            return;
        }

        let newAdelanto = 0;
        if (cobroMode === 'fix') {
            // FIX MODE: Overwrite the total
            newAdelanto = amount;
        } else {
            // ADD MODE: Sum to existing
            if (amount <= 0) { alert('Monto debe ser mayor a 0 para sumar'); return; }
            newAdelanto = (event.adelanto || 0) + amount;
        }

        const newSaldo = event.precio - newAdelanto;

        await updateEvent(event.id, {
            adelanto: newAdelanto,
            saldo: newSaldo
        });

        setIsCobroModalOpen(false);
        setCobroAmount('');
    };

    const handleEditEvent = async () => {
        if (!editTitle || !editDate || !editTime) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        try {
            const precio = parseFloat(editPrecio) || 0;
            const updatedData: Partial<Event> = {
                title: editTitle,
                type: editType,
                date: editDate,
                time: editTime,
                location: editLocation,
                precio,
                saldo: precio - (event?.adelanto || 0),
                status: editStatus,
            };

            // Only add notas if it has content
            if (editNotas.trim()) {
                updatedData.notas = editNotas;
            }

            // Update client info
            if (editClienteNombre || editClienteTelefono) {
                updatedData.cliente = {
                    nombre: editClienteNombre,
                    telefono: editClienteTelefono,
                };
            }

            await updateEvent(event!.id, updatedData);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Error al actualizar el evento: ' + (error as Error).message);
        }
    };

    const totalPorPagar = event.musicosAsignados.reduce((sum, m) => sum + (m.asistio ? m.montoPagar : 0), 0);

    // Calculate effective paid amount for THIS event based on Global Balance
    const totalPagado = event.musicosAsignados.reduce((sum, m) => {
        if (!m.asistio) return sum;
        const musician = musicians.find(mx => mx.id === m.musicianId);
        if (!musician) return sum;

        // Global Balance logic
        const totalEarned = events.reduce((s, ev) => {
            const a = ev.musicosAsignados.find(mx => mx.musicianId === musician.id && mx.asistio);
            return s + (a ? a.montoPagar : 0);
        }, 0);
        const totalPaidUser = payments
            .filter(p => p.musicianId === musician.id)
            .reduce((s, p) => s + p.monto, 0);

        const globalBalance = totalEarned - totalPaidUser; // Positive = You owe him

        // If Global Balance <= 0, this event is fully paid.
        // If Global Balance > 0, we deduct the debt from the fee to see how much is "covered".
        // Example: Fee 200, Owe 50 -> Paid 150. Fee 200, Owe 300 -> Paid 0.
        const effectivePaid = Math.max(0, m.montoPagar - Math.max(0, globalBalance));

        return sum + effectivePaid;
    }, 0);

    const totalPendiente = totalPorPagar - totalPagado;

    return (
        <>
            <header className="shrink-0 z-10 flex items-center justify-between px-4 pt-4 pb-3 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 sticky top-0">
                <button
                    onClick={() => navigate('/events')}
                    className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-primary">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight text-center text-slate-900 dark:text-white flex items-center gap-2">
                    Detalle del Evento
                    {event.locked && <span className="material-symbols-outlined text-red-500 text-lg">lock</span>}
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleLock}
                        className={`flex items-center justify-center size-10 rounded-full transition-colors ${event.locked
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}>
                        <span className="material-symbols-outlined text-xl">
                            {event.locked ? 'lock' : 'lock_open_right'}
                        </span>
                    </button>

                    {!event.locked && (
                        <>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center justify-center size-10 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center justify-center size-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                <span className="material-symbols-outlined text-2xl">delete</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-20 px-4 space-y-4 pt-4">
                {/* Event Info Card */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${event.type === 'discoteca' ? 'bg-purple-500/20 text-purple-400' :
                                    event.type === 'privado' ? 'bg-blue-500/20 text-blue-400' :
                                        event.type === 'viaje' ? 'bg-green-500/20 text-green-400' :
                                            'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {event.type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${event.status === 'Confirmado' ? 'bg-emerald-500/20 text-emerald-400' :
                                    event.status === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-400' :
                                        event.status === 'Finalizado' ? 'bg-gray-500/20 text-gray-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {event.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-primary">calendar_today</span>
                            <span>{event.date} a las {event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            <span>{event.location}</span>
                        </div>
                        {event.cliente?.nombre && (
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-primary">person</span>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{event.cliente.nombre}</div>
                                    {event.cliente.telefono && <div className="text-xs">{event.cliente.telefono}</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {event.notas && (
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notas:</div>
                            <div className="text-sm text-gray-900 dark:text-white">{event.notas}</div>
                        </div>
                    )}
                </div>

                {/* Financial Summary */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">payments</span>
                        Resumen Financiero
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Precio del Evento</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{event.precio} Bs</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Adelanto Total</span>
                                {!event.locked && (
                                    <button
                                        onClick={() => setIsCobroModalOpen(true)}
                                        className="size-6 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors">
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                )}
                            </div>
                            <span className="text-lg font-bold text-emerald-400">{event.adelanto} Bs</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
                            <span className="text-gray-600 dark:text-gray-400">Saldo Pendiente</span>
                            <span className="text-lg font-bold text-yellow-400">{event.saldo} Bs</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Pago a Músicos</span>
                                <span className="text-lg font-bold text-red-400">{totalPorPagar} Bs</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">Ya pagado</span>
                                <span className="text-sm text-emerald-400">{totalPagado} Bs</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Por pagar</span>
                                <span className="text-sm text-yellow-400">{totalPendiente} Bs</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900 dark:text-white">Ganancia Neta</span>
                                <span className={`text-xl font-bold ${event.precio - totalPorPagar > 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {event.precio - totalPorPagar} Bs
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Musicians List */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">group</span>
                            Músicos ({event.musicosAsignados.length})
                        </h3>
                        <button
                            onClick={() => setIsAddMusicianModalOpen(true)}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                            + Agregar
                        </button>
                    </div>

                    {event.musicosAsignados.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No hay músicos asignados aún
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {event.musicosAsignados.map((assigned) => {
                                const musician = musicians.find(m => m.id === assigned.musicianId);
                                if (!musician) return null;

                                // GLOBAL BALANCE CALCULATION (Source of Truth)
                                const totalEarned = events.reduce((sum, ev) => {
                                    const a = ev.musicosAsignados.find(mx => mx.musicianId === musician.id && mx.asistio);
                                    return sum + (a ? a.montoPagar : 0);
                                }, 0);
                                const totalPaidUser = payments
                                    .filter(p => p.musicianId === musician.id)
                                    .reduce((sum, p) => sum + p.monto, 0);

                                const globalBalance = totalEarned - totalPaidUser;

                                return (
                                    <div
                                        key={assigned.musicianId}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-3 flex-1">
                                            <button
                                                onClick={() => toggleAttendance(assigned.musicianId)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${assigned.asistio
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-gray-400 dark:border-gray-600'
                                                    }`}>
                                                {assigned.asistio && (
                                                    <span className="material-symbols-outlined text-white text-sm">check</span>
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <div className={`font-semibold ${assigned.asistio ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'
                                                    }`}>
                                                    {musician.nombre} {musician.apellido}
                                                </div>
                                                <div className="text-xs text-gray-500">{musician.role}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-primary mb-1">{assigned.montoPagar} Bs</div>

                                                {/* Global Status Badge */}
                                                {assigned.asistio && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shadow-sm ${globalBalance > 0
                                                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        }`}>
                                                        {globalBalance > 0
                                                            ? `Le debes: ${globalBalance} Bs`
                                                            : 'Saldado' // Hides 'Te debe' for this event context
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            {!event.locked && (
                                                <button
                                                    onClick={() => removeMusicianFromEvent(assigned.musicianId)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors">
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Musician Modal */}
            {isAddMusicianModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center">
                    <div className="w-full bg-[#1e1218] rounded-t-3xl shadow-2xl ring-1 ring-white/10 animate-slide-up pb-10 max-h-[70vh] overflow-y-auto">
                        <div className="sticky top-0 bg-[#1e1218] z-20 pb-4 pt-3">
                            <div className="w-full flex justify-center mb-4">
                                <div className="w-12 h-1.5 bg-gray-600/50 rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between px-6">
                                <h2 className="text-xl font-bold text-white tracking-tight">Agregar Músico</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsReplacementMode(!isReplacementMode)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${isReplacementMode
                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-1 ring-red-400'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">flash_on</span>
                                        {isReplacementMode ? 'Cancelar Remplazo' : 'Remplazo Express'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddMusicianModalOpen(false);
                                            setIsReplacementMode(false);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-xl font-bold">close</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 space-y-2">
                            {isReplacementMode ? (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 animate-fade-in relative overflow-hidden">
                                    {/* Background glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                    <h3 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">emergency</span>
                                        Remplazo de Emergencia
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Nombre"
                                                className="bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-white placeholder-red-500/30 focus:outline-none focus:border-red-500 transition-colors"
                                                value={repName}
                                                onChange={e => setRepName(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Apellido (Opcional)"
                                                className="bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-white placeholder-red-500/30 focus:outline-none focus:border-red-500 transition-colors"
                                                value={repLastName}
                                                onChange={e => setRepLastName(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                className="bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                                                value={repRole}
                                                onChange={e => setRepRole(e.target.value)}
                                            >
                                                <option value="" disabled>Rol / Función</option>
                                                <optgroup label="Músicos">
                                                    <option value="Trompeta">Trompeta</option>
                                                    <option value="Saxofon">Saxofón</option>
                                                    <option value="Trombon">Trombón</option>
                                                    <option value="Bateria">Batería</option>
                                                    <option value="Percusion">Percusión</option>
                                                    <option value="Teclado">Teclado</option>
                                                    <option value="Bajo">Bajo</option>
                                                    <option value="Cantante">Cantante</option>
                                                    <option value="Animador">Animador</option>
                                                </optgroup>
                                                <optgroup label="Staff y Técnica">
                                                    <option value="Staff">Staff / Ayudante</option>
                                                    <option value="Chofer">Chofer</option>
                                                    <option value="Camara">Camarógrafo</option>
                                                    <option value="Sonido">Sonidista</option>
                                                    <option value="Seguridad">Seguridad</option>
                                                    <option value="Otro">Otro</option>
                                                </optgroup>
                                            </select>

                                            <input
                                                type="number"
                                                placeholder="Pago (Bs)"
                                                className="bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-white placeholder-red-500/30 focus:outline-none focus:border-red-500 transition-colors font-bold"
                                                value={repFee}
                                                onChange={e => setRepFee(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            disabled={!repName || !repRole || !repFee}
                                            onClick={async () => {
                                                const { addDoc, collection } = await import('firebase/firestore');
                                                const { db } = await import('../lib/firebase');

                                                // 1. Create Musician
                                                const docRef = await addDoc(collection(db, 'musicians'), {
                                                    nombre: repName,
                                                    apellido: repLastName || '(Remplazo)',
                                                    role: repRole,
                                                    status: 'inactivo', // Created as inactive so they don't appear in future events
                                                    telefono: '',
                                                    email: '',
                                                    tarifas: { [event.type]: Number(repFee) }, // Set fee for this event type
                                                    createdAt: new Date().toISOString(),
                                                    updatedAt: new Date().toISOString(),
                                                    isReplacement: true // Flag to identify replacements later
                                                });

                                                // 2. Add to Event
                                                addMusicianToEvent(docRef.id, Number(repFee));

                                                // Reset
                                                setRepName('');
                                                setRepLastName('');
                                                setRepRole('');
                                                setRepFee('');
                                                setIsReplacementMode(false);
                                            }}
                                            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-bold shadow-lg shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">person_add</span>
                                            Crear y Asignar Remplazo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                musicians
                                    .filter(m => m.status === 'activo')
                                    .filter(m => !event.musicosAsignados.some(a => a.musicianId === m.id))
                                    .map(musician => (
                                        <div
                                            key={musician.id}
                                            onClick={() => {
                                                const tarifa = musician.tarifas[event.type] || 0;
                                                addMusicianToEvent(musician.id, tarifa);
                                            }}
                                            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl cursor-pointer transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-white font-semibold">
                                                        {musician.nombre} {musician.apellido}
                                                    </div>
                                                    <div className="text-sm text-gray-400">{musician.role}</div>
                                                </div>
                                                <div className="text-primary font-bold">
                                                    {musician.tarifas[event.type] || 0} Bs
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-surface-dark rounded-2xl shadow-2xl ring-1 ring-white/10 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-400 text-2xl">delete</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Eliminar Evento</h3>
                                <p className="text-sm text-gray-400">Esta acción no se puede deshacer</p>
                            </div>
                        </div>
                        <p className="text-gray-300">
                            ¿Estás seguro de eliminar <span className="font-bold text-white">{event.title}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteEvent}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Registrar Cobro Modal */}
            {isCobroModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-surface-dark rounded-2xl shadow-2xl ring-1 ring-white/10 p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-400 text-2xl">
                                    {cobroMode === 'add' ? 'payments' : 'edit_document'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {cobroMode === 'add' ? 'Registrar Cobro' : 'Corregir Monto Total'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {cobroMode === 'add' ? 'Suma un pago al adelantado actual' : 'Corrige el valor total del adelantado'}
                                </p>
                            </div>
                        </div>

                        {/* MODE TOGGLE */}
                        <div className="flex bg-black/40 p-1 rounded-xl mb-4 border border-white/5">
                            <button
                                onClick={() => { setCobroMode('add'); setCobroAmount(''); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${cobroMode === 'add' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                AGREGRAR PAGO
                            </button>
                            <button
                                onClick={() => { setCobroMode('fix'); setCobroAmount(event.adelanto?.toString() || ''); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${cobroMode === 'fix' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                CORREGIR ERROR
                            </button>
                        </div>

                        <div className="py-2">
                            <div className="flex justify-between items-end mb-1.5">
                                <label className="text-xs text-gray-500 font-bold">
                                    {cobroMode === 'add' ? 'MONTO A SUMAR (Bs)' : 'NUEVO TOTAL ADELANTADO (Bs)'}
                                </label>
                                {(event.precio - event.adelanto) > 0 && (
                                    <button
                                        onClick={() => setCobroAmount((event.precio - event.adelanto).toString())}
                                        className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                                    >
                                        Saldar Restante: {event.precio - event.adelanto} Bs
                                    </button>
                                )}
                            </div>
                            <input
                                type="number"
                                value={cobroAmount}
                                onChange={(e) => setCobroAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsCobroModalOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleRegistrarCobro}
                                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative w-full sm:max-w-2xl bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-scale-in will-change-transform">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">edit</span>
                                    Editar Evento
                                </h2>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Modifique la información del evento</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="size-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
                            {/* Información Básica */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-primary/50"></span>
                                    Información Básica
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400 ml-1">Título *</label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                        placeholder="Ej: Fiesta de Cumpleaños"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Tipo *</label>
                                        <select
                                            value={editType}
                                            onChange={(e) => setEditType(e.target.value as Event['type'])}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium">
                                            <option value="privado">Privado</option>
                                            <option value="discoteca">Discoteca</option>
                                            <option value="viaje">Viaje</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Estado</label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value as Event['status'])}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium">
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Confirmado">Confirmado</option>
                                            <option value="Finalizado">Finalizado</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Fecha *</label>
                                        <input
                                            type="date"
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Hora *</label>
                                        <input
                                            type="time"
                                            value={editTime}
                                            onChange={(e) => setEditTime(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400 ml-1">Ubicación</label>
                                    <input
                                        type="text"
                                        value={editLocation}
                                        onChange={(e) => setEditLocation(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                        placeholder="Ej: Salón Central"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400 ml-1">Precio (Bs) *</label>
                                    <input
                                        type="number"
                                        value={editPrecio}
                                        onChange={(e) => setEditPrecio(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Cliente */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-primary/50"></span>
                                    Información del Cliente
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={editClienteNombre}
                                            onChange={(e) => setEditClienteNombre(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                            placeholder="Nombre del cliente"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={editClienteTelefono}
                                            onChange={(e) => setEditClienteTelefono(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                            placeholder="+591..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notas */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-primary/50"></span>
                                    Notas Adicionales
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>

                                <div className="space-y-1.5">
                                    <textarea
                                        value={editNotas}
                                        onChange={(e) => setEditNotas(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none transition-all font-medium"
                                        placeholder="Detalles adicionales del evento..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-white/5 shrink-0 bg-black/20">
                            <button
                                onClick={handleEditEvent}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                <span className="material-symbols-outlined">save</span>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
