import React from 'react';
import type { Musician } from '@/core/domain/entities/Musician';

interface EventMusicianItemProps {
    assigned: any;
    musician: Musician;
    globalBalance: number;
    isLocked: boolean;
    onToggleAttendance: () => void;
    onRemove: () => void;
}

/**
 * EventMusicianItem (v2)
 * Fila modular para un músico asignado al evento.
 * Incluye lógica visual de asistencia y balance global.
 */
const EventMusicianItem: React.FC<EventMusicianItemProps> = ({
    assigned,
    musician,
    globalBalance,
    isLocked,
    onToggleAttendance,
    onRemove
}) => {
    return (
        <div className={`group flex items-center justify-between p-4 rounded-3xl border transition-all ${assigned.asistio
            ? 'bg-white/5 border-white/10 shadow-lg'
            : 'bg-black/20 border-white/5 grayscale opacity-60'
            }`}>
            <div className="flex items-center gap-4 flex-1">
                {/* Checkbox de Asistencia */}
                <button
                    disabled={isLocked}
                    onClick={onToggleAttendance}
                    className={`size-7 rounded-xl border-2 flex items-center justify-center transition-all ${assigned.asistio
                        ? 'bg-purple-600 border-purple-400 text-white rotate-0'
                        : 'bg-transparent border-white/20 text-transparent -rotate-12'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm font-black">check</span>
                </button>

                <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm tracking-tight ${assigned.asistio ? 'text-white' : 'text-white/40'}`}>
                        {musician.nombre} {musician.apellido}
                    </p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mt-1">
                        {musician.role || 'Sin Rol'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-black text-white">{assigned.montoPagar} <span className="text-[9px] font-normal text-white/40">Bs</span></p>

                    {/* Badge de Balance Global */}
                    {assigned.asistio && (
                        <div className={`mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest inline-flex ${globalBalance > 0
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}>
                            {globalBalance > 0 ? `Debes: ${globalBalance} Bs` : 'Saldado'}
                        </div>
                    )}
                </div>

                {!isLocked && (
                    <button
                        onClick={onRemove}
                        className="size-8 rounded-full bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center border border-white/5"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default EventMusicianItem;
