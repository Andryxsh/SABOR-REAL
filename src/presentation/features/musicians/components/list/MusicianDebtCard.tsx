import React from 'react';
import Card from '@/presentation/components/ui/Card';

interface MusicianDebtCardProps {
    name: string;
    role: string;
    debt: number;
    onClick: () => void;
}

/**
 * MusicianDebtCard (v2)
 * Versión simplificada para el Dashboard.
 */
const MusicianDebtCard: React.FC<MusicianDebtCardProps> = ({ name, role, debt, onClick }) => {
    return (
        <Card
            hover
            onClick={onClick}
            className="flex items-center justify-between p-4 bg-white/5 border-white/5 hover:border-yellow-500/30 transition-all active:scale-[0.98]"
        >
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                    <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                    <p className="text-sm font-black text-white">{name}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{role}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-yellow-500">{debt} Bs</p>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Deuda</p>
            </div>
        </Card>
    );
};

export default MusicianDebtCard;
