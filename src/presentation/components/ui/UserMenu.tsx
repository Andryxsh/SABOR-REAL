import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    // Obtener inicial para el avatar
    const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
            >
                <div className="size-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/40">
                    {initial}
                </div>
                <div className="hidden sm:block text-left pr-3">
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none mb-0.5">Admin</p>
                    <p className="text-xs font-bold text-white truncate max-w-[100px] group-hover:text-purple-300 transition-colors">
                        {user.email?.split('@')[0]}
                    </p>
                </div>
                <span className={`material-symbols-outlined text-white/40 transition-transform hidden sm:block pr-2 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-14 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in origin-top-right z-50 ring-1 ring-white/5">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Sesión Activa</p>
                    </div>

                    <div className="p-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/perfil');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">person</span>
                            Mi Perfil
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/configuracion');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Configuración
                        </button>
                    </div>

                    <div className="p-2 border-t border-white/5 bg-red-500/5">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500 hover:text-white text-red-400 transition-all text-sm font-bold group"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">logout</span>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
