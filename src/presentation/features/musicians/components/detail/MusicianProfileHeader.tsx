import React from 'react';
import { useNavigate } from 'react-router-dom';
import { V2_ROUTES } from '@/constants/Routes';
import type { Musician } from '@/core/domain/entities/Musician';

interface MusicianProfileHeaderProps {
    member: Musician;
    onEdit: () => void;
}

/**
 * MusicianProfileHeader (v2)
 * Cabecera de perfil detallado.
 */
const MusicianProfileHeader: React.FC<MusicianProfileHeaderProps> = ({ member, onEdit }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center gap-4 animate-fade-in relative">
            {/* Botón Volver */}
            <button
                onClick={() => navigate(V2_ROUTES.MUSICIANS)}
                className="absolute left-0 top-0 size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 active:scale-90"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>

            {/* Avatar Premium */}
            <div className="size-32 rounded-full p-1 bg-gradient-to-br from-primary via-purple-500 to-blue-600 shadow-2xl mt-4">
                <div
                    className="w-full h-full rounded-full bg-gray-900 bg-cover bg-center border-4 border-black/50"
                    style={{ backgroundImage: `url("${member.imageUrl || '/assets/default_avatar.webp'}")` }}
                ></div>
            </div>

            {/* Info Central */}
            <div className="text-center">
                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                    {member.nombre} {member.apellido || ''}
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{member.role}</span>
                    <span className="size-1 rounded-full bg-white/20"></span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${member.status === 'activo' ? 'text-emerald-400' : 'text-gray-400'
                        }`}>
                        {member.status}
                    </span>
                </div>
            </div>

            {/* Acciones de Contacto y Edit */}
            <div className="flex gap-3 mt-2">
                {member.phone && (
                    <a
                        href={`https://wa.me/591${member.phone.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5"
                    >
                        <span className="material-symbols-outlined text-base">chat</span>
                        WhatsApp
                    </a>
                )}
                <button
                    onClick={onEdit}
                    className="size-10 rounded-full bg-white/5 text-gray-400 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined text-xl">edit</span>
                </button>
            </div>
        </div>
    );
};

export default MusicianProfileHeader;
