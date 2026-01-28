import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/presentation/layouts/MainLayout';
import Card from '@/presentation/components/ui/Card';

/**
 * Profile Page
 * Página de perfil del usuario con información de la cuenta
 */
const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 py-6 px-4 animate-fade-in pb-32 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Mi Perfil</h1>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Información de Cuenta</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">close</span>
                    </button>
                </div>

                {/* Avatar Section */}
                <Card className="p-8 text-center">
                    <div className="size-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-purple-900/40 mb-4">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{user.email?.split('@')[0]}</h2>
                    <p className="text-white/40 text-sm">Administrador</p>
                </Card>

                {/* Account Info */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">badge</span>
                        Información de Cuenta
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">
                                Email
                            </label>
                            <p className="text-white font-medium">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">
                                ID de Usuario
                            </label>
                            <p className="text-white/60 font-mono text-xs">{user.uid}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">
                                Rol
                            </label>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
                                <span className="material-symbols-outlined text-purple-400 text-sm">admin_panel_settings</span>
                                <span className="text-purple-300 text-sm font-bold">Administrador</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* System Info */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">info</span>
                        Información del Sistema
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/40">Versión</span>
                            <span className="text-white font-bold">v2.0 (Nivel Máximo)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Arquitectura</span>
                            <span className="text-white font-bold">Hexagonal + Zustand</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Estado</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Activo
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/configuracion')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-purple-400">settings</span>
                            <span className="text-white font-bold">Ir a Configuración</span>
                        </div>
                        <span className="material-symbols-outlined text-white/40 group-hover:translate-x-1 transition-transform">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};

export default Profile;
