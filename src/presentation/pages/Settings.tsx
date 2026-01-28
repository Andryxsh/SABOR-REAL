import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import Card from '@/presentation/components/ui/Card';

/**
 * Settings Page
 * Página de configuración del sistema
 */
const Settings: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 py-6 px-4 animate-fade-in pb-32 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Configuración</h1>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Preferencias del Sistema</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">close</span>
                    </button>
                </div>

                {/* General Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">tune</span>
                        General
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <div>
                                <p className="text-white font-medium">Notificaciones</p>
                                <p className="text-white/40 text-xs">Recibir alertas de eventos</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <div>
                                <p className="text-white font-medium">Modo Oscuro</p>
                                <p className="text-white/40 text-xs">Tema visual de la aplicación</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Data Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">database</span>
                        Datos
                    </h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-left">
                                <p className="text-white font-medium">Sincronización</p>
                                <p className="text-white/40 text-xs">Última sincronización: Hace 2 min</p>
                            </div>
                            <span className="material-symbols-outlined text-emerald-400">sync</span>
                        </button>

                        <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-left">
                                <p className="text-white font-medium">Caché</p>
                                <p className="text-white/40 text-xs">Limpiar datos temporales</p>
                            </div>
                            <span className="material-symbols-outlined text-blue-400">cleaning_services</span>
                        </button>
                    </div>
                </Card>

                {/* System Info */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-400">info</span>
                        Acerca de
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/40">Aplicación</span>
                            <span className="text-white font-bold">Sabor Real Manager</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Versión</span>
                            <span className="text-white font-bold">2.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Arquitectura</span>
                            <span className="text-white font-bold">Hexagonal + Zustand + Lazy Loading</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Estado del Sistema</span>
                            <span className="text-emerald-400 font-bold">Nivel Máximo 🚀</span>
                        </div>
                    </div>
                </Card>

                {/* Back to Profile */}
                <button
                    onClick={() => navigate('/perfil')}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all text-white font-bold"
                >
                    <span className="material-symbols-outlined">person</span>
                    Ver Mi Perfil
                </button>
            </div>
        </MainLayout>
    );
};

export default Settings;
