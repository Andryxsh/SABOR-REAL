import React from 'react';
import type { Event } from '@/core/domain/entities/Event';
import Card from '@/presentation/components/ui/Card';

interface EventFinancialSummaryProps {
    event: Event;
    isLocked: boolean;
    onAddAdelanto: () => void;
}

/**
 * EventFinancialSummary (v2)
 * Panel financiero modular para visualización de rentabilidad.
 * Mejora estética sobre la gestión de adelantos y saldos.
 */
const EventFinancialSummary: React.FC<EventFinancialSummaryProps> = ({
    event,
    isLocked,
    onAddAdelanto
}) => {

    // Cálculo de pagos a músicos (Logic original)
    const totalMúsicos = event.musicosAsignados.reduce((sum, m) => sum + (m.asistio ? m.montoPagar : 0), 0);
    const gananciaNeta = event.precio - totalMúsicos;

    return (
        <Card className="space-y-6 bg-black/40 border-white/5 shadow-2xl overflow-hidden relative group">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="material-symbols-outlined text-base">payments</span>
                Control Financiero
            </h3>

            <div className="space-y-4">
                {/* 1. Precio y Adelanto */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Precio Total</p>
                        <p className="text-xl font-black text-white">{event.precio} <span className="text-[10px] font-normal text-white/40">Bs</span></p>
                    </div>
                    <div className="bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10 relative">
                        <p className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest mb-1">Adelanto</p>
                        <p className="text-xl font-black text-emerald-400">{event.adelanto} <span className="text-[10px] font-normal text-emerald-500/40">Bs</span></p>

                        {!isLocked && (
                            <button
                                onClick={onAddAdelanto}
                                className="absolute top-3 right-3 size-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm font-bold">add</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Saldo y Pagos */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Saldo Pendiente</span>
                        <span className="text-sm font-black text-yellow-400">{event.saldo} Bs</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Gastos Músicos</span>
                        <span className="text-sm font-black text-red-400">-{totalMúsicos} Bs</span>
                    </div>
                </div>

                {/* 3. Ganancia Neta (Panel Premium) */}
                <div className={`mt-6 p-5 rounded-3xl border relative overflow-hidden transition-all ${gananciaNeta >= 0
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                    }`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-30 ${gananciaNeta >= 0 ? 'bg-purple-500' : 'bg-red-500'
                        }`}></div>

                    <div className="flex justify-between items-end relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Ganancia Real</p>
                            <p className="text-3xl font-black text-white tracking-tighter">
                                {gananciaNeta} <span className="text-xs font-normal text-white/40 ml-1">Bs</span>
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${gananciaNeta >= 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                            {gananciaNeta >= 0 ? 'Rentable' : 'Pérdida'}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EventFinancialSummary;
