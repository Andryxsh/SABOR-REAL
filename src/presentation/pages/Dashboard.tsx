import { useNavigate } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import Card from '@/presentation/components/ui/Card';
import StatCard from '@/presentation/components/ui/StatCard';
import EventCard from '@/presentation/features/events/components/EventCard';
import MusicianDebtCard from '@/presentation/features/musicians/components/list/MusicianDebtCard';
import { V2_ROUTES } from '@/constants/Routes';
import { useDashboardStats } from '@/application/hooks/useDashboardStats';

/**
 * Dashboard (v2) - Versión Final Calibrada
 * Réplica exacta de los estilos originales usando componentes modulares.
 * Esta versión corrige errores de anidamiento previos.
 */
const DashboardV2: React.FC = () => {
    const navigate = useNavigate();
    const { stats, loading } = useDashboardStats();

    if (loading || !stats) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <div className="size-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-white/40 text-sm font-bold animate-pulse tracking-widest uppercase">
                        Sintonizando Sabor Real...
                    </p>
                </div>
            </MainLayout>
        );
    }

    const { upcomingEvents, totalUpcomingCount, activeMusiciansCount, balance, totalDeudaMusicos, musiciansWithDebt } = stats;

    return (
        <MainLayout>
            {/* 
                1. BANNER PARALLAX - Sabor Real 
                Banner llega hasta arriba (top 0), Header está encima con backdrop-blur
            */}
            <div className="relative h-[70vh] overflow-hidden shrink-0 rounded-b-3xl border-b border-white/5 shadow-2xl">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(/assets/SaborRealLargo.webp)',
                        backgroundAttachment: 'fixed',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 px-4">
                    <img
                        src="/assets/logo.webp"
                        alt="Sabor Real Logo"
                        loading="lazy"
                        className="w-64 md:w-80 h-auto drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] hover:scale-105 transition-transform duration-300 animate-float"
                    />
                </div>
            </div>

            {/* 2. CONTENIDO PRINCIPAL SCROLLABLE */}
            <div className="flex-1 pb-32 px-4 space-y-8 mt-6">

                {/* 2.1 Acciones Rápidas */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-yellow-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
                        Acciones Rápidas
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card
                            padding="none" hover
                            onClick={() => navigate(V2_ROUTES.EVENTS, { state: { openCreateModal: true } })}
                            className="flex flex-col items-center justify-center p-6 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 relative z-10">
                                <span className="material-symbols-outlined text-purple-400 text-2xl group-hover:text-white">add</span>
                            </div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white relative z-10 transition-colors">Nuevo Evento</span>
                        </Card>

                        <Card
                            padding="none" hover
                            onClick={() => navigate(V2_ROUTES.FINANCE, { state: { openPaymentModal: true } })}
                            className="flex flex-col items-center justify-center p-6 border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/10 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 to-yellow-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all duration-300 relative z-10">
                                <span className="material-symbols-outlined text-yellow-400 text-2xl group-hover:text-white">payments</span>
                            </div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white relative z-10 transition-colors">Registrar Pago</span>
                        </Card>
                    </div>
                </div>

                {/* 2.2 Resumen Financiero */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
                        Resumen Financiero (v2)
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            title="Balance General"
                            value={balance.toFixed(0)}
                            icon="account_balance_wallet"
                            color="emerald"
                            description="Saldo actual en caja"
                        />
                        <StatCard
                            title="Músicos Activos"
                            value={activeMusiciansCount}
                            icon="group"
                            color="blue"
                            unit=""
                            description="Integrantes en la banda"
                        />
                        <StatCard
                            title="Próximos Eventos"
                            value={totalUpcomingCount}
                            icon="event"
                            color="purple"
                            unit="Fechas"
                            description="Pendientes en calendario"
                        />
                        <StatCard
                            title="Deuda Pendiente"
                            value={totalDeudaMusicos.toFixed(0)}
                            icon="payments"
                            color="yellow"
                            description="Por pagar a músicos"
                        />
                    </div>
                </div>

                {/* 2.3 Próximos Eventos */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
                            Próximos Eventos
                        </h2>
                        <button
                            onClick={() => navigate(V2_ROUTES.EVENTS)}
                            className="text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/30 px-3 py-1.5 rounded-full hover:bg-purple-500/10 transition-colors"
                        >
                            Ver todo
                        </button>
                    </div>

                    <div className="space-y-4">
                        {upcomingEvents.length === 0 ? (
                            <Card variant="solid" className="p-10 text-center bg-white/5 border-dashed">
                                <span className="material-symbols-outlined text-4xl text-white/20 mb-2">event_busy</span>
                                <p className="text-white/40 text-xs italic">No hay eventos próximos hoy</p>
                            </Card>
                        ) : (
                            upcomingEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onClick={() => navigate(V2_ROUTES.EVENT_DETAIL(event.id || ''))}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* 2.4 Pagos Pendientes */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-yellow-500 rounded-full shadow-[0_0_10px_#eab308]"></span>
                            Pagos Pendientes
                        </h2>
                        <button
                            onClick={() => navigate(V2_ROUTES.FINANCE)}
                            className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/30 px-3 py-1.5 rounded-full hover:bg-yellow-500/10 transition-colors"
                        >
                            Gestionar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {musiciansWithDebt.length === 0 ? (
                            <p className="text-center text-white/20 text-xs py-4 font-medium italic">
                                No hay deudas pendientes 🎉
                            </p>
                        ) : (
                            musiciansWithDebt.map((musician) => (
                                <MusicianDebtCard
                                    key={musician.id}
                                    name={`${musician.nombre} ${musician.apellido}`}
                                    role={musician.role || 'Sin rol'}
                                    debt={musician.debt}
                                    onClick={() => navigate(V2_ROUTES.MUSICIANS)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="pt-10 pb-6 text-center">
                    <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
                        Sabor Real - Power System v2
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};

export default DashboardV2;
