import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import ProfileModal from '../components/ProfileModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const { events, musicians, expenses, payments, loading } = useApp();
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // ... (rest of stats calculation)

    // Calcular estadísticas
    const stats = useMemo(() => {
        // Próximos eventos (ordenados por fecha)
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        const today = d.toISOString().split('T')[0];
        const upcomingEvents = events
            .filter(e => e.date >= today && e.status !== 'Cancelado' && !e.locked && e.status !== 'Finalizado')
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3);

        // Músicos activos
        const activeMusicians = musicians.filter(m => m.status === 'activo').length;

        // Ingresos totales (eventos confirmados + finalizados)
        const totalIngresos = events
            .filter(e => e.status === 'Confirmado' || e.status === 'Finalizado')
            .reduce((sum, e) => sum + e.precio, 0);

        // Gastos totales
        const totalGastos = expenses.reduce((sum, e) => sum + e.monto, 0);

        // Total Pagado a Músicos (Real)
        const totalPagos = payments.reduce((sum, p) => sum + p.monto, 0);

        // Balance general (Ingresos - Gastos - Pagos Reales)
        const balance = totalIngresos - totalGastos - totalPagos;

        // Total por pagar (Deuda Global Calculada) - OPTIMIZED O(N)
        // 1. Pre-calculate Earnings per Musician
        const earningsMap = new Map<string, number>();
        events.forEach(event => {
            if (event.status === 'Cancelado') return;
            event.musicosAsignados.forEach(m => {
                if (m.asistio) {
                    earningsMap.set(m.musicianId, (earningsMap.get(m.musicianId) || 0) + m.montoPagar);
                }
            });
        });

        // 2. Pre-calculate Payments per Musician
        const paymentsMap = new Map<string, number>();
        payments.forEach(payment => {
            paymentsMap.set(payment.musicianId, (paymentsMap.get(payment.musicianId) || 0) + payment.monto);
        });

        // 3. Calculate Debt efficiently
        const musiciansWithDebt = musicians
            .map(musician => {
                const totalEarned = earningsMap.get(musician.id) || 0;
                const totalPaid = paymentsMap.get(musician.id) || 0;
                const debt = totalEarned - totalPaid;
                return { ...musician, debt };
            })
            .filter(m => m.debt > 0)
            .sort((a, b) => b.debt - a.debt)
            .sort((a, b) => b.debt - a.debt);

        // Suma total de deudas pendientes
        const totalPorPagarMusicos = musiciansWithDebt.reduce((sum, m) => sum + m.debt, 0);

        return {
            upcomingEvents,
            activeMusicians,
            totalIngresos,
            totalPorPagarMusicos, // Ahora representa la deuda real pendiente
            totalGastos,
            balance,
            musiciansWithDebt,
        };
    }, [events, musicians, expenses, payments]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-dark">
                <div className="text-gray-400">Cargando...</div>
            </div>
        );
    }

    const eventImages: Record<string, string> = {
        discoteca: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', // Party/Club
        privado: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',   // Elegant/Wedding
        viaje: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',     // Travel
        ensayo: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=800',    // Studio
    };

    const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'; // Generic Crowd

    return (
        <>
            {/* Header Glass - Compacto y Pegajoso */}
            <div className="flex items-center px-4 h-20 justify-between sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 shrink-0 overflow-visible">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        {/* Contenedor del Logo - Transparente y Libre */}
                        <div className="size-24 flex items-center justify-center relative z-10 top-2">
                            <img
                                src="/assets/eca_logo.webp"
                                alt="ECA Eventos Logo"
                                className="w-full h-full object-contain scale-[1.6] drop-shadow-2xl filter brightness-110"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 text-[10px] font-bold uppercase tracking-widest leading-tight mb-0.5 animate-text-flow">Eventos con Altura</span>
                        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-white text-xl font-bold leading-none drop-shadow-md animate-text-flow">ECA</h2>
                    </div>
                </div>

                {/* User Profile & Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="relative z-50 flex items-center justify-center size-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 border border-white/20 shadow-lg hover:scale-105 active:scale-95 transition-all text-white font-bold text-lg"
                    >
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                        {/* Online Status Dot */}
                        <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-black rounded-full"></div>
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setShowProfileMenu(false)}
                            ></div>
                            <div className="absolute right-0 top-14 z-50 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 origin-top-right ring-1 ring-white/10">
                                {/* DEV TOOL: Reset Database Button */}
                                <button
                                    onClick={async () => {
                                        if (window.confirm('⚠️ ¿ESTÁS SEGURO? Esto borrará TODOS los eventos, pagos y gastos. Solo quedarán los músicos. No hay vuelta atrás.')) {
                                            const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
                                            const { db } = await import('../lib/firebase');

                                            // 1. Borrar Eventos
                                            const eventsRef = collection(db, 'events');
                                            const eventsSnap = await getDocs(eventsRef);
                                            eventsSnap.forEach(d => deleteDoc(doc(db, 'events', d.id)));

                                            // 2. Borrar Pagos
                                            const paymentsRef = collection(db, 'payments');
                                            const paymentsSnap = await getDocs(paymentsRef);
                                            paymentsSnap.forEach(d => deleteDoc(doc(db, 'payments', d.id)));

                                            // 3. Borrar Gastos
                                            const expensesRef = collection(db, 'expenses');
                                            const expensesSnap = await getDocs(expensesRef);
                                            expensesSnap.forEach(d => deleteDoc(doc(db, 'expenses', d.id)));

                                            alert('✅ Base de datos limpiada. Solo quedaron los músicos.');
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full mb-2 bg-red-900/30 text-red-500 text-xs py-1 rounded hover:bg-red-900/50"
                                >
                                    ⚠️ LIMPIAR BASE DE DATOS
                                </button>

                                <div className="flex flex-col items-center gap-3 pb-4 border-b border-white/10 relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>

                                    <div className="size-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-0.5 shadow-lg relative z-10">
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white">{user?.email?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="text-center relative z-10">
                                        <h3 className="text-white font-bold text-lg">{user?.email?.split('@')[0]}</h3>
                                        <p className="text-white/50 text-xs font-mono">{user?.email}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                                            ADMINISTRADOR
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            setShowProfileModal(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-sm font-medium group"
                                    >
                                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                                            <span className="material-symbols-outlined text-lg">settings_account_box</span>
                                        </div>
                                        <div>
                                            <span className="block text-left">Mi Cuenta</span>
                                            <span className="block text-left text-[10px] text-white/40">Editar perfil, seguridad</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-sm font-medium group"
                                    >
                                        <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 group-hover:bg-red-500/30 transition-colors">
                                            <span className="material-symbols-outlined text-lg">logout</span>
                                        </div>
                                        <span>Cerrar Sesión</span>
                                    </button>

                                    {/* DEV TOOL: Reset Database - Moved to bottom */}
                                    <div className="pt-4 border-t border-white/10 mt-2">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('⚠️ PELIGRO: ESTO BORRARÁ TODO (Eventos, Pagos, Gastos). \n\n¿Estás 100% seguro?')) {
                                                    try {
                                                        // Usamos importación dinámica para evitar conflictos
                                                        const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
                                                        const { db } = await import('../lib/firebase');

                                                        const clearColl = async (name: string) => {
                                                            const snap = await getDocs(collection(db, name));
                                                            const promises = snap.docs.map(d => deleteDoc(doc(db, name, d.id)));
                                                            await Promise.all(promises);
                                                        };

                                                        await clearColl('events');
                                                        await clearColl('payments');
                                                        await clearColl('expenses');

                                                        alert('✅ SE BORRÓ TODO. Reiniciando...');
                                                        window.location.reload();
                                                    } catch (e) {
                                                        alert('Error: ' + e);
                                                    }
                                                }
                                            }}
                                            className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 text-xs font-bold rounded border border-red-500/30 transition-all uppercase tracking-wider"
                                        >
                                            ⚠️ Limpiar BD (Reset)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Profile Modal */}
                    <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
                </div>

            </div>

            {/* BANNER PARALLAX - Sabor Real - Starts from top behind header */}
            <div className="relative h-[70vh] overflow-hidden shrink-0 -mt-20 rounded-b-3xl">
                {/* Parallax Background Image */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(/assets/SaborRealLargo.webp)',
                        backgroundAttachment: 'fixed',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center -90px',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    {/* Dark gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>

                    {/* Subtle neon glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5 mix-blend-overlay"></div>
                </div>

                {/* Content over banner */}
                <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 px-4">
                    <img
                        src="/assets/logo.webp"
                        alt="Sabor Real Logo"
                        loading="lazy"
                        className="w-64 md:w-80 h-auto drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24 px-4 space-y-8 mt-4">

                {/* 1. Quick Actions (Neon Grid) */}
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 px-1">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-yellow-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
                        Acciones Rápidas
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/events', { state: { openModal: true } })}
                            className="group flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:to-purple-600/20 transition-all duration-500"></div>

                            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 relative z-10">
                                <span className="material-symbols-outlined text-purple-400 text-2xl group-hover:text-white">add</span>
                            </div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white relative z-10">Nuevo Evento</span>
                        </button>

                        <button
                            onClick={() => navigate('/musicians')}
                            className="group flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:to-blue-600/20 transition-all duration-500"></div>

                            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-300 relative z-10">
                                <span className="material-symbols-outlined text-blue-400 text-2xl group-hover:text-white">group_add</span>
                            </div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white relative z-10">Integrantes</span>
                        </button>

                        <button
                            onClick={() => navigate('/finance', { state: { openPaymentModal: true } })}
                            className="group flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 to-yellow-600/0 group-hover:to-yellow-600/20 transition-all duration-500"></div>

                            <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all duration-300 relative z-10">
                                <span className="material-symbols-outlined text-yellow-400 text-2xl group-hover:text-white">payments</span>
                            </div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white relative z-10">Registrar Pago</span>
                        </button>

                        <button
                            onClick={() => navigate('/finance', { state: { openExpenseModal: true } })}
                            className="group flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/0 group-hover:to-red-600/20 transition-all duration-500"></div>

                            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300 relative z-10">
                                <span className="material-symbols-outlined text-red-500 text-2xl group-hover:text-white">receipt_long</span>
                            </div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white relative z-10">Registrar Gasto</span>
                        </button>
                    </div>
                </div>

                {/* 2. Próximos Eventos Section */}
                <div>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
                            Próximos Eventos
                        </h2>
                        <button
                            onClick={() => navigate('/events')}
                            className="text-purple-400 text-xs font-bold hover:text-purple-300 transition-colors uppercase tracking-wider border border-purple-500/30 px-3 py-1 rounded-full hover:bg-purple-500/10">
                            Ver todo
                        </button>
                    </div>

                    {stats.upcomingEvents.length === 0 ? (
                        <div className="text-center py-10 text-white/30 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                            <p>No hay eventos próximos hoy</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.upcomingEvents.map((event, index) => (
                                <div
                                    key={event.id}
                                    onClick={() => navigate(`/event/${event.id}`)}
                                    className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${index === 0
                                        ? 'shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-purple-500/30 hover:border-purple-500/60'
                                        : 'bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-white/5 hover:border-white/20'
                                        }`}>

                                    {/* Fondo de imagen dinámica */}
                                    <div className="absolute inset-0 z-0">
                                        <img
                                            src={eventImages[event.type] || defaultImage}
                                            alt="Event Background"
                                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                    </div>

                                    {index === 0 ? (
                                        // Featured Event Card (First one)
                                        <>
                                            <div className="relative z-10 p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-500/40 text-purple-200 text-[10px] font-bold tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-pulse">
                                                        PRÓXIMO
                                                    </div>
                                                    <span className="text-xl font-bold text-white drop-shadow-md">{event.precio} Bs</span>
                                                </div>

                                                <h4 className="text-white font-bold text-2xl leading-tight mb-1">{event.title}</h4>
                                                <div className="flex items-center gap-4 text-white/80 text-xs mt-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-base text-purple-400">calendar_today</span>
                                                        <span>{event.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-base text-purple-400">schedule</span>
                                                        <span>{event.time}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-white/70 text-xs">
                                                    <span className="material-symbols-outlined text-base">location_on</span>
                                                    {event.location}
                                                </div>
                                            </div>
                                            {/* Shine effect overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20"></div>
                                        </>
                                    ) : (
                                        // Standard List Item
                                        <div className="flex items-center gap-4 p-4 relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                                <span className="material-symbols-outlined text-white text-2xl drop-shadow-md">event</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-base text-white truncate group-hover:text-purple-200 transition-colors drop-shadow-sm">{event.title}</h4>
                                                <p className="text-xs text-gray-200 flex items-center gap-2 mt-1 font-medium">
                                                    <span>{event.date}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/50"></span>
                                                    <span>{event.time}</span>
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-bold text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 group-hover:border-purple-500/50 transition-colors shadow-lg">{event.precio} Bs</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Resumen Financiero */}
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 px-1">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
                        Resumen Financiero
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Balance */}
                        <div className="bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-emerald-400 text-2xl drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">account_balance_wallet</span>
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">{stats.balance.toFixed(0)} <span className="text-sm font-normal text-white/50">Bs</span></div>
                            <div className="text-xs text-emerald-400/80 font-medium tracking-wide mt-1 uppercase">Balance General</div>
                        </div>

                        {/* Músicos */}
                        <div className="bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-3xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-blue-400 text-2xl drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">group</span>
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">{stats.activeMusicians}</div>
                            <div className="text-xs text-blue-400/80 font-medium tracking-wide mt-1 uppercase">Músicos Activos</div>
                        </div>

                        {/* Próximos */}
                        <div className="bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-3xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-colors"></div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-purple-400 text-2xl drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">event</span>
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">{stats.upcomingEvents.length}</div>
                            <div className="text-xs text-purple-400/80 font-medium tracking-wide mt-1 uppercase">Próximos Eventos</div>
                        </div>

                        {/* Por Pagar */}
                        <div className="bg-black/40 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-yellow-500/20 transition-colors"></div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-yellow-400 text-2xl drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">payments</span>
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">{stats.totalPorPagarMusicos} <span className="text-sm font-normal text-white/50">Bs</span></div>
                            <div className="text-xs text-yellow-400/80 font-medium tracking-wide mt-1 uppercase">Por Pagar</div>
                        </div>
                    </div>
                </div>

                {/* 4. Pagos Pendientes (Musician Debts) */}
                {stats.musiciansWithDebt.length > 0 && (
                    <div>
                        <div className="flex justify-between items-end mb-4 px-1">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-yellow-500 rounded-full shadow-[0_0_10px_#eab308]"></span>
                                Pagos Pendientes
                            </h2>
                            <button
                                onClick={() => navigate('/musicians')}
                                className="text-yellow-400 text-xs font-bold hover:text-yellow-300 transition-colors uppercase tracking-wider border border-yellow-500/30 px-3 py-1 rounded-full hover:bg-yellow-500/10">
                                Gestionar
                            </button>
                        </div>

                        <div className="space-y-3">
                            {stats.musiciansWithDebt.slice(0, 5).map(musician => (
                                <div
                                    key={musician.id}
                                    className="flex items-center gap-3 p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all hover:bg-white/5 group">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-900/20">
                                        <span className="material-symbols-outlined text-yellow-200 text-xl group-hover:scale-110 transition-transform">person</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-white group-hover:text-yellow-100 transition-colors">
                                            {musician.nombre} {musician.apellido}
                                        </div>
                                        <div className="text-xs text-white/40">{musician.role}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-bold text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">{musician.debt} Bs</div>
                                        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Deuda</div>
                                    </div>
                                </div>
                            ))}

                            {stats.musiciansWithDebt.length > 5 && (
                                <button
                                    onClick={() => navigate('/musicians')}
                                    className="w-full py-3 text-center text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest border border-white/5 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    + {stats.musiciansWithDebt.length - 5} Músicos con Deuda
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
