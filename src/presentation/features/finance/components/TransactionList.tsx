import React from 'react';

interface Transaction {
    id: string;
    date: string;
    title: string;
    amount: number;
    type: 'ingreso' | 'egreso';
    category: string;
}

interface TransactionListProps {
    transactions: Transaction[];
}

/**
 * TransactionList (v2)
 * Historial detallado de movimientos contables.
 */
const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    return (
        <div className="space-y-4 animate-fade-in pb-20">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Historial Detallado</h3>

            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <span className="material-symbols-outlined text-4xl mb-4">history_toggle_off</span>
                        <p className="text-sm font-black uppercase tracking-widest">Sin transacciones</p>
                        <p className="text-[10px] mt-1 italic opacity-60">No hay movimientos que coincidan con la búsqueda.</p>
                    </div>
                ) : (
                    transactions.map((t, idx) => (
                        <div
                            key={t.id}
                            className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/10 transition-all animate-slide-up"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                {/* Icono semántico */}
                                <div className={`size-12 rounded-2xl flex items-center justify-center border transition-all ${t.type === 'ingreso'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
                                        : 'bg-red-500/10 border-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {t.category === 'Evento' ? 'event' :
                                            t.category === 'Músico' ? 'person' : 'receipt_long'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm font-black text-white group-hover:translate-x-1 transition-transform">{t.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{t.date}</span>
                                        <span className="size-1 rounded-full bg-white/10"></span>
                                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${t.type === 'ingreso' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300' : 'bg-red-500/5 border-red-500/10 text-red-300'
                                            }`}>
                                            {t.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`text-base font-black tracking-tight ${t.type === 'ingreso' ? 'text-emerald-400' : 'text-white'
                                    }`}>
                                    {t.type === 'ingreso' ? '+' : '-'}{t.amount.toLocaleString()}
                                    <span className="text-[9px] font-normal opacity-40 ml-1 text-white">Bs</span>
                                </p>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">
                                    {t.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionList;
