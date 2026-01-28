import React from 'react';
import { createPortal } from 'react-dom';
import MusicianForm from '@/presentation/features/musicians/components/forms/MusicianForm';
import type { Musician } from '@/core/domain/entities/Musician';

interface EditMusicianModalProps {
    isOpen: boolean;
    member: Musician;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

/**
 * EditMusicianModal (v2)
 */
const EditMusicianModal: React.FC<EditMusicianModalProps> = ({ isOpen, member, onClose, onSubmit }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Editar Integrante</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <MusicianForm
                        initialData={member}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditMusicianModal;
