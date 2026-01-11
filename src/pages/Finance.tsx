import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { Expense } from '../context/AppContext';
import CustomSelect from '../components/CustomSelect';
import { SettlementStation } from '../components/Finance/SettlementStation';

export default function Finance() {
    const location = useLocation();
    const { events, musicians, payments, expenses, addPayment, deletePayment, addExpense, loading } = useApp();
    const { user } = useAuth(); // Get authenticated user

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    // Initial check for navigation state
    useEffect(() => {
        if (location.state?.openPaymentModal) {

            setShowPaymentModal(true);
            window.history.replaceState({}, document.title);
        }
        if (location.state?.openExpenseModal) {
            setShowExpenseModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Payment form
    const [paymentMusicianId, setPaymentMusicianId] = useState('');
    const [paymentMonto, setPaymentMonto] = useState('');
    const [paymentNotas, setPaymentNotas] = useState('');


    // Expense form
    const [expenseConcepto, setExpenseConcepto] = useState('');
    const [expenseMonto, setExpenseMonto] = useState('');
    const [expenseCategoria, setExpenseCategoria] = useState<Expense['categoria']>('transporte');
    const [expenseNotas, setExpenseNotas] = useState('');

    // ===========================================
    // FINANCE 2.0: SMART LEDGER LOGIC
    // ===========================================
    const ledger = useMemo(() => {
        return musicians.map(musician => {
            // 1. Calculate Earnings (Asistio = true)
            // Sort Chronologically (Oldest First) for Allocation
            const earnings = events
                .flatMap(e => {
                    const participation = e.musicosAsignados?.find(m => m.musicianId === musician.id && m.asistio);
                    if (!participation) return [];
                    return [{
                        id: e.id,
                        title: e.title,
                        date: e.date,
                        amount: participation.montoPagar,
                        type: 'earning' as const,
                        // Status will be calculated below
                        status: 'unpaid' as 'paid' | 'partial' | 'unpaid',
                        paidAmount: 0
                    }];
                })
                .sort((a, b) => new Date(a.date).getTime() - b.date.localeCompare(a.date)); // Sort Oldest First

            // 2. Calculate Payments
            const musicianPayments = payments
                .filter(p => p.musicianId === musician.id)
                .map(p => ({
                    id: p.id,
                    title: `Pago: ${p.tipo}`,
                    date: p.fecha,
                    amount: -p.monto, // Negative for calculation
                    type: 'payment' as const,
                    raw: p
                }));

            // 3. FIFO Allocation Simulation (Deep Traceability)
            // We simulate the payments flow to link specific payments to specific earnings.

            // A. Create working copy of earnings with 'remaining' balance
            let earningsQueue = earnings.map(e => ({ ...e, remaining: e.amount }));

            // B. Sort payments chronologically (Oldest First) for allocation
            const cronologicalPayments = [...musicianPayments].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            // C. Process each payment and allocate to oldest unpaid earnings
            const processedPayments = cronologicalPayments.map(payment => {
                let paymentRemaining = Math.abs(payment.amount);
                const coveredEvents = [];

                for (const earning of earningsQueue) {
                    if (paymentRemaining <= 0.01) break; // Float tolerance
                    if (earning.remaining <= 0.01) continue; // Already paid

                    const allocation = Math.min(paymentRemaining, earning.remaining);

                    earning.remaining -= allocation;
                    paymentRemaining -= allocation;

                    coveredEvents.push({
                        id: earning.id,
                        title: earning.title,
                        date: earning.date,
                        totalAmount: earning.amount,
                        coveredAmount: allocation
                    });
                }

                return { ...payment, coveredEvents, type: 'payment' as const };
            });

            // D. Determine final status of Earnings based on remaining balance
            const processedEarnings = earningsQueue.map(e => {
                let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
                let paidAmount = e.amount - e.remaining;

                if (e.remaining <= 0.01) status = 'paid';
                else if (e.remaining < e.amount) status = 'partial';

                return {
                    id: e.id,
                    title: e.title,
                    date: e.date,
                    amount: e.amount,
                    type: 'earning' as const,
                    status,
                    paidAmount
                };
            });

            const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);
            const totalPaid = musicianPayments.reduce((sum, p) => sum + Math.abs(p.amount), 0);
            const balance = totalEarned - totalPaid;

            // Sort history: Newest first for Display (using processed items)
            const history = [...processedEarnings, ...processedPayments].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            return {
                ...musician,
                totalEarned,
                totalPaid,
                balance,
                history
            };
        }).sort((a, b) => b.balance - a.balance); // Sort by highest debt first
    }, [musicians, events, payments]);

    const debtors = useMemo(() => ledger.filter(l => l.balance > 0), [ledger]);
    const cleanMusicians = useMemo(() => ledger.filter(l => l.balance <= 0), [ledger]);

    const [selectedMusicianId, setSelectedMusicianId] = useState<string | null>(null);

    const activeLedger = useMemo(() =>
        selectedMusicianId ? ledger.find(l => l.id === selectedMusicianId) : null,
        [selectedMusicianId, ledger]);

    // FINANCE 3.0: Smart List State
    const [showAllMusicians, setShowAllMusicians] = useState(false);

    // SELECTABLE PAYMENTS STATE
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Clear selection when changing musician
    useEffect(() => {
        setSelectedItems(new Set());
    }, [selectedMusicianId]);

    const handleToggleSelect = useCallback((id: string) => {
        // Prevent selecting paid items (logic check, UI should also prevent)
        if (!activeLedger) return;
        const item = activeLedger.history.find((i: any) => i.id === id && i.type === 'earning');
        // @ts-ignore - status exists on earning items now
        if (item && item.status === 'paid') return;

        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, [activeLedger]);

    const selectedTotal = useMemo(() => {
        if (!activeLedger) return 0;
        return activeLedger.history
            .filter(item => selectedItems.has(item.id) && item.type === 'earning')
            .reduce((sum, item) => {
                // Use remaining amount if partial
                // @ts-ignore
                const remaining = item.amount - (item.paidAmount || 0);
                return sum + remaining;
            }, 0);
    }, [activeLedger, selectedItems]);

    // Payment Drill-down State
    const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);

    // HISTORY TABS STATE
    const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'all'>('pending');

    // Reset tab to default when changing musician
    useEffect(() => {
        setActiveTab('pending');
    }, [selectedMusicianId]);

    const filteredHistory = useMemo(() => {
        if (!activeLedger) return [];
        return activeLedger.history.filter(item => {
            if (activeTab === 'all') return true;
            if (activeTab === 'pending') {
                // Show Unpaid or Partial Earnings
                // @ts-ignore
                return item.type === 'earning' && (item.status === 'unpaid' || item.status === 'partial');
            }
            if (activeTab === 'history') {
                // Show ONLY Payments (User wants to see events only inside the payment drill-down)
                // @ts-ignore
                return item.type === 'payment';
            }
            return true;
        });
    }, [activeLedger, activeTab]);

    // Delete Modal State
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    // Payment Confirmation Modal State
    const [pendingPayment, setPendingPayment] = useState<{
        musicianId: string;
        musicianName: string;
        amount: number;
        method: 'efectivo' | 'transferencia';
        note: string;
        isPartial: boolean;
        eventTitles: string[];
        payerName: string;
    } | null>(null);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setIdToDelete(id);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        try {
            await deletePayment(idToDelete);
            setIdToDelete(null);
        } catch (error) {
            console.error("Error deleting payment:", error);
            alert("Error al eliminar el pago");
        }
    };

    // Auto-select first debtor if none selected acting as "Inbox"
    useEffect(() => {
        if (!selectedMusicianId && debtors.length > 0) {
            // Optional: Auto-select? No, let user choose.
        }
    }, [debtors]);

    const stats = useMemo(() => {
        const totalIngresos = events
            .filter(e => e.status === 'Confirmado' || e.status === 'Finalizado')
            .reduce((sum, e) => sum + e.precio, 0);

        const totalGastos = expenses.reduce((sum, e) => sum + e.monto, 0);
        const totalPagos = payments.reduce((sum, p) => sum + p.monto, 0);
        const totalDeuda = debtors.reduce((sum, d) => sum + d.balance, 0);

        const balance = totalIngresos - totalGastos - totalPagos;

        return { totalIngresos, totalGastos, totalPagos, balance, totalDeuda };
    }, [events, expenses, payments, debtors]);

    const handleAddPayment = async () => {
        if (!paymentMusicianId || !paymentMonto) {
            alert('Por favor completa músico y monto');
            return;
        }

        const amount = parseFloat(paymentMonto);
        if (isNaN(amount) || amount <= 0) {
            alert('Monto inválido');
            return;
        }

        try {
            const newPayment: any = {
                musicianId: paymentMusicianId,
                monto: amount,
                tipo: 'adelanto', // Hardcoded per user request
                fecha: new Date().toISOString().split('T')[0],
                metodoPago: 'efectivo', // Hardcoded per user request
            };

            if (paymentNotas) newPayment.notas = paymentNotas;

            await addPayment(newPayment);

            setShowPaymentModal(false);
            setPaymentMusicianId('');
            setPaymentMonto('');
            setPaymentNotas('');
        } catch (error) {
            console.error(error);
            alert('Error al registrar pago');
        }
    };

    const handleAddExpense = async () => {
        if (!expenseConcepto || !expenseMonto) {
            alert('Por favor completa concepto y monto');
            return;
        }

        try {
            const newExpense: any = {
                concepto: expenseConcepto,
                monto: parseFloat(expenseMonto),
                categoria: expenseCategoria,
                fecha: new Date().toISOString().split('T')[0],
            };

            if (expenseNotas) newExpense.notas = expenseNotas;

            await addExpense(newExpense);

            setShowExpenseModal(false);
            setExpenseConcepto('');
            setExpenseMonto('');
            setExpenseCategoria('transporte');
            setExpenseNotas('');
        } catch (error) {
            console.error(error);
            alert('Error al registrar gasto');
        }
    };

    const handleSettleDebt = async (method: 'efectivo' | 'transferencia') => {
        if (!activeLedger) return;

        // LOGIC: Use selected amount if selection exists, otherwise full balance
        const isPartial = selectedItems.size > 0;
        const amountToPay = isPartial ? selectedTotal : activeLedger.balance;

        if (amountToPay <= 0) return;

        // Auto-generate note for selection
        let paymentNote = 'Liquidación de Saldo Pendiente';
        let eventTitles: string[] = ['Liquidación de Saldo Total'];

        if (isPartial) {
            eventTitles = activeLedger.history
                .filter(i => selectedItems.has(i.id))
                .map(i => i.title);
            paymentNote = `Pago por: ${eventTitles.join(', ')}`;
        }

        // TRIGGER CUSTOM MODAL INSTEAD OF WINDOW.CONFIRM
        const payerName = user?.displayName || user?.email?.split('@')[0] || 'Admin';

        setPendingPayment({
            musicianId: activeLedger.id,
            musicianName: `${activeLedger.nombre} ${activeLedger.apellido}`,
            amount: amountToPay,
            method: method,
            note: paymentNote,
            isPartial: isPartial,
            eventTitles: eventTitles,
            payerName: payerName.charAt(0).toUpperCase() + payerName.slice(1) // Capitalize
        });
    };

    const executePayment = async () => {
        if (!pendingPayment) return;

        try {
            await addPayment({
                musicianId: pendingPayment.musicianId,
                monto: pendingPayment.amount,
                tipo: 'evento',
                fecha: new Date().toISOString().split('T')[0],
                metodoPago: pendingPayment.method,
                notas: pendingPayment.note
            });
            // Clear selection after payment
            setSelectedItems(new Set());
            setPendingPayment(null); // Close Modal
        } catch (error) {
            console.error(error);
            alert('Error al liquidar');
        }
    };

    // Mobile support: If checking legacy "All Transactions", show simple view?
    // Start with the Split Layout
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full min-h-0 bg-transparent text-white relative overflow-hidden font-sans">
                {/* Background Effects - Neon Theme (Restored & Enhanced) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    {/* Neon Sky blob */}
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px]"></div>
                    {/* Neon Rose blob */}
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]"></div>
                    {/* Neon Emerald blob */}
                    <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                </div>

                {/* HEADER & DASHBOARD (Fixed Top) */}
                <div className="flex-none p-4 sm:p-6 pb-2 z-10 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl sm:text-4xl text-yellow-500">account_balance_wallet</span>
                                Finanzas
                            </h1>
                            <p className="text-gray-400 text-sm font-medium pl-1">Control & Liquidaciones</p>
                        </div>
                        {/* Global Actions */}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setShowExpenseModal(true)}
                                className="flex-1 sm:flex-none h-12 px-4 sm:px-6 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 text-rose-400 font-bold shadow-sm md:w-48"
                            >
                                <span className="material-symbols-outlined">trending_down</span>
                                <span className="text-sm">Nuevo Gasto</span>
                            </button>
                        </div>
                    </div>

                    {/* EXECUTIVE DASHBOARD CARDS (Scrollable on mobile) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-2 overflow-x-auto pb-2 sm:pb-0 snap-x">
                        {/* 1. Ingresos - Neon Green */}
                        <div className="snap-center min-w-[160px] relative overflow-hidden rounded-3xl p-5 bg-black/40 border border-white/5 hover:border-teal-500/30 backdrop-blur-sm transition-all group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-4 right-4 p-2 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 rounded-xl text-teal-400 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                                <span className="material-symbols-outlined text-2xl">trending_up</span>
                            </div>
                            <div className="mt-8 relative z-10">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-teal-400"></span> Recaudado
                                </div>
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 tracking-tight">{stats.totalIngresos.toFixed(0)}</div>
                                <div className="text-[10px] text-gray-500 font-medium tracking-wide mt-1 uppercase">Total Ingresos</div>
                            </div>
                        </div>

                        {/* 2. Egresos - Neon Magenta */}
                        <div className="snap-center min-w-[160px] relative overflow-hidden rounded-3xl p-5 bg-black/40 border border-white/5 hover:border-rose-500/30 backdrop-blur-sm transition-all group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-4 right-4 p-2 bg-gradient-to-br from-rose-500/20 to-pink-500/10 rounded-xl text-rose-400 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                                <span className="material-symbols-outlined text-2xl">trending_down</span>
                            </div>
                            <div className="mt-8 relative z-10">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-rose-400"></span> Gastos
                                </div>
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400 tracking-tight">{stats.totalGastos.toFixed(0)}</div>
                                <div className="text-[10px] text-gray-500 font-medium tracking-wide mt-1 uppercase">Total Salidas</div>
                            </div>
                        </div>

                        {/* 3. Deudas - Neon Yellow */}
                        <div className="snap-center min-w-[160px] relative overflow-hidden rounded-3xl p-5 bg-black/40 border border-white/5 hover:border-yellow-500/30 backdrop-blur-sm transition-all group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-4 right-4 p-2 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                                <span className="material-symbols-outlined text-2xl">pending_actions</span>
                            </div>
                            <div className="mt-8 relative z-10">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-yellow-400"></span> Deudas
                                </div>
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400 tracking-tight">{stats.totalDeuda.toFixed(0)}</div>
                                <div className="text-[10px] text-gray-500 font-medium tracking-wide mt-1 uppercase">Por Pagar</div>
                            </div>
                        </div>

                        {/* 4. Balance - Dynamic Neon */}
                        <div className={`snap-center min-w-[160px] relative overflow-hidden rounded-3xl p-5 bg-black/40 border border-white/5 backdrop-blur-sm transition-all group hover:border-white/10`}>
                            <div className={`absolute top-4 right-4 p-2 rounded-full ${stats.balance >= 0 ? 'bg-teal-500/10 text-teal-400' : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                            </div>
                            <div className="mt-8 relative z-10">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ganancia Neta</div>
                                <div className={`text-3xl font-bold tracking-tight ${stats.balance >= 0 ? 'text-teal-400' : 'text-rose-400'
                                    }`}>{stats.balance.toFixed(0)}</div>
                                <div className="text-[10px] text-gray-500 font-medium tracking-wide mt-1 uppercase">Balance Neto</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID (Scrollable Area) */}
                <div className="flex-1 min-h-0 flex px-4 sm:px-6 pb-6 gap-6 z-10 flex-col md:flex-row relative">
                    {/* LEFT: DEBTORS LIST (Smart List) */}
                    <div className="w-full md:w-1/3 flex flex-col min-h-0 relative z-10 transition-all">
                        {/* Standalone Title (Unboxed & Enhanced) */}
                        <div className="px-2 pb-4 pt-2 flex justify-between items-end shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight drop-shadow-md">
                                    <span className="material-symbols-outlined text-yellow-400 text-3xl animate-pulse" style={{ animationDuration: '3s' }}>groups</span>
                                    Equipo <span className="text-white/50 text-lg font-bold">(Deudas)</span>
                                </h2>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-[10px] text-yellow-400/80 font-bold uppercase tracking-widest mb-0.5">Total Por Pagar</div>
                                <div className="text-xl font-black text-yellow-400 tracking-tight drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                                    {stats.totalDeuda} <span className="text-sm text-yellow-500/70 font-bold">Bs</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 space-y-2">
                            {/* DEBTORS SECTION */}
                            {debtors
                                .slice(0, showAllMusicians ? undefined : 5)
                                .map(musician => (
                                    <div
                                        key={musician.id}
                                        onClick={() => setSelectedMusicianId(musician.id)}
                                        className={`p-4 rounded-3xl cursor-pointer border relative overflow-hidden group will-change-transform transition-all duration-300 ${selectedMusicianId === musician.id
                                            ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] backdrop-blur-xl'
                                            : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20 backdrop-blur-md hover:shadow-lg hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm transition-all duration-300 ${selectedMusicianId === musician.id
                                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-110 shadow-indigo-500/30'
                                                    : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                                                    }`}>
                                                    {musician.nombre.charAt(0)}{musician.apellido?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={`font-bold leading-tight transition-colors ${selectedMusicianId === musician.id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                                        {musician.nombre} {musician.apellido}
                                                    </div>
                                                    <div className={`text-xs mt-1 font-medium flex items-center gap-1 ${selectedMusicianId === musician.id ? 'text-indigo-300' : 'text-yellow-400/90'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-[12px] filled">payments</span>
                                                        Grupo Debe: <span className="font-bold">{musician.balance}</span> Bs
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`size-8 rounded-full flex items-center justify-center border transition-all ${selectedMusicianId === musician.id
                                                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 rotate-90 '
                                                : 'border-white/5 text-gray-600 group-hover:border-white/20 group-hover:text-white'
                                                }`}>
                                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {/* SHOW ALL BUTTON */}
                            {!showAllMusicians && debtors.length > 5 && (
                                <button
                                    onClick={() => setShowAllMusicians(true)}
                                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Ver {debtors.length - 5} más
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                            )}

                            {(showAllMusicians || debtors.length === 0) && (
                                <>
                                    {debtors.length > 0 && <div className="h-px bg-white/5 my-4 mx-2"></div>}
                                    {cleanMusicians.length > 0 && (
                                        <div className="px-2 py-1 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Sin Deuda</div>
                                    )}
                                    {cleanMusicians.map(musician => (
                                        <div
                                            key={musician.id}
                                            onClick={() => setSelectedMusicianId(musician.id)}
                                            className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between group ${selectedMusicianId === musician.id
                                                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'
                                                : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-xs">
                                                    {musician.nombre.charAt(0)}{musician.apellido?.charAt(0)}
                                                </div>
                                                <span className="font-medium text-sm">{musician.nombre} {musician.apellido}</span>
                                            </div>
                                            {selectedMusicianId === musician.id && <span className="material-symbols-outlined text-sm">check_circle</span>}
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* COLLAPSE BUTTON */}
                            {showAllMusicians && debtors.length > 5 && (
                                <button
                                    onClick={() => setShowAllMusicians(false)}
                                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    Colapsar Lista
                                    <span className="material-symbols-outlined text-sm">expand_less</span>
                                </button>
                            )}
                        </div>
                    </div>





                    {!selectedMusicianId ? (
                        <div className="hidden">
                            {/* Empty State Removed */}
                        </div>
                    ) : (
                        activeLedger && (
                            <>
                                {/* Station Header */}
                                <div className="p-6 border-b border-white/5 bg-black/40 flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedMusicianId(null)}
                                        className="md:hidden size-10 flex items-center justify-center rounded-full bg-white/5 text-white active:scale-95 transition-transform"
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                    <div className="size-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-yellow-500/20">
                                        {activeLedger.nombre.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white leading-none">{activeLedger.nombre} {activeLedger.apellido}</h2>
                                        <p className="text-gray-400 text-sm mt-1 capitalize">{activeLedger.role}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total a Pagar</div>
                                        <div className={`text-3xl font-black ${activeLedger.balance > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                            {activeLedger.balance} <span className="text-base font-bold text-gray-500">Bs</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ledger Feed (The "WHY") */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20 pb-20">

                                    {/* TABS HEADER */}
                                    <div className="flex items-center gap-2 mb-6 bg-black/40 p-1 rounded-xl">
                                        <button
                                            onClick={() => setActiveTab('pending')}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'pending'
                                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            Por Pagar
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('history')}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'history'
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            Historial
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('all')}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'all'
                                                ? 'bg-white/10 text-white'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            Todo
                                        </button>
                                    </div>

                                    {filteredHistory.length === 0 ? (
                                        <div className="text-center py-10 text-gray-600">
                                            {activeTab === 'pending' ? '✅ Todo pagado' : 'Sin movimientos'}
                                        </div>
                                    ) : (
                                        filteredHistory.map((item, idx) => {
                                            // Extract status safely
                                            // @ts-ignore
                                            const status = item.type === 'earning' ? item.status : null;
                                            // @ts-ignore
                                            const paidAmount = item.type === 'earning' ? item.paidAmount : 0;
                                            const isPaid = status === 'paid';
                                            const isPartial = status === 'partial';

                                            return (
                                                <div key={`${item.type}-${item.id}-${idx}`}>
                                                    <div
                                                        onClick={() => {
                                                            if (item.type === 'earning') {
                                                                if (!isPaid) handleToggleSelect(item.id);
                                                            } else {
                                                                setExpandedPaymentId(prev => prev === item.id ? null : item.id);
                                                            }
                                                        }}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${item.type === 'earning'
                                                            ? isPaid
                                                                ? 'bg-white/5 border-white/5 opacity-50 grayscale' // PAID STYLE
                                                                : selectedItems.has(item.id)
                                                                    ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' // SELECTED
                                                                    : 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10' // UNPAID
                                                            : 'bg-red-500/5 border-red-500/10' // PAYMENT
                                                            }`}
                                                    >
                                                        {/* CHECKBOX Selection (Only for Earnings) */}
                                                        {item.type === 'earning' && (
                                                            <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${isPaid
                                                                ? 'border-white/10 bg-white/5'
                                                                : selectedItems.has(item.id)
                                                                    ? 'bg-yellow-500 border-yellow-500'
                                                                    : 'border-white/20 hover:border-white/40'
                                                                }`}>
                                                                {isPaid ? (
                                                                    <span className="material-symbols-outlined text-white/30 text-sm">lock</span>
                                                                ) : selectedItems.has(item.id) && (
                                                                    <span className="material-symbols-outlined text-black text-sm font-bold">check</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'earning' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                            <span className="material-symbols-outlined text-lg">
                                                                {item.type === 'earning' ? 'event' : 'payments'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-white font-bold text-sm truncate flex items-center gap-2">
                                                                {item.title}
                                                                {isPartial && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">PARCIAL</span>}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{item.date}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`font-bold ${item.type === 'earning' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                {item.type === 'earning' ? '+' : ''}{item.amount}
                                                            </div>
                                                            {isPartial && (
                                                                <div className="text-[10px] text-yellow-500">
                                                                    Restan: {item.amount - paidAmount}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Delete Button for Payment */}
                                                        {item.type === 'payment' && (
                                                            <button
                                                                onClick={(e) => handleDeleteClick(item.id, e)}
                                                                className="text-gray-600 hover:text-red-500 transition-colors pl-2"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* PAYMENT DRILL-DOWN (SUB-LIST) */}
                                                    {item.type === 'payment' && expandedPaymentId === item.id && (
                                                        <div className="ml-14 mr-4 mb-4 bg-white/5 rounded-b-xl border-x border-b border-white/5 text-sm animate-in slide-in-from-top-2 overflow-hidden">
                                                            {/* @ts-ignore */}
                                                            {item.coveredEvents && item.coveredEvents.length > 0 ? (
                                                                <div className="divide-y divide-white/5">
                                                                    <div className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-wider bg-black/20">
                                                                        Eventos Cubiertos
                                                                    </div>
                                                                    {/* @ts-ignore */}
                                                                    {item.coveredEvents.map((evt, eIdx) => (
                                                                        <div key={eIdx} className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                                                            <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                                                                <span className="material-symbols-outlined text-sm">lock</span>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="text-white text-xs font-bold truncate">{evt.title}</div>
                                                                                <div className="text-[10px] text-gray-500">{evt.date}</div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="text-xs font-bold text-yellow-500">
                                                                                    {evt.coveredAmount} Bs
                                                                                </div>
                                                                                {evt.coveredAmount < evt.totalAmount && (
                                                                                    <div className="text-[9px] text-gray-500">
                                                                                        De {evt.totalAmount}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {item.raw?.notas && (
                                                                        <div className="p-3 bg-black/20 text-xs italic text-gray-500 border-t border-white/5">
                                                                            📝 "{item.raw.notas}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 text-center text-gray-500 italic">
                                                                    Sin desglose de eventos (Pago manual o anterior).
                                                                    {item.raw?.notas && <div className="mt-1 text-white opacity-60">"{item.raw.notas}"</div>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Action Bar / Settlement Controls */}
                                <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-xl pb-20">
                                    {activeLedger.balance > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleSettleDebt('efectivo')}
                                                className="col-span-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl shadow-lg shadow-yellow-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                <span className="material-symbols-outlined">payments</span>
                                                <div className="text-left leading-none">
                                                    <div className="text-xs opacity-70 uppercase tracking-wide">
                                                        {selectedItems.size > 0 ? `Pagar Selección (${selectedItems.size})` : 'Pagar Todo en Efectivo'}
                                                    </div>
                                                    <div className="text-lg">
                                                        Liquidar {selectedItems.size > 0 ? selectedTotal : activeLedger.balance} Bs
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => handleSettleDebt('transferencia')}
                                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all"
                                            >
                                                QR / Banco
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setPaymentMusicianId(activeLedger.id);

                                                    setShowPaymentModal(true);
                                                }}
                                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all"
                                            >
                                                Otro Monto
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                            <div className="text-emerald-400 font-bold mb-1">¡Cuentas Saldadas! 🎉</div>
                                            <p className="text-xs text-gray-400">Todo está al día con {activeLedger.nombre}.</p>
                                            <button
                                                onClick={() => {
                                                    setPaymentMusicianId(activeLedger.id);

                                                    setShowPaymentModal(true);
                                                }}
                                                className="mt-3 text-xs text-emerald-400 hover:text-white underline decoration-dashed"
                                            >
                                                Dar Adelanto
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )
                    )}


                    {/* DELETE CONFIRMATION MODAL */}
                    {
                        idToDelete && createPortal(
                            <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4">
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIdToDelete(null)}></div>
                                <div className="relative w-full sm:max-w-sm bg-[#1a1a1a] sm:rounded-3xl rounded-t-3xl border border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
                                    <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                                        <span className="material-symbols-outlined text-3xl">delete_forever</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white text-center mb-2">¿Eliminar Pago?</h3>
                                    <p className="text-gray-400 text-center text-sm mb-6">
                                        Esta acción eliminará el registro del pago y aumentará la deuda del músico. No se puede deshacer.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setIdToDelete(null)}
                                            className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                        >
                                            Sí, Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )
                    }

                    {/* PAYMENT CONFIRMATION MODAL */}
                    {
                        pendingPayment && createPortal(
                            <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4">
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPendingPayment(null)}></div>
                                <div className="relative w-full sm:max-w-sm bg-[#1a1a1a] sm:rounded-3xl rounded-t-3xl border border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
                                    <div className={`size-16 rounded-full flex items-center justify-center mx-auto mb-4 ${pendingPayment.method === 'efectivo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {pendingPayment.method === 'efectivo' ? 'payments' : 'account_balance'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white text-center mb-1">Confirmar Pago</h3>
                                    <p className="text-gray-400 text-center text-sm mb-6 uppercase tracking-wider font-bold">
                                        {pendingPayment.method}
                                    </p>

                                    <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3 border border-white/5">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Músico</span>
                                            <span className="text-white font-bold">{pendingPayment.musicianName}</span>
                                        </div>

                                        <div className="border-t border-white/5 pt-2 mt-2">
                                            <span className="text-gray-400 text-xs block mb-1">Concepto</span>
                                            <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-1">
                                                {pendingPayment.eventTitles.map((title, idx) => (
                                                    <div key={idx} className="text-white/80 text-xs font-medium flex items-center gap-2">
                                                        <span className="text-yellow-500">•</span> {title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 pt-2 mt-2 flex justify-between items-center text-xs">
                                            <span className="text-gray-400">Pagado por</span>
                                            <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                                                {pendingPayment.payerName}
                                            </span>
                                        </div>

                                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                            <span className="text-gray-400">Total a Pagar</span>
                                            <span className="text-2xl font-black text-yellow-400">{pendingPayment.amount} Bs</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPendingPayment(null)}
                                            className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={executePayment}
                                            className={`py-3 rounded-xl text-black font-bold shadow-lg transition-all active:scale-95 ${pendingPayment.method === 'efectivo'
                                                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                                                : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/20'
                                                }`}
                                        >
                                            Confirmar Pago
                                        </button>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )
                    }

                    {/* Expense Modal */}
                    {
                        showExpenseModal && createPortal(
                            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
                                <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up will-change-transform">
                                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-red-500">remove_circle</span>
                                            Registrar Gasto
                                        </h2>
                                        <button
                                            onClick={() => setShowExpenseModal(false)}
                                            className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>

                                    <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                        <div>
                                            <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">CONCEPTO *</label>
                                            <input
                                                type="text"
                                                value={expenseConcepto}
                                                onChange={(e) => setExpenseConcepto(e.target.value)}
                                                placeholder="Ej: Taxi, Comida..."
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/10"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">MONTO (BS) *</label>
                                                <input
                                                    type="number"
                                                    value={expenseMonto}
                                                    onChange={(e) => setExpenseMonto(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-red-400 font-bold placeholder-white/10 focus:outline-none focus:border-red-500/50 focus:bg-white/10"
                                                />
                                            </div>
                                            <div>
                                                <CustomSelect
                                                    label="CATEGORÍA"
                                                    value={expenseCategoria}
                                                    onChange={(val) => setExpenseCategoria(val as Expense['categoria'])}
                                                    options={[
                                                        { value: 'transporte', label: 'Transporte', subtitle: 'Taxi, Gasolina' },
                                                        { value: 'alimentacion', label: 'Alimentación', subtitle: 'Cena, Refrigerio' },
                                                        { value: 'equipo', label: 'Equipo', subtitle: 'Mantenimiento, Compra' },
                                                        { value: 'marketing', label: 'Marketing', subtitle: 'Publicidad' },
                                                        { value: 'administrativo', label: 'Administrativo', subtitle: 'Trámites' },
                                                        { value: 'otro', label: 'Otro', subtitle: 'Varios' }
                                                    ]}
                                                    icon="label"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">NOTAS</label>
                                            <textarea
                                                value={expenseNotas}
                                                onChange={(e) => setExpenseNotas(e.target.value)}
                                                placeholder="Detalles adicionales..."
                                                rows={2}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/10 resize-none"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <button
                                                onClick={handleAddExpense}
                                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                                <span className="material-symbols-outlined">save</span>
                                                Registrar Gasto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )
                    }

                    {/* Simplified Payment Modal ('Adelanto') */}
                    {
                        showPaymentModal && createPortal(
                            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
                                <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up will-change-transform">
                                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-emerald-400 text-xl">
                                                    payments
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-white leading-none">
                                                    Registrar Adelanto
                                                </h2>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    Pago a cuenta o anticipo
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>

                                    <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                        <div>
                                            <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">MÚSICO</label>
                                            <CustomSelect
                                                label="MÚSICO *"
                                                value={paymentMusicianId}
                                                onChange={setPaymentMusicianId}
                                                options={musicians.map(m => ({
                                                    value: m.id,
                                                    label: `${m.nombre} ${m.apellido || ''}`,
                                                    subtitle: m.role
                                                }))}
                                                placeholder="Seleccionar integrante..."
                                                icon="person"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">MONTO (BS) *</label>
                                            <input
                                                type="number"
                                                value={paymentMonto}
                                                onChange={(e) => setPaymentMonto(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-emerald-400 font-bold placeholder-white/10 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 text-2xl"
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">NOTAS (OPCIONAL)</label>
                                            <textarea
                                                value={paymentNotas}
                                                onChange={(e) => setPaymentNotas(e.target.value)}
                                                placeholder="Ej: Pago parcial por 1.5 eventos..."
                                                rows={2}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 resize-none"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <button
                                                onClick={handleAddPayment}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                                <span className="material-symbols-outlined">save</span>
                                                Guardar Adelanto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )
                    }


                </div>

                {/* DESKTOP RIGHT PANEL (Static Column) */}
                <div className="hidden md:flex w-2/3 flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden min-h-0">
                    {!selectedMusicianId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600/50 p-10">
                            {/* Empty State - Minimal/Hidden as requested */}
                        </div>
                    ) : (
                        activeLedger && (
                            <SettlementStation
                                activeLedger={activeLedger}
                                stats={stats}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                filteredHistory={filteredHistory}
                                handleSettleDebt={handleSettleDebt}
                                setPaymentMusicianId={setPaymentMusicianId}

                                setShowPaymentModal={setShowPaymentModal}
                                selectedItems={selectedItems}
                                handleToggleSelect={handleToggleSelect}
                                selectedTotal={selectedTotal}
                                handleDeleteClick={handleDeleteClick}
                                onClose={() => setSelectedMusicianId(null)}
                                isMobileOverlay={false}
                            />
                        )
                    )}
                </div>
            </div >

            {/* MOBILE OVERLAY PORTAL (Visible only on Mobile when selected) */}
            {
                selectedMusicianId && activeLedger && createPortal(
                    <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex flex-col md:hidden animate-slide-up">
                        <div className="flex-1 bg-slate-900 m-0 rounded-t-3xl overflow-hidden flex flex-col border-t border-slate-800 shadow-2xl">
                            <SettlementStation
                                activeLedger={activeLedger}
                                stats={stats}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                filteredHistory={filteredHistory}
                                handleSettleDebt={handleSettleDebt}
                                setPaymentMusicianId={setPaymentMusicianId}

                                setShowPaymentModal={setShowPaymentModal}
                                selectedItems={selectedItems}
                                handleToggleSelect={handleToggleSelect}
                                selectedTotal={selectedTotal}
                                handleDeleteClick={handleDeleteClick}
                                onClose={() => setSelectedMusicianId(null)}
                                isMobileOverlay={true}
                            />
                        </div>
                    </div>,
                    document.body
                )
            }

        </>
    );
}
