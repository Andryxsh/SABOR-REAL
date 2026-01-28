import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import StatCard from '@/presentation/components/ui/StatCard';
import DebtSelector from '@/presentation/features/finance/components/DebtSelector';
import SettlementStation from '@/presentation/features/finance/components/SettlementStation';
import TransactionList from '@/presentation/features/finance/components/TransactionList';
import LiquidationModal from '@/presentation/features/finance/components/LiquidationModal';
import ExpenseModal from '@/presentation/features/finance/components/ExpenseModal';
import PaymentConfirmationModal from '@/presentation/features/finance/components/PaymentConfirmationModal';
import DeleteConfirmationModal from '@/presentation/features/finance/components/DeleteConfirmationModal';
import Skeleton from '@/presentation/components/ui/Skeleton';
import { useFinance } from '@/application/features/finance/hooks/useFinance';
// import { useApp } from '@/context/AppContext'; // REMOVED
import { useMusicianStore } from '@/application/store/useMusicianStore';

/**
 * Finance Page (v2) - High Fidelity Final Version
 */
const FinanceV2: React.FC = () => {
    const location = useLocation();
    const { musicians } = useMusicianStore();
    const {
        stats,
        debtors,
        upToDate,
        activeLedger,
        selectedMusicianId,
        setSelectedMusicianId,
        transactions,
        loading,
        selectedItems,
        handleToggleSelect,
        selectedTotal,
        addPayment,
        deletePayment,
        addExpense
    } = useFinance();

    // UI States
    const [isLiquidationModalOpen, setIsLiquidationModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // Workflow States (Confirmation)
    const [pendingSettle, setPendingSettle] = useState<{
        method: 'efectivo' | 'transferencia';
        amount: number;
        eventTitles: string[];
    } | null>(null);

    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Initial check for navigation state
    useEffect(() => {
        if (location.state?.openPaymentModal) {
            setIsLiquidationModalOpen(true);
            window.history.replaceState({}, document.title);
        }
        if (location.state?.openExpenseModal) {
            setIsExpenseModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // HANDLERS
    const handleSettleTrigger = useCallback((method: 'efectivo' | 'transferencia') => {
        if (!activeLedger) return;
        const amount = selectedItems.size > 0 ? selectedTotal : activeLedger.balance;

        // Prepare summary for confirmation
        const itemsToSettle = activeLedger.history
            .filter((i: any) => selectedItems.size > 0 ? selectedItems.has(i.id) : (i.type === 'earning' && i.status !== 'paid'))
            .map((i: any) => i.title);

        setPendingSettle({
            method,
            amount,
            eventTitles: itemsToSettle
        });
    }, [activeLedger, selectedItems, selectedTotal]);

    const executeSettle = async () => {
        if (!pendingSettle || !activeLedger) return;
        try {
            await addPayment({
                musicianId: activeLedger.id,
                monto: pendingSettle.amount,
                tipo: 'evento',
                fecha: new Date().toISOString().split('T')[0],
                metodoPago: pendingSettle.method,
                notas: selectedItems.size > 0 ? `Liquidación parcial de ${selectedItems.size} eventos` : 'Liquidación total de deuda'
            });
            setPendingSettle(null);
            // Selección se limpia automáticamente al refrescar el ledger si el hook es reactivo a payments
        } catch (error) {
            console.error(error);
            alert('Error al liquidar');
        }
    };

    const handleAddAdelanto = async (data: any) => {
        try {
            await addPayment({
                musicianId: data.musicianId,
                monto: data.amount,
                tipo: 'adelanto',
                fecha: new Date().toISOString().split('T')[0],
                metodoPago: data.method,
                notas: data.note || 'Adelanto manual'
            });
            setIsLiquidationModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Error al registrar adelanto');
        }
    };

    const handleDeleteTransaction = async () => {
        if (!itemToDelete) return;
        try {
            await deletePayment(itemToDelete);
            setItemToDelete(null);
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        }
    };

    // ... (Resto de imports)

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col h-full min-h-0 bg-transparent text-white relative font-sans p-6 overflow-hidden">
                    {/* Header Skeleton */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <Skeleton className="h-10 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-12 w-32 rounded-2xl" />
                    </div>

                    {/* StatCards Grid Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>

                    {/* Split Layout Skeleton */}
                    <div className="flex-1 min-h-0 flex gap-6 z-10 flex-col md:flex-row relative">
                        {/* Sidebar */}
                        <div className="w-full md:w-1/3 flex flex-col gap-6">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="h-20 w-full rounded-3xl" />
                                ))}
                            </div>
                        </div>
                        {/* Detail */}
                        <div className="hidden md:flex flex-1 min-h-0 bg-[#0a0a0a]/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden backdrop-blur-xl p-6">
                            <div className="flex flex-col w-full h-full gap-4">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex item-center gap-4">
                                        <Skeleton className="size-16 rounded-3xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-40" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-10 w-32" />
                                </div>
                                <div className="space-y-4 flex-1">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-24 w-full rounded-3xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full min-h-0 bg-transparent text-white relative font-sans">

                {/* 1. BACKGROUND EFFECTS */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                </div>

                {/* 2. HEADER & DASHBOARD */}
                <div className="flex-none p-4 sm:p-6 pb-2 z-10 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-1 flex items-center gap-3">
                                <span className="material-symbols-outlined text-4xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">account_balance_wallet</span>
                                Finanzas
                            </h1>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Power System v2 • Control & Liquidaciones</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setIsExpenseModalOpen(true)}
                                className="flex-1 sm:flex-none h-12 px-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 active:scale-95 transition-all text-rose-400 font-black uppercase tracking-widest text-[10px] shadow-lg"
                            >
                                <span className="material-symbols-outlined text-base mr-2 align-middle">remove_circle</span>
                                Nuevo Gasto
                            </button>
                        </div>
                    </div>

                    {/* DASHBOARD STATS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 sticky top-0 z-20">
                        <StatCard title="Recaudado" value={stats.totalIngresos} icon="trending_up" color="emerald" description="Ingresos Brutos" />
                        <StatCard title="Gastos" value={stats.totalGastos} icon="trending_down" color="rose" description="Salidas de Caja" />
                        <StatCard title="Deudas" value={stats.totalDeuda} icon="pending_actions" color="yellow" description="Pendiente de Pago" />
                        <StatCard title="Ganancia Neta" value={stats.balance} icon="account_balance_wallet" color={stats.balance >= 0 ? "blue" : "rose"} description="Saldo en Mano" />
                    </div>
                </div>

                {/* 3. MAIN CONTENT (Split Layout) */}
                <div className="flex-1 min-h-0 flex px-4 sm:px-6 pb-6 gap-6 z-10 flex-col md:flex-row relative">

                    {/* LEFT PANEL: Members List */}
                    <div className="w-full md:w-1/3 flex flex-col min-h-0 relative">
                        <DebtSelector
                            debtors={debtors}
                            upToDate={upToDate}
                            selectedId={selectedMusicianId}
                            totalDeuda={stats.totalDeuda}
                            onSelect={setSelectedMusicianId}
                        />
                    </div>

                    {/* RIGHT PANEL: Settlement vs Activity */}
                    <div className="hidden md:flex flex-1 min-h-0 bg-[#0a0a0a]/40 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        {activeLedger ? (
                            <SettlementStation
                                activeLedger={activeLedger}
                                stats={stats}
                                selectedItems={selectedItems}
                                handleToggleSelect={handleToggleSelect}
                                selectedTotal={selectedTotal}
                                onSettle={handleSettleTrigger}
                                onDelete={(id) => setItemToDelete(id)}
                                onErrorMonto={() => setIsLiquidationModalOpen(true)}
                                onClose={() => setSelectedMusicianId(null)}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0 relative">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Movimientos Recientes</h3>
                                    <span className="material-symbols-outlined text-white/10">history</span>
                                </div>
                                <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                                    <TransactionList transactions={transactions} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. MOBILE OVERLAY */}
                {selectedMusicianId && activeLedger && (
                    <div className="fixed inset-0 z-[100] bg-black/90 md:hidden animate-fade-in">
                        <SettlementStation
                            activeLedger={activeLedger}
                            stats={stats}
                            selectedItems={selectedItems}
                            handleToggleSelect={handleToggleSelect}
                            selectedTotal={selectedTotal}
                            onSettle={handleSettleTrigger}
                            onDelete={(id) => setItemToDelete(id)}
                            onErrorMonto={() => setIsLiquidationModalOpen(true)}
                            onClose={() => setSelectedMusicianId(null)}
                        />
                    </div>
                )}
            </div>

            {/* MODALS WORKFLOW */}
            <LiquidationModal
                isOpen={isLiquidationModalOpen}
                onClose={() => setIsLiquidationModalOpen(false)}
                musicians={musicians}
                onSubmit={handleAddAdelanto}
                initialMusicianId={selectedMusicianId || undefined}
            />

            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSubmit={data => addExpense({
                    concepto: data.concepto,
                    monto: data.monto,
                    categoria: data.categoria as any,
                    notas: data.notas,
                    fecha: new Date().toISOString().split('T')[0]
                }).then(() => setIsExpenseModalOpen(false))}
            />

            <PaymentConfirmationModal
                isOpen={!!pendingSettle}
                onClose={() => setPendingSettle(null)}
                onConfirm={executeSettle}
                data={{
                    musicianName: activeLedger ? `${activeLedger.nombre} ${activeLedger.apellido}` : '',
                    amount: pendingSettle?.amount || 0,
                    method: pendingSettle?.method || '',
                    eventTitles: pendingSettle?.eventTitles || []
                }}
            />

            <DeleteConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDeleteTransaction}
            />
        </MainLayout>
    );
};

export default FinanceV2;
