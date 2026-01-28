import React from 'react';
import type { Musician } from '@/core/domain/entities/Musician';
import type { Event } from '@/core/domain/entities/Event';
import type { Payment } from '@/core/domain/entities/Payment';

interface MusicianHistoryProps {
    member: Musician;
    allEvents: Event[];
    allPayments: Payment[];
}

/**
 * MusicianHistory (v2)
 * Historial consolidado de eventos y pagos.
 */
const MusicianHistory: React.FC<MusicianHistoryProps> = ({ member, allEvents, allPayments }) => {

    // Unir y ordenar por fecha (más reciente arriba)
    const combinedHistory = [
        ...allEvents
            .filter(ev => ev.musicosAsignados?.some(m => m.musicianId === member.id && m.asistio))
            .map(ev => ({
                id: ev.id,
                date: ev.date,
                title: ev.title,
                amount: ev.musicosAsignados.find(m => m.musicianId === member.id)?.montoPagar || 0,
                type: 'event' as const
            })),
        ...allPayments
            .filter(p => p.musicianId === member.id)
            .map(p => ({
                id: p.id,
                date: p.fecha,
                title: 'Pago Recibido',
                amount: p.monto,
                type: 'payment' as const
            }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Historial de Transacciones</h3>

            <div className="space-y-3">
                {combinedHistory.length === 0 ? (
                    <div className="text-center py-10 opacity-20 italic text-[10px] uppercase font-bold tracking-widest">
                        Sin actividad registrada
                    </div>
                ) : (
                    combinedHistory.map((item, idx) => (
                        <div
                            key={`${item.id}-${idx}`}
                            className="bg-white/5 border border-white/5 rounded-3xl p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-2xl flex items-center justify-center border ${item.type === 'event'
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {item.type === 'event' ? 'event_available' : 'payments'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">{item.title}</p>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${item.type === 'event' ? 'text-white' : 'text-emerald-400'}`}>
                                    {item.type === 'event' ? '+' : '-'}{item.amount} Bs
                                </p>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                    {item.type === 'event' ? 'Honorarios' : 'Liquidación'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MusicianHistory;
