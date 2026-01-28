import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Musician } from '@/core/domain/entities/Musician';

interface LiquidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    musicians: Musician[];
    onSubmit: (payment: { musicianId: string, amount: number, method: 'efectivo' | 'transferencia', note: string }) => void;
    initialMusicianId?: string; // Pre-seleccionar músico
}

/**
 * LiquidationModal (v2)
 * Modal para registrar pagos a los integrantes.
 */
const LiquidationModal: React.FC<LiquidationModalProps> = ({ isOpen, onClose, musicians, onSubmit, initialMusicianId }) => {
    const [musicianId, setMusicianId] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
    const [note, setNote] = useState('');

    // Pre-seleccionar músico cuando se abre el modal
    useEffect(() => {
        if (isOpen && initialMusicianId) {
            setMusicianId(initialMusicianId);
        }
    }, [isOpen, initialMusicianId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!musicianId || isNaN(val) || val <= 0) {
            alert('Por favor selecciona un integrante y un monto válido');
            return;
        }
        onSubmit({
            musicianId,
            amount: val,
            method,
            note
        });
        setMusicianId('');
        setAmount('');
        setNote('');
        onClose();
    };

    const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-bold text-sm";
    const labelClasses = "block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1 trekking-widest";

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-xl">payments</span>
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Registrar Pago</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className={labelClasses}>Integrante</label>
                        <select
                            value={musicianId}
                            onChange={(e) => setMusicianId(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="">Seleccionar integrante...</option>
                            {musicians.map(m => (
                                <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Monto (Bs)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Método</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value as any)}
                                className={inputClasses}
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Notas / Concepto</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ej: Liquidación Evento X..."
                            className={`${inputClasses} resize-none h-20`}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-2 py-4 px-8 bg-primary rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Confirmar Pago
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default LiquidationModal;
