import React from 'react';
import type { Event } from '@/core/domain/entities/Event';
import type { Musician } from '@/core/domain/entities/Musician';
import type { Payment } from '@/core/domain/entities/Payment';
import Card from '@/presentation/components/ui/Card';
import EventMusicianItem from './EventMusicianItem';

interface EventMusiciansListProps {
    assignedMusicians: any[];
    allMusicians: Musician[];
    allEvents: Event[];
    allPayments: Payment[];
    isLocked: boolean;
    onToggleAttendance: (musicianId: string) => void;
    onRemove: (musicianId: string) => void;
    onAdd: () => void;
}

/**
 * EventMusiciansList (v2)
 * Contenedor modular para la gestión de músicos en el detalle del evento.
 * Orquestador de la lógica de balance global.
 */
const EventMusiciansList: React.FC<EventMusiciansListProps> = ({
    assignedMusicians,
    allMusicians,
    allEvents,
    allPayments,
    isLocked,
    onToggleAttendance,
    onRemove,
    onAdd
}) => {

    // Función para calcular balance global REAL
    const calculateGlobalBalance = (musicianId: string) => {
        const totalEarned = allEvents.reduce((sum, ev) => {
            const a = ev.musicosAsignados?.find(mx => mx.musicianId === musicianId && mx.asistio);
            return sum + (a ? a.montoPagar : 0);
        }, 0);

        const totalPaid = allPayments
            .filter(p => p.musicianId === musicianId)
            .reduce((sum, p) => sum + p.monto, 0);

        return totalEarned - totalPaid; // Positivo = El grupo le debe
    };

    return (
        <Card className="bg-black/40 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">group</span>
                    Integrantes Asignados ({assignedMusicians.length})
                </h3>

                {!isLocked && (
                    <button
                        onClick={onAdd}
                        className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[9px] font-black uppercase tracking-widest hover:bg-purple-500/20 active:scale-95 transition-all"
                    >
                        + Agregar
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {assignedMusicians.length === 0 ? (
                    <div className="text-center py-10 opacity-20 italic text-[10px] uppercase font-bold">
                        No hay integrantes asignados todavía
                    </div>
                ) : (
                    assignedMusicians.map((assigned) => {
                        const musician = allMusicians.find(m => m.id === assigned.musicianId);
                        if (!musician) return null;

                        return (
                            <EventMusicianItem
                                key={assigned.musicianId}
                                assigned={assigned}
                                musician={musician}
                                globalBalance={calculateGlobalBalance(musician.id)}
                                isLocked={isLocked}
                                onToggleAttendance={() => onToggleAttendance(musician.id)}
                                onRemove={() => onRemove(musician.id)}
                            />
                        );
                    })
                )}
            </div>
        </Card>
    );
};

export default EventMusiciansList;
