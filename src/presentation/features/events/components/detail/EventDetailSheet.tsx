import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { V2_ROUTES } from '@/constants/Routes';

interface EventDetailSheetProps {
    selectedDate: string | null;
    eventsOnDay: any[];
    onClose: () => void;
    onAddEvent: (date: string) => void;
}

/**
 * EventDetailSheet (v2)
 * Bottom Sheet modular que muestra los eventos de un día seleccionado.
 * Réplica exacta de la funcionalidad y estética original.
 */
const EventDetailSheet: React.FC<EventDetailSheetProps> = ({
    selectedDate,
    eventsOnDay,
    onClose,
    onAddEvent
}) => {
    const navigate = useNavigate();

    if (!selectedDate) return null;

    const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return createPortal(
        <div
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-[#0a0a0a] rounded-t-3xl border-t border-white/10 p-6 animate-slide-up shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-hide"
                onClick={e => e.stopPropagation()}
            >
                {/* Handle / Tirador */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white capitalize">
                        {formattedDate}
                    </h3>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-4 pb-10">
                    {eventsOnDay.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">Sin eventos programados</p>
                            <p className="text-xs text-gray-600 italic">Toca el botón de abajo para agregar uno.</p>
                        </div>
                    ) : (
                        eventsOnDay.map((event) => (
                            <div
                                key={event.id}
                                onClick={() => {
                                    onClose();
                                    navigate(V2_ROUTES.EVENT_DETAIL(event.id));
                                }}
                                className={`group relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer overflow-hidden active:scale-95 ${event.locked ? 'grayscale opacity-60' : ''}`}
                            >
                                <div className="flex items-center justify-between gap-4 relative z-10">
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-white font-bold text-lg leading-tight mb-1 truncate">{event.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${event.type === 'discoteca' ? 'text-purple-300 bg-purple-500/10' :
                                                    event.type === 'privado' ? 'text-blue-300 bg-blue-500/10' :
                                                        'text-gray-300 bg-gray-500/10'
                                                }`}>{event.type}</span>
                                            <span className="opacity-40">•</span>
                                            <span>{event.time}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="block text-emerald-400 font-black text-lg">
                                            {event.precio} <span className="text-[10px] font-normal text-white/40 uppercase tracking-tighter ml-0.5">Bs</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    <button
                        onClick={() => onAddEvent(selectedDate)}
                        className="w-full py-4 mt-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black uppercase tracking-widest text-[10px] hover:bg-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Agregar Evento
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EventDetailSheet;
