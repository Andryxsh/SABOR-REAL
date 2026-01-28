import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface AdelantoModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAdelanto: number;
    precioTotal: number;
    onSubmit: (amount: number, mode: 'add' | 'fix') => void;
}

/**
 * AdelantoModal (v2)
 * Modal modular para la gestión de cobros y adelantos.
 */
const AdelantoModal: React.FC<AdelantoModalProps> = ({
    isOpen,
    onClose,
    currentAdelanto,
    precioTotal,
    onSubmit
}) => {
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState<'add' | 'fix'>('add');

    if (!isOpen) return null;

    const handleConfirm = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val < 0) {
            alert('Monto inválido');
            return;
        }
        onSubmit(val, mode);
        setAmount('');
        onClose();
    };

    const saldoRestante = precioTotal - currentAdelanto;

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-xs bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">payments</span>
                        Registrar Cobro
                    </h2>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Selector de Modo */}
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => { setMode('add'); setAmount(''); }}
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'add' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                                }`}
                        >
                            Sumar Pago
                        </button>
                        <button
                            onClick={() => { setMode('fix'); setAmount(currentAdelanto.toString()); }}
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'fix' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                                }`}
                        >
                            Corregir Total
                        </button>
                    </div>

                    {/* Input de Monto */}
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-2xl font-black placeholder-white/10 focus:outline-none focus:border-emerald-500/50 text-center"
                                autoFocus
                            />
                            <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-3">
                                {mode === 'add' ? 'Monto a añadir al saldo' : 'Nuevo total acumulado'}
                            </p>
                        </div>

                        {mode === 'add' && saldoRestante > 0 && (
                            <button
                                onClick={() => setAmount(saldoRestante.toString())}
                                className="w-full py-2 px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all"
                            >
                                Saldar Restante: {saldoRestante} Bs
                            </button>
                        )}
                    </div>

                    {/* Acciones Finales */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-2 py-4 rounded-2xl bg-emerald-600 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AdelantoModal;
