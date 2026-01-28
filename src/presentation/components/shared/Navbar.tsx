import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { V2_ROUTES } from '@/constants/Routes';

/**
 * Navbar (v2)
 * Barra de navegación inferior optimizada con botón de acción contextual.
 */
const NavbarV2: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getIconClass = (path: string) => {
        return location.pathname === path ? 'text-primary' : 'text-text-secondary group-hover:text-white';
    }

    const getTextClass = (path: string) => {
        return location.pathname === path ? 'text-primary' : 'text-text-secondary group-hover:text-white';
    }

    // Lógica del Botón Contextual (Acción Principal según la sección)
    const getAction = () => {
        switch (location.pathname) {
            case V2_ROUTES.FINANCE:
                return {
                    icon: 'payments',
                    label: 'Pago',
                    onClick: () => navigate(V2_ROUTES.FINANCE, { state: { openPaymentModal: true } }),
                    colors: 'from-emerald-600 to-teal-600',
                    shadow: 'shadow-emerald-500/30'
                };
            case V2_ROUTES.MUSICIANS:
                return {
                    icon: 'person_add',
                    label: 'Músico',
                    onClick: () => navigate(V2_ROUTES.MUSICIANS, { state: { openCreateMusicianModal: true } }),
                    colors: 'from-pink-600 to-rose-600',
                    shadow: 'shadow-pink-500/30'
                };
            default:
                return {
                    icon: 'add_circle',
                    label: 'Evento',
                    onClick: () => navigate(V2_ROUTES.EVENTS, { state: { openCreateModal: true } }),
                    colors: 'from-purple-600 to-blue-600',
                    shadow: 'shadow-purple-500/30'
                };
        }
    };

    const action = getAction();

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
            {/* Gradient shadow to blend with content */}
            <div className="h-12 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

            <div className="bg-black/40 backdrop-blur-xl border-t border-white/10 pb-6 pt-3 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center relative">
                    {/* Decorative Neon Top Border */}
                    <div className="absolute inset-x-0 -top-[1px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

                    {/* Nav Items */}
                    <Link to={V2_ROUTES.DASHBOARD} className="flex flex-col items-center gap-1 w-12 group relative">
                        <div className={`absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 transition-opacity ${location.pathname === V2_ROUTES.DASHBOARD ? 'opacity-50' : 'group-hover:opacity-100'}`}></div>
                        <span className={`material-symbols-outlined text-2xl relative z-10 transition-all ${getIconClass(V2_ROUTES.DASHBOARD)}`}>dashboard</span>
                        <span className={`text-[10px] font-medium relative z-10 transition-colors ${getTextClass(V2_ROUTES.DASHBOARD)}`}>Inicio</span>
                    </Link>

                    <Link to={V2_ROUTES.EVENTS} className="flex flex-col items-center gap-1 w-12 group relative">
                        <div className={`absolute -inset-2 bg-blue-500/20 rounded-full blur-lg opacity-0 transition-opacity ${location.pathname === V2_ROUTES.EVENTS ? 'opacity-50' : 'group-hover:opacity-100'}`}></div>
                        <span className={`material-symbols-outlined text-2xl relative z-10 transition-all ${getIconClass(V2_ROUTES.EVENTS)}`}>calendar_month</span>
                        <span className={`text-[10px] font-medium relative z-10 transition-colors ${getTextClass(V2_ROUTES.EVENTS)}`}>Eventos</span>
                    </Link>

                    {/* Central Floating Action Button */}
                    <div className="-mt-10 relative group z-50">
                        <div className={`absolute inset-0 bg-gradient-to-r ${action.colors} rounded-full blur-md opacity-50 group-hover:opacity-100 animate-pulse transition-opacity`}></div>
                        <button
                            onClick={action.onClick}
                            className={`relative flex items-center justify-center size-16 rounded-full bg-gradient-to-r ${action.colors} text-white shadow-xl ${action.shadow} hover:scale-110 active:scale-95 transition-all outline-4 outline-black`}>
                            <span className="material-symbols-outlined text-3xl">{action.icon}</span>
                        </button>
                    </div>

                    <Link to={V2_ROUTES.FINANCE} className="flex flex-col items-center gap-1 w-12 group relative">
                        <div className={`absolute -inset-2 bg-emerald-500/20 rounded-full blur-lg opacity-0 transition-opacity ${location.pathname === V2_ROUTES.FINANCE ? 'opacity-50' : 'group-hover:opacity-100'}`}></div>
                        <span className={`material-symbols-outlined text-2xl relative z-10 transition-all ${getIconClass(V2_ROUTES.FINANCE)}`}>account_balance_wallet</span>
                        <span className={`text-[10px] font-medium relative z-10 transition-colors ${getTextClass(V2_ROUTES.FINANCE)}`}>Finanzas</span>
                    </Link>

                    <Link to={V2_ROUTES.MUSICIANS} className="flex flex-col items-center gap-1 w-12 group relative">
                        <div className={`absolute -inset-2 bg-pink-500/20 rounded-full blur-lg opacity-0 transition-opacity ${location.pathname === V2_ROUTES.MUSICIANS ? 'opacity-50' : 'group-hover:opacity-100'}`}></div>
                        <span className={`material-symbols-outlined text-2xl relative z-10 transition-all ${getIconClass(V2_ROUTES.MUSICIANS)}`}>groups</span>
                        <span className={`text-[10px] font-medium relative z-10 transition-colors ${getTextClass(V2_ROUTES.MUSICIANS)}`}>Banda</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavbarV2;
