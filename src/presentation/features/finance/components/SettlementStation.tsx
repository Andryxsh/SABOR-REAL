import React, { useState, memo } from 'react';
import type { LedgerItem, LedgerEarning, LedgerPayment } from '@/application/features/finance/hooks/useFinance';

interface SettlementStationProps {
    activeLedger: any;
    stats: any;
    selectedItems: Set<string>;
    handleToggleSelect: (id: string) => void;
    selectedTotal: number;
    onSettle: (method: 'efectivo' | 'transferencia') => void;
    onDelete: (id: string) => void;
    onErrorMonto: () => void;
    onClose?: () => void;
}

/**
 * TransactionItem
 */
const TransactionItem = memo(({
    item,
    isSelected,
    onSelect,
    isExpanded,
    onToggleExpand,
    onDelete
}: {
    item: LedgerItem,
    isSelected: boolean,
    onSelect: (id: string) => void,
    isExpanded: boolean,
    onToggleExpand: (id: string) => void,
    onDelete: (id: string) => void
}) => {
    const isEarning = item.type === 'earning';
    // Acceso seguro mediante casting o Type Guards de facto
    const earning = isEarning ? item as LedgerEarning : null;
    const payment = !isEarning ? item as LedgerPayment : null;

    const isPaid = earning?.status === 'paid';
    const isPartial = earning?.status === 'partial';

    return (
        <div className="animate-fade-in">
            <div
                onClick={() => isEarning ? (!isPaid && onSelect(item.id)) : onToggleExpand(item.id)}
                className={`flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${isEarning
                        ? isPaid
                            ? 'bg-white/5 border-white/5 opacity-50 grayscale'
                            : isSelected
                                ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                                : 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10'
                        : 'bg-red-500/5 border-red-500/10 shadow-lg'
                    }`}
            >
                {isEarning && (
                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${isPaid
                            ? 'border-white/10 bg-white/5'
                            : isSelected
                                ? 'bg-primary border-primary'
                                : 'border-white/20 group-hover:border-white/40'
                        }`}>
                        {isPaid
                            ? <span className="material-symbols-outlined text-white/20 text-[12px]">lock</span>
                            : isSelected && <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>
                        }
                    </div>
                )}

                <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${isEarning ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                    }`}>
                    <span className="material-symbols-outlined text-xl">
                        {isEarning ? 'event' : 'payments'}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white flex items-center gap-2 truncate">
                        {item.title}
                        {isPartial && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-md border border-yellow-500/20 uppercase tracking-tighter">Parcial</span>}
                    </div>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{item.date}</p>
                </div>

                <div className="text-right">
                    <p className={`font-black ${isEarning ? 'text-white' : 'text-emerald-400'}`}>
                        {isEarning ? '+' : '-'}{item.amount.toLocaleString()} <span className="text-[9px] font-normal opacity-40">Bs</span>
                    </p>
                    {isPartial && earning && (
                        <p className="text-[9px] font-bold text-yellow-500 mt-0.5">Resta: {earning.amount - earning.paidAmount} Bs</p>
                    )}
                </div>

                {!isEarning && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                        }}
                        className="text-white/20 hover:text-red-500 transition-colors pl-2"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                )}
            </div>

            {!isEarning && isExpanded && payment && (
                <div className="mx-6 p-4 bg-black/40 rounded-b-3xl border-x border-b border-white/5 space-y-3 animate-slide-up shadow-inner">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Desglose de Pago (FIFO)</p>
                    {payment.coveredEvents?.length > 0 ? (
                        payment.coveredEvents.map((evt: any) => (
                            <div key={evt.id} className="flex justify-between items-center text-[11px] font-medium">
                                <span className="text-white/60 truncate pr-4">• {evt.title}</span>
                                <span className="text-emerald-400 font-bold shrink-0">{evt.coveredAmount} Bs</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-[10px] italic text-white/20">Pago manual o ajuste directo.</p>
                    )}
                </div>
            )}
        </div>
    );
});

/**
 * SettlementStation
 */
const SettlementStation: React.FC<SettlementStationProps> = ({
    activeLedger,
    selectedItems,
    handleToggleSelect,
    selectedTotal,
    onSettle,
    onDelete,
    onErrorMonto,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'pendientes' | 'historial' | 'todo'>('pendientes');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredHistory = activeLedger.history.filter((item: LedgerItem) => {
        if (activeTab === 'pendientes') return item.type === 'earning' && item.status !== 'paid';
        if (activeTab === 'historial') return item.type === 'payment';
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-[#050505]/60 backdrop-blur-3xl relative overflow-hidden animate-fade-in group w-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 shadow-2xl relative z-10">
                <div className="flex items-center gap-5">
                    {onClose && (
                        <button onClick={onClose} className="md:hidden size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    )}
                    <div className="size-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/40 ring-4 ring-black/20">
                        {activeLedger.nombre.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{activeLedger.nombre}</h2>
                        <p className="text-indigo-300/60 text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">shield_person</span>
                            {activeLedger.role || 'Integrate'}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.3em] mb-1">Deuda Pendiente</p>
                    <div className={`text-4xl font-black tracking-tighter drop-shadow-lg ${activeLedger.balance > 0.01 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {activeLedger.balance.toLocaleString()} <span className="text-xs font-normal opacity-40 ml-1">Bs</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar pb-32">
                <div className="flex p-1 gap-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/5 sticky top-0 z-20 shadow-xl mb-6">
                    {['pendientes', 'historial', 'todo'].map((tab: any) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-inner' : 'text-white/20 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab === 'pendientes' ? 'Por Pagar' : tab === 'historial' ? 'Pagos' : 'Todo'}
                        </button>
                    ))}
                </div>

                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                        <span className="material-symbols-outlined text-6xl mb-4">account_balance_wallet</span>
                        <p className="text-xs font-black uppercase tracking-widest italic font-bold">Sin movimientos registrados</p>
                    </div>
                ) : (
                    filteredHistory.map((item: LedgerItem, idx: number) => (
                        <TransactionItem
                            key={`${item.id}-${idx}`}
                            item={item}
                            isSelected={selectedItems.has(item.id)}
                            onSelect={handleToggleSelect}
                            isExpanded={expandedIds.has(item.id)}
                            onToggleExpand={toggleExpand}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/5 backdrop-blur-xl z-30">
                {activeLedger.balance > 0.01 ? (
                    <div className="max-w-xl mx-auto space-y-4">
                        <button
                            onClick={() => onSettle('efectivo')}
                            className="w-full flex items-center justify-between p-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400/30 transition-all active:scale-[0.98] group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">payments</span>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60">
                                        {selectedItems.size > 0 ? `Liquidando Selección (${selectedItems.size})` : 'Liquidar Saldo Total'}
                                    </p>
                                    <p className="text-2xl font-black tracking-tight">
                                        Pagar {(selectedItems.size > 0 ? selectedTotal : activeLedger.balance).toLocaleString()} Bs
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-2xl opacity-40 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onSettle('transferencia')}
                                className="py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all"
                            >
                                QR / banco
                            </button>
                            <button
                                onClick={onErrorMonto}
                                className="py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all"
                            >
                                Otro Monto
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center animate-fade-in max-w-sm mx-auto">
                        <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg shadow-emerald-500/20">
                            <span className="material-symbols-outlined text-2xl font-black">verified_user</span>
                        </div>
                        <h4 className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-1">¡Cuentas al Día!</h4>
                        <p className="text-white/40 text-[10px] font-medium leading-relaxed">
                            No existen deudas pendientes con este integrante.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettlementStation;
