import React from 'react';
import { createPortal } from 'react-dom';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

/**
 * DeleteConfirmationModal (v2)
 */
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "¿Eliminar Registro?",
    message = "Esta acción eliminará el registro de forma permanente y afectará los balances. ¿Estás seguro?"
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-sm bg-[#0a0a0a] sm:rounded-[2.5rem] rounded-t-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-slide-up p-8">
                <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-500/20 ring-4 ring-black/20">
                    <span className="material-symbols-outlined text-4xl">delete_forever</span>
                </div>

                <h3 className="text-xl font-black text-white text-center mb-2 tracking-tighter">{title}</h3>
                <p className="text-white/40 text-center text-xs font-medium leading-relaxed mb-8 px-4">
                    {message}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-4 rounded-2xl bg-red-600 shadow-lg shadow-red-600/30 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteConfirmationModal;
