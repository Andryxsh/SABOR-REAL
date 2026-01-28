import React from 'react';
import { useNavigate } from 'react-router-dom';
import { V2_ROUTES } from '@/constants/Routes';
import type { Musician } from '@/core/domain/entities/Musician';
import type { Event } from '@/core/domain/entities/Event';
import type { Payment } from '@/core/domain/entities/Payment';
import Card from '@/presentation/components/ui/Card';

interface MusicianCardProps {
    member: Musician;
    allEvents: Event[];
    allPayments: Payment[];
}

/**
 * MusicianCard (v2)
 */
const MusicianCard: React.FC<MusicianCardProps> = ({ member, allEvents, allPayments }) => {
    const navigate = useNavigate();

    // Cálculo de balance global (Logic original centralizada)
    const totalEarned = allEvents.reduce((sum, ev) => {
        const a = ev.musicosAsignados?.find(mx => mx.musicianId === member.id && mx.asistio);
        return sum + (a ? a.montoPagar : 0);
    }, 0);

    const totalPaid = allPayments
        .filter(p => p.musicianId === member.id)
        .reduce((sum, p) => sum + p.monto, 0);

    const balance = totalEarned - totalPaid;

    return (
        <Card
            onClick={() => navigate(V2_ROUTES.MUSICIAN_DETAIL(member.id))}
            className="group relative overflow-hidden bg-white/5 border-white/5 hover:border-primary/30 transition-all active:scale-[0.98] cursor-pointer"
        >
            <div className="flex items-center gap-4">
                {/* Avatar con Estado */}
                <div className="relative shrink-0">
                    <div className="size-16 rounded-full p-[2px] bg-gradient-to-br from-primary via-purple-500 to-blue-500 shadow-xl group-hover:shadow-primary/20 transition-all">
                        <div
                            className="w-full h-full rounded-full bg-gray-900 bg-cover bg-center border-2 border-black/50"
                            style={{ backgroundImage: `url("${member.imageUrl || '/assets/default_avatar.webp'}")` }}
                        ></div>
                    </div>
                    <div className={`absolute bottom-0 right-0 size-4 border-[3px] border-[#0a0a0a] rounded-full ${member.status === 'activo' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                        member.status === 'vacaciones' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-base font-black text-white truncate leading-none mb-1">
                                {member.nombre} {member.apellido || ''}
                            </h3>
                            {member.apodo && (
                                <p className="text-[10px] text-primary font-bold italic opacity-60">"{member.apodo}"</p>
                            )}
                        </div>
                        <span className="material-symbols-outlined text-white/10 group-hover:text-primary transition-colors">chevron_right</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                            {member.role || 'Sin Rol'}
                        </span>

                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${balance > 0
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                            }`}>
                            <div className={`size-1 rounded-full ${balance > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                            {balance > 0 ? `Debes: ${balance} Bs` : 'Saldado'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones de Contacto Rápido */}
            <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                {member.phone && (
                    <a
                        href={`https://wa.me/591${member.phone.replace(/\s+/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noreferrer"
                        className="size-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">chat</span>
                    </a>
                )}
                <a
                    href={`tel:${member.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="size-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined text-sm font-bold">call</span>
                </a>
            </div>
        </Card>
    );
};

export default MusicianCard;
