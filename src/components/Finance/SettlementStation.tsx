
import { useState, memo } from 'react';

// Type definitions (Simplified/Copied from Finance.tsx or inferred)
interface SettlementStationProps {
    activeLedger: any; // Musician & Finance Data
    stats: any;
    // State & Setters Passed from Parent
    activeTab: 'pending' | 'history' | 'all';
    setActiveTab: (tab: 'pending' | 'history' | 'all') => void;
    filteredHistory: any[];

    // Modal Controls
    handleSettleDebt: (method: 'efectivo' | 'transferencia') => void;

    // Payment Modal Triggers
    setPaymentMusicianId: (id: string) => void;
    setShowPaymentModal: (show: boolean) => void;

    // Selection Logic
    selectedItems: Set<string>;
    handleToggleSelect: (id: string) => void;
    selectedTotal: number;

    // Deletion Logic
    handleDeleteClick: (id: string, e: any) => void;

    // Mobile Specifics
    onClose?: () => void;
    isMobileOverlay?: boolean;
}

// Memoized Item Component for Performance
const TransactionItem = memo(({
    item,
    isSelected,
    handleToggleSelect,
    setExpandedPaymentId,
    expandedPaymentId,
    handleDeleteClick,
    paidAmount
}: {
    item: any,
    isSelected: boolean,
    handleToggleSelect: (id: string) => void,
    setExpandedPaymentId: (cb: (prev: string | null) => string | null) => void,
    expandedPaymentId: string | null,
    handleDeleteClick: (id: string, e: any) => void,
    paidAmount: number
}) => {
    // Logic extraction
    const status = item.type === 'earning' ? item.status : null;
    const isPaid = status === 'paid';
    const isPartial = status === 'partial';
    const isExpanded = expandedPaymentId === item.id;

    return (
        <div>
            <div
                onClick={() => {
                    if (item.type === 'earning') {
                        if (!isPaid) handleToggleSelect(item.id);
                    } else {
                        setExpandedPaymentId((prev: string | null) => prev === item.id ? null : item.id);
                    }
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer relative overflow-hidden group will-change-transform transition-colors duration-75 ${item.type === 'earning'
                    ? isPaid
                        ? 'bg-slate-800/50 border-slate-800 opacity-50 grayscale'
                        : isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/20 shadow-none'
                            : 'bg-transparent border-slate-800 hover:bg-slate-800'
                    : 'bg-transparent border-slate-800 hover:bg-slate-800'
                    }`}
            >
                {/* Selection Checkbox */}
                {item.type === 'earning' && (
                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${isPaid
                        ? 'border-white/10 bg-white/5'
                        : isSelected
                            ? 'bg-black border-black'
                            : 'border-white/20 hover:border-white/40'
                        }`}>
                        {isPaid
                            ? <span className="material-symbols-outlined text-slate-600 text-sm">lock</span>
                            : isSelected && <span className="material-symbols-outlined text-indigo-400 text-sm font-bold">check</span>
                        }
                    </div>
                )}

                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'earning'
                    ? 'bg-teal-500/10 text-teal-400'
                    : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                    <span className="material-symbols-outlined text-lg">{item.type === 'earning' ? 'event' : 'payments'}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate flex items-center gap-2 ${isSelected && item.type === 'earning' ? 'text-indigo-100' : 'text-slate-200'}`}>
                        {item.title}
                        {isPartial && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">PARCIAL</span>}
                    </div>
                    <div className={`text-xs ${isSelected && item.type === 'earning' ? 'text-indigo-300/70' : 'text-slate-500'}`}>{item.date}</div>
                </div>

                <div className="text-right">
                    <div className={`font-bold ${isSelected && item.type === 'earning'
                        ? 'text-indigo-200'
                        : item.type === 'earning'
                            ? 'text-teal-400'
                            : 'text-indigo-400'
                        }`}>
                        {item.type === 'earning' ? '+' : ''}{item.amount}
                    </div>
                    {isPartial && <div className="text-[10px] text-indigo-400/70">Restan: {item.amount - paidAmount}</div>}
                </div>

                {/* Delete Button */}
                {item.type === 'payment' && (
                    <button onClick={(e) => handleDeleteClick(item.id, e)} className="text-gray-600 hover:text-red-500 transition-colors pl-2">
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                )}
            </div>

            {/* Drilldown Info */}
            {item.type === 'payment' && isExpanded && (
                <div className="ml-14 mr-4 mb-4 bg-white/5 rounded-b-xl border-x border-b border-white/5 text-sm animate-in slide-in-from-top-2 overflow-hidden">
                    {item.coveredEvents && item.coveredEvents.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            <div className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-wider bg-black/20">Eventos Cubiertos</div>
                            {item.coveredEvents.map((evt: any, eIdx: number) => (
                                <div key={eIdx} className="p-3 flex items-center gap-3 hover:bg-white/5">
                                    <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"><span className="material-symbols-outlined text-sm">lock</span></div>
                                    <div className="flex-1 min-w-0"><div className="text-white text-xs font-bold truncate">{evt.title}</div><div className="text-[10px] text-gray-500">{evt.date}</div></div>
                                    <div className="text-right"><div className="text-xs font-bold text-yellow-500">{evt.coveredAmount} Bs</div></div>
                                </div>
                            ))}
                            {item.raw?.notas && <div className="p-3 bg-black/20 text-xs italic text-gray-500 border-t border-white/5">📝 "{item.raw.notas}"</div>}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 italic">Sin desglose.{item.raw?.notas && <div className="mt-1 text-white opacity-60">"{item.raw.notas}"</div>}</div>
                    )}
                </div>
            )}
        </div>
    );
});

export const SettlementStation = ({
    activeLedger,
    activeTab,
    setActiveTab,
    filteredHistory,
    handleSettleDebt,
    setPaymentMusicianId,
    setShowPaymentModal,
    selectedItems,
    handleToggleSelect,
    selectedTotal,
    handleDeleteClick,
    onClose,
    isMobileOverlay = false
}: SettlementStationProps) => {

    const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-full md:rounded-3xl border-none md:border md:border-white/5 shadow-2xl relative overflow-hidden min-h-0 w-full bg-[#050505]/80 backdrop-blur-xl transition-all duration-500 group">

            {/* Station Header (Musician Info) - Transparent Background */}
            <div className="p-6 border-b border-white/5 flex items-center gap-5 relative z-10 bg-transparent shrink-0">
                {/* Back Button (Mobile Only) */}
                {isMobileOverlay && (
                    <button
                        onClick={onClose}
                        className="md:hidden size-10 flex items-center justify-center rounded-full bg-white/5 text-white active:scale-95 transition-transform z-10 hover:bg-white/10 ring-1 ring-white/10"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}

                <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30 z-10 ring-4 ring-black/40">
                    {activeLedger.nombre.charAt(0)}
                </div>
                <div className="flex-1 z-10">
                    <h2 className="text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">{activeLedger.nombre}</h2>
                    <p className="text-indigo-200/60 text-sm font-medium mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {activeLedger.apellido || 'Musico'}
                    </p>
                </div>
                <div className="text-right z-10">
                    <div className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest mb-1">Deuda Total</div>
                    <div className={`text-4xl font-black tracking-tighter drop-shadow-lg ${activeLedger.balance > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {activeLedger.balance} <span className="text-sm font-bold text-gray-500">Bs</span>
                    </div>
                </div>
            </div>

            {/* Ledger Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar pb-20">
                {/* TABS */}
                <div className="flex items-center gap-2 mb-6 bg-black/60 backdrop-blur-sm p-1 rounded-xl border border-white/10">
                    <button onClick={() => setActiveTab('pending')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-150 will-change-transform ${activeTab === 'pending'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}>Por Pagar</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-150 will-change-transform ${activeTab === 'history'
                        ? 'bg-slate-800 text-teal-400 border border-slate-700'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}>Historial</button>
                    <button onClick={() => setActiveTab('all')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-150 ${activeTab === 'all'
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}>Todo</button>
                </div>

                {filteredHistory.length === 0 ? (
                    <div className="text-center py-10 text-gray-600">
                        {activeTab === 'pending' ? '✅ Todo pagado' : 'Sin movimientos'}
                    </div>
                ) : (
                    filteredHistory.map((item, idx) => (
                        <TransactionItem
                            key={`${item.type}-${item.id}-${idx}`}
                            item={item}
                            isSelected={selectedItems.has(item.id)}
                            handleToggleSelect={handleToggleSelect}
                            setExpandedPaymentId={setExpandedPaymentId}
                            expandedPaymentId={expandedPaymentId}
                            handleDeleteClick={handleDeleteClick}
                            paidAmount={item.type === 'earning' ? item.paidAmount : 0}
                        />
                    ))
                )}
            </div>

            {/* ACTION BAR */}
            <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-xl pb-20 md:pb-6">
                {activeLedger.balance > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleSettleDebt('efectivo')} className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 will-change-transform group border border-emerald-400/20">
                            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">payments</span>
                            <div className="text-left leading-none">
                                <div className="text-xs opacity-90 uppercase tracking-wide font-semibold text-emerald-100">{selectedItems.size > 0 ? `Pagar Selección (${selectedItems.size})` : 'Pagar Todo en Efectivo'}</div>
                                <div className="text-xl drop-shadow-md">Liquidar {selectedItems.size > 0 ? selectedTotal : activeLedger.balance} Bs</div>
                            </div>
                        </button>
                        <button onClick={() => handleSettleDebt('transferencia')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all">QR / Banco</button>
                        <button onClick={() => { setPaymentMusicianId(activeLedger.id); setShowPaymentModal(true); }} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all">Otro Monto</button>
                    </div>
                ) : (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                        <div className="text-emerald-400 font-bold mb-1">¡Cuentas Saldadas! 🎉</div>
                        <p className="text-xs text-gray-400">Todo está al día con {activeLedger.nombre}.</p>
                        <button onClick={() => { setPaymentMusicianId(activeLedger.id); setShowPaymentModal(true); }} className="mt-3 text-xs text-emerald-400 hover:text-white underline decoration-dashed">Dar Adelanto</button>
                    </div>
                )}
            </div>
        </div>
    );
};
