import React from 'react';
import { createPortal } from 'react-dom';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: {
        musicianName: string;
        amount: number;
        method: string;
        eventTitles: string[];
    };
}

/**
 * PaymentConfirmationModal (v2)
 */
const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ isOpen, onClose, onConfirm, data }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-sm bg-[#111111] sm:rounded-[2.5rem] rounded-t-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-slide-up p-6">
                <div className={`size-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${data.method === 'efectivo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <span className="material-symbols-outlined text-3xl font-black">
                        {data.method === 'efectivo' ? 'payments' : 'account_balance'}
                    </span>
                </div>

                <h3 className="text-xl font-black text-white text-center mb-1">Confirmar Pago</h3>
                <p className="text-white/20 text-[10px] font-black underline decoration-primary/40 underline-offset-4 text-center uppercase tracking-[0.3em] mb-6">
                    MÉTODO: {data.method}
                </p>

                <div className="bg-white/5 rounded-3xl p-5 mb-8 space-y-4 border border-white/5">
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-white/30 text-[10px] uppercase font-black">Músico</span>
                        <span className="text-white">{data.musicianName}</span>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                        <span className="text-white/30 text-[10px] uppercase font-black block mb-2">Desglose (FIFO)</span>
                        <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-2">
                            {data.eventTitles.map((title, idx) => (
                                <div key={idx} className="text-white/80 text-[11px] font-medium flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-primary/40 shrink-0"></span> {title}
                                </div>
                            ))}
                            {data.eventTitles.length === 0 && (
                                <p className="text-[11px] italic text-white/20">Pago de saldo global</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                        <span className="text-white/30 text-[10px] uppercase font-black">Monto a Liquidar</span>
                        <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">{data.amount.toLocaleString()} Bs</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`py-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 ${data.method === 'efectivo' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-blue-600 shadow-blue-600/20'
                            }`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PaymentConfirmationModal;
