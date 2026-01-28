import React from 'react';
import type { Event } from '@/core/domain/entities/Event';
import Card from '@/presentation/components/ui/Card';

interface EventDetailInfoProps {
    event: Event;
}

/**
 * EventDetailInfo (v2)
 * Tarjeta central de información del evento.
 * Replica los estilos premium con modularidad total.
 */
const EventDetailInfo: React.FC<EventDetailInfoProps> = ({ event }) => {

    const eventImages: Record<string, string> = {
        discoteca: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
        privado: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
        viaje: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200',
        ensayo: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=1200',
    };

    const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200';

    return (
        <Card padding="none" className="overflow-hidden relative border-white/10 shadow-3xl bg-[#0a0a0a]">
            {/* Fondo con Imagen y Gradiente */}
            <div className="h-48 relative overflow-hidden">
                <img
                    src={eventImages[event.type] || defaultImage}
                    alt="Event background"
                    className="w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>

                {/* Badges Flotantes */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.2em] border ${event.type === 'discoteca' ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' :
                        event.type === 'privado' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
                            'bg-gray-500/20 border-white/10 text-gray-300'
                        }`}>
                        {event.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.2em] border ${event.status === 'Confirmado' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
                        'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                        }`}>
                        {event.status}
                    </span>
                </div>
            </div>

            {/* Contenido de Info */}
            <div className="p-6 space-y-6 relative z-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                        {event.title}
                    </h1>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                        Identificador: {event.id.slice(0, 8).toUpperCase()}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fecha y Hora */}
                    <div className="flex items-start gap-3">
                        <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                            <span className="material-symbols-outlined text-xl">calendar_month</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Fecha y Hora</p>
                            <p className="text-sm font-bold text-white">{event.date}</p>
                            <p className="text-[11px] text-gray-500">A las {event.time}</p>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-start gap-3">
                        <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                            <span className="material-symbols-outlined text-xl">location_on</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Ubicación</p>
                            <p className="text-sm font-bold text-white truncate max-w-[200px]">{event.location}</p>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/10"></div>

                {/* Cliente y Notas */}
                <div className="space-y-4">
                    {event.cliente?.nombre && (
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/30">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Cliente</p>
                                <p className="text-sm font-black text-white">{event.cliente.nombre}</p>
                                {event.cliente.telefono && <p className="text-[10px] text-gray-500 font-bold">{event.cliente.telefono}</p>}
                            </div>
                        </div>
                    )}

                    {event.notas && (
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 border-dashed">
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-2">Notas Adicionales</p>
                            <p className="text-xs text-gray-400 italic leading-relaxed">{event.notas}</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default EventDetailInfo;
