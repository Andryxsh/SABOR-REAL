import React from 'react';
import type { Event } from '@/core/domain/entities/Event';

interface EventCardProps {
    event: Event;
    onClick: (id: string) => void;
}

/**
 * EventCard (v2)
 * Tarjeta premium para la lista de eventos.
 * Incluye imágenes dinámicas, efectos glass y badges optimizados.
 */
const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {

    const eventImages: Record<string, string> = {
        discoteca: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
        privado: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        viaje: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
        ensayo: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=800',
        privado_3h: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        viaje_3h: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
        viaje_discoteca: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    };

    const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800';

    return (
        <div
            onClick={() => onClick(event.id)}
            className={`group relative bg-black/40 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98] ${event.locked ? 'grayscale opacity-60' : ''}`}
        >
            {/* Imagen de fondo con overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={eventImages[event.type] || defaultImage}
                    alt="Event Background"
                    loading="lazy"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>

            {/* Efecto de brillo al pasar el ratón */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors pointer-events-none"></div>

            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${event.type === 'discoteca' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
                            event.type === 'privado' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                                'bg-gray-500/10 border-gray-500/30 text-gray-300'
                            }`}>
                            {event.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${event.status === 'Confirmado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                            event.status === 'Pendiente' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                                'bg-red-500/10 border-red-500/30 text-red-300'
                            }`}>
                            {event.status}
                        </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-purple-200 transition-colors truncate mb-3 tracking-tight">
                        {event.title}
                    </h3>

                    {/* Info Básica */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                            <span className="material-symbols-outlined text-sm opacity-50">calendar_today</span>
                            <span className="text-gray-200">{event.date}</span>
                            <span className="opacity-20">•</span>
                            <span className="text-gray-200">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                            <span className="material-symbols-outlined text-sm opacity-50">location_on</span>
                            <span className="truncate text-gray-200">{event.location}</span>
                        </div>
                    </div>
                </div>

                {/* Financiero */}
                <div className="text-right shrink-0">
                    <div className="text-xl font-black text-white">
                        {event.precio} <span className="text-[10px] font-normal text-white/40 ml-0.5">Bs</span>
                    </div>
                    {event.adelanto > 0 && (
                        <div className="text-[9px] text-emerald-400 font-black mt-2 inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tighter">
                            OK
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
