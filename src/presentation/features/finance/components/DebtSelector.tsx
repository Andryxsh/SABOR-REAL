import React, { useState } from 'react';

interface DebtSelectorProps {
    debtors: any[];
    upToDate: any[];
    selectedId: string | null;
    totalDeuda: number;
    onSelect: (id: string) => void;
}

/**
 * DebtSelector (v2) - High Fidelity Sidebar
 */
const DebtSelector: React.FC<DebtSelectorProps> = ({ debtors, upToDate, selectedId, totalDeuda, onSelect }) => {
    const [showAll, setShowAll] = useState(false);

    return (
        <div className="flex flex-col h-full min-h-0 relative z-10 transition-all">
            {/* Header de la Sección (Unboxed Estilo Original) */}
            <div className="px-2 pb-6 flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter drop-shadow-md">
                        <span className="material-symbols-outlined text-yellow-500 text-3xl animate-pulse" style={{ animationDuration: '3s' }}>groups</span>
                        Equipo <span className="text-white/40 text-lg font-bold">(Deudas)</span>
                    </h2>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-yellow-500/80 font-black uppercase tracking-[0.2em] mb-0.5">Total Por Pagar</div>
                    <div className="text-2xl font-black text-yellow-400 tracking-tighter drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">
                        {totalDeuda.toLocaleString()} <span className="text-sm text-yellow-500/60 font-black">Bs</span>
                    </div>
                </div>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 space-y-3 pb-20">
                {/* 1. DEUDORES PRINCIPALES */}
                {debtors.slice(0, showAll ? undefined : 6).map((m, idx) => (
                    <div
                        key={m.id}
                        onClick={() => onSelect(m.id)}
                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
                        className={`p-4 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden group will-change-transform animate-slide-in-from-right ${selectedId === m.id
                            ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-xl'
                            : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20 backdrop-blur-md hover:-translate-y-0.5'
                            }`}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all shadow-lg ${selectedId === m.id
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-110 shadow-indigo-600/30 ring-2 ring-indigo-400/20'
                                    : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white border border-white/5'
                                    }`}>
                                    {m.nombre.charAt(0)}{m.apellido?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`font-black tracking-tight truncate transition-colors ${selectedId === m.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {m.nombre} {m.apellido}
                                    </h4>
                                    <div className={`mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${selectedId === m.id ? 'text-indigo-300' : 'text-yellow-500/80'
                                        }`}>
                                        <span className="material-symbols-outlined text-[12px]">payments</span>
                                        Deuda: <span className="font-black text-sm ml-0.5">{m.balance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`size-8 rounded-full flex items-center justify-center border transition-all ${selectedId === m.id
                                ? 'bg-indigo-500 border-indigo-400 text-white rotate-90 '
                                : 'border-white/5 text-gray-600 group-hover:border-white/20'
                                }`}>
                                <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* BOTÓN VER MÁS */}
                {!showAll && debtors.length > 6 && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="w-full py-4 rounded-3xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        Ver {debtors.length - 6} Integrantes más
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                    </button>
                )}

                {/* 2. INTEGRANTES AL DÍA */}
                {showAll && (
                    <div className="animate-fade-in pt-4">
                        <div className="h-px bg-white/5 mx-4 mb-6"></div>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] ml-4 mb-4">Cuentas al Día</p>
                        {upToDate.map(m => (
                            <div
                                key={m.id}
                                onClick={() => onSelect(m.id)}
                                className={`p-4 rounded-3xl border transition-all mb-2 flex items-center justify-between group ${selectedId === m.id
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-transparent border-transparent hover:bg-white/5 opacity-40 hover:opacity-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold text-white/20">
                                        {m.nombre.charAt(0)}{m.apellido?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">{m.nombre} {m.apellido}</span>
                                </div>
                                {selectedId === m.id && <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>}
                            </div>
                        ))}

                        <button
                            onClick={() => setShowAll(false)}
                            className="w-full py-4 rounded-3xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            Colapsar Lista
                            <span className="material-symbols-outlined text-sm">expand_less</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DebtSelector;
