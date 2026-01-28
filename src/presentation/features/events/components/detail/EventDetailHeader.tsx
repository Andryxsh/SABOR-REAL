import React from 'react';
import { useNavigate } from 'react-router-dom';
import { V2_ROUTES } from '@/constants/Routes';

interface EventDetailHeaderProps {
    isLocked: boolean;
    onToggleLock: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

/**
 * EventDetailHeader (v2)
 * Cabecera modular para la vista de detalle.
 * Separa la navegación y las acciones administrativas.
 */
const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({
    isLocked,
    onToggleLock,
    onEdit,
    onDelete
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between animate-fade-in">
            {/* Botón Volver */}
            <button
                onClick={() => navigate(V2_ROUTES.EVENTS)}
                className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 active:scale-90"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>

            {/* Título Central */}
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-40 ml-4 flex-1">
                Detalle de Evento
            </h2>

            {/* Acciones */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleLock}
                    className={`size-10 rounded-full flex items-center justify-center transition-all border ${isLocked
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-xl">
                        {isLocked ? 'lock' : 'lock_open'}
                    </span>
                </button>

                {!isLocked && (
                    <>
                        <button
                            onClick={onEdit}
                            className="size-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                            onClick={onDelete}
                            className="size-10 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EventDetailHeader;
