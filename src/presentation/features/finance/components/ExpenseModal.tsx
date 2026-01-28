import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expense: { concepto: string, monto: number, categoria: string, notas: string }) => void;
}

/**
 * ExpenseModal (v2)
 * Modal para registrar gastos operativos.
 */
const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [concepto, setConcepto] = useState('');
    const [monto, setMonto] = useState('');
    const [categoria, setCategoria] = useState('transporte');
    const [notas, setNotas] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(monto);
        if (!concepto || isNaN(val) || val <= 0) {
            alert('Por favor completa los campos obligatorios');
            return;
        }
        onSubmit({ concepto, monto: val, categoria, notas });
        setConcepto('');
        setMonto('');
        setNotas('');
        onClose();
    };

    const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all font-bold text-sm";
    const labelClasses = "block text-[10px] font-black text-white/40 uppercase mb-1.5 ml-1 trekking-widest";

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                            <span className="material-symbols-outlined text-xl">remove_circle</span>
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Registrar Gasto</h2>
                    </div>
                    <button onClick={onClose} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className={labelClasses}>Concepto *</label>
                        <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej: Taxi a la paz, Cables XLR..." className={inputClasses} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Monto (Bs) *</label>
                            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Categoría</label>
                            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClasses}>
                                <option value="transporte">Transporte</option>
                                <option value="alimentacion">Alimentación</option>
                                <option value="equipo">Equipo</option>
                                <option value="marketing">Marketing</option>
                                <option value="administrativo">Administrativo</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Notas</label>
                        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Detalles extra..." className={`${inputClasses} resize-none h-20`} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Cancelar</button>
                        <button type="submit" className="flex-2 py-4 px-8 bg-red-600 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Guardar Gasto</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ExpenseModal;
