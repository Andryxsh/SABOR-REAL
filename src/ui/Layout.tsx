import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const getIconClass = (path: string) => {
        return location.pathname === path ? 'text-primary' : 'text-text-secondary group-hover:text-white';
    }

    const getTextClass = (path: string) => {
        return location.pathname === path ? 'text-primary' : 'text-text-secondary group-hover:text-white';
    }

    // Lógica del Botón Contextual (Camaleón)
    const getAction = () => {
        switch (location.pathname) {
            case '/finance':
                return {
                    icon: 'payments',
                    label: 'Pago',
                    // Redirige a la misma ruta pero con estado para abrir modal
                    onClick: () => navigate('/finance', { state: { openPaymentModal: true } }),
                    colorFrom: 'from-emerald-600',
                    colorTo: 'to-teal-600',
                    shadow: 'shadow-emerald-500/30'
                };
            case '/musicians':
                return {
                    icon: 'person_add',
                    label: 'Músico',
                    onClick: () => navigate('/musicians', { state: { openModal: true } }),
                    colorFrom: 'from-pink-600',
                    colorTo: 'to-rose-600',
                    shadow: 'shadow-pink-500/30'
                };
            case '/events':
            case '/dashboard':
            default:
                return {
                    icon: 'add_circle',
                    label: 'Evento',
                    // Si estoy en dashboard, voy a events con modal. Si estoy en events, recargo con modal.
                    onClick: () => navigate('/events', { state: { openModal: true } }),
                    colorFrom: 'from-purple-600',
                    colorTo: 'to-blue-600',
                    shadow: 'shadow-purple-500/30'
                };
        }
    };

    const action = getAction();

    return (
        <div className="bg-black font-display antialiased min-h-screen text-white overflow-hidden relative selection:bg-purple-500 selection:text-white">

            {/* Global Aurora Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 animate-aurora"></div>
                {/* Luces decorativas flotantes globales */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse duration-[10s]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse duration-[12s]"></div>
            </div>

            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-transparent z-10">

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                    <Outlet />
                </div>

                {/* Bottom Navigation Glass */}
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
                    {/* Gradiente de desvanecimiento para el contenido */}
                    <div className="h-12 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

                    <div className="bg-black/40 backdrop-blur-xl border-t border-white/10 pb-6 pt-3 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center relative">
                            {/* Glow decorativo en el navbar */}
                            <div className="absolute inset-x-0 -top-[1px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

                            <Link to="/dashboard" className="flex flex-col items-center gap-1 w-12 group relative">
                                <div className={`absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${location.pathname === '/dashboard' ? 'opacity-50' : ''}`}></div>
                                <span className={`material-symbols-outlined text-2xl transition-all duration-300 relative z-10 ${getIconClass('/dashboard')}`}>dashboard</span>
                                <span className={`text-[10px] font-medium transition-colors relative z-10 ${getTextClass('/dashboard')}`}>Inicio</span>
                            </Link>

                            <Link to="/events" className="flex flex-col items-center gap-1 w-12 group relative">
                                <div className={`absolute -inset-2 bg-blue-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${location.pathname === '/events' ? 'opacity-50' : ''}`}></div>
                                <span className={`material-symbols-outlined text-2xl transition-all duration-300 relative z-10 ${getIconClass('/events')}`}>calendar_month</span>
                                <span className={`text-[10px] font-medium transition-colors relative z-10 ${getTextClass('/events')}`}>Eventos</span>
                            </Link>

                            <div className="-mt-10 relative group z-50">
                                <div className={`absolute inset-0 bg-gradient-to-r ${action.colorFrom} ${action.colorTo} rounded-full blur-md opacity-50 group-hover:opacity-100 animate-pulse transition-opacity`}></div>
                                <button
                                    onClick={action.onClick}
                                    className={`relative flex items-center justify-center size-16 rounded-full bg-gradient-to-r ${action.colorFrom} ${action.colorTo} text-white shadow-xl ${action.shadow} hover:scale-110 active:scale-95 transition-all outline-4 outline-black`}>
                                    <span key={action.icon} className="material-symbols-outlined text-3xl animate-spin-slow-once">{action.icon}</span>
                                </button>
                            </div>

                            <Link to="/finance" className="flex flex-col items-center gap-1 w-12 group relative">
                                <div className={`absolute -inset-2 bg-emerald-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${location.pathname === '/finance' ? 'opacity-50' : ''}`}></div>
                                <span className={`material-symbols-outlined text-2xl transition-all duration-300 relative z-10 ${getIconClass('/finance')}`}>account_balance_wallet</span>
                                <span className={`text-[10px] font-medium transition-colors relative z-10 ${getTextClass('/finance')}`}>Finanzas</span>
                            </Link>

                            <Link to="/musicians" className="flex flex-col items-center gap-1 w-12 group relative">
                                <div className={`absolute -inset-2 bg-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${location.pathname === '/musicians' ? 'opacity-50' : ''}`}></div>
                                <span className={`material-symbols-outlined text-2xl transition-all duration-300 relative z-10 ${getIconClass('/musicians')}`}>groups</span>
                                <span className={`text-[10px] font-medium transition-colors relative z-10 ${getTextClass('/musicians')}`}>Banda</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
