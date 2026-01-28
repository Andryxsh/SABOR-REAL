import React from 'react';
import type { Musician } from '@/core/domain/entities/Musician';
import type { Event } from '@/core/domain/entities/Event';
import type { Payment } from '@/core/domain/entities/Payment';
import Card from '@/presentation/components/ui/Card';

interface MusicianStatsProps {
    member: Musician;
    allEvents: Event[];
    allPayments: Payment[];
}

/**
 * MusicianStats (v2)
 * Estadísticas financieras del perfil detallado.
 */
const MusicianStats: React.FC<MusicianStatsProps> = ({ member, allEvents, allPayments }) => {

    const totalEarned = allEvents.reduce((sum, ev) => {
        const a = ev.musicosAsignados?.find(mx => mx.musicianId === member.id && mx.asistio);
        return sum + (a ? a.montoPagar : 0);
    }, 0);

    const totalPaid = allPayments
        .filter(p => p.musicianId === member.id)
        .reduce((sum, p) => sum + p.monto, 0);

    const balance = totalEarned - totalPaid;

    return (
        <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
            {/* Saldo Pendiente (Caja Principal) */}
            <Card className={`col-span-2 border-white/5 shadow-2xl overflow-hidden relative group transition-all ${balance > 0 ? 'bg-yellow-500/10' : 'bg-emerald-500/10'
                }`}>
                <div className={`absolute -right-8 -top-8 size-32 blur-3xl rounded-full opacity-20 ${balance > 0 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}></div>

                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${balance > 0 ? 'text-yellow-500/60' : 'text-emerald-500/60'
                            }`}>
                            Saldo de Cuenta
                        </p>
                        <p className="text-4xl font-black text-white tracking-tighter">
                            {balance} <span className="text-xs font-normal opacity-40">Bs</span>
                        </p>
                    </div>
                    <div className={`size-12 rounded-2xl flex items-center justify-center border ${balance > 0 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                        <span className="material-symbols-outlined text-2xl">
                            {balance > 0 ? 'pending_actions' : 'check_circle'}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Total Ganado */}
            <Card className="bg-white/5 border-white/5">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Ganado</p>
                <p className="text-xl font-black text-white">{totalEarned} <span className="text-[10px] font-normal opacity-40">Bs</span></p>
            </Card>

            {/* Total Pagado */}
            <Card className="bg-white/5 border-white/5">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Pagado</p>
                <p className="text-xl font-black text-emerald-400">{totalPaid} <span className="text-[10px] font-normal opacity-40">Bs</span></p>
            </Card>
        </div>
    );
};

export default MusicianStats;
