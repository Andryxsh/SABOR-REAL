import React from 'react';
import { createPortal } from 'react-dom';
import EventForm from '../EventForm';
import type { Event } from '@/core/domain/entities/Event';

interface EditEventModalProps {
    isOpen: boolean;
    event: Event;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

/**
 * EditEventModal (v2)
 * Modal modular para la edición de eventos existentes.
 * Reutiliza la lógica de EventForm.
 */
const EditEventModal: React.FC<EditEventModalProps> = ({
    isOpen,
    event,
    onClose,
    onSubmit
}) => {
    if (!isOpen) return null;

    // Adaptar los datos del evento al formato del formulario
    const initialData = {
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        location: event.location,
        status: event.status,
        precio: event.precio.toString(),
        adelanto: event.adelanto.toString(),
        cliente: {
            nombre: event.cliente?.nombre || '',
            telefono: event.cliente?.telefono || '',
        },
        notas: event.notas || ''
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">edit</span>
                        Editar Evento
                    </h2>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Form Content */}
                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <EventForm
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditEventModal;
