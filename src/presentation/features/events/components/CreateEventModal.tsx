import React from 'react';
import { createPortal } from 'react-dom';
import EventForm from './EventForm';

interface CreateEventModalProps {
    isOpen: boolean;
    initialDate?: string | null;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

/**
 * CreateEventModal (v2)
 * Modal modular para la creación de eventos.
 */
const CreateEventModal: React.FC<CreateEventModalProps> = ({
    isOpen,
    initialDate,
    onClose,
    onSubmit
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">add_circle</span>
                        Nuevo Evento
                    </h2>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Form Content */}
                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <EventForm
                        initialData={initialDate ? { date: initialDate } as any : undefined}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateEventModal;
