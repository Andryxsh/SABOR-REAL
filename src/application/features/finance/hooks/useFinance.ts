import { useMemo, useState, useCallback } from 'react';
// import { useApp } from '@/context/AppContext'; // REMOVED: Migrated to Zustand stores
import type { Payment } from '@/core/domain/entities/Payment'; // Changed to Core entity
import { useFinanceStore } from '@/application/store/useFinanceStore';
import { useEventStore } from '@/application/store/useEventStore';
import { useMusicianStore } from '@/application/store/useMusicianStore';

export type LedgerEarning = {
    id: string;
    title: string;
    date: string;
    amount: number;
    type: 'earning';
    status: 'paid' | 'partial' | 'unpaid';
    paidAmount: number;
};
// ... rest of types ...

export type LedgerPayment = {
    id: string;
    title: string;
    date: string;
    amount: number;
    type: 'payment';
    coveredEvents: any[];
    raw: Payment;
};

export type LedgerItem = LedgerEarning | LedgerPayment;

/**
 * useFinance (v2 - Estado Nivel Máximo) - Ultimate Ledger Engine
 * Powered by Zustand 🏎️
 */
export const useFinance = () => {
    // 1. ZUSTAND STORES
    const {
        payments,
        expenses,
        loadingPayments,
        loadingExpenses,
        addPayment,
        deletePayment,
        addExpense
    } = useFinanceStore();

    const { events } = useEventStore();
    const { musicians } = useMusicianStore();

    const loading = loadingPayments || loadingExpenses;

    // Suscripciones manejadas globalmente por useGlobalStoreInitializer

    const [selectedMusicianId, setSelectedMusicianId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Todos');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // 1. SMART LEDGER LOGIC (The FIFO Engine)
    const ledger = useMemo(() => {
        return musicians.map(musician => {
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
                        status: 'unpaid' as 'paid' | 'partial' | 'unpaid',
                        paidAmount: 0
                    }];
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const musicianPayments = payments
                .filter(p => p.musicianId === musician.id)
                .map(p => ({
                    id: p.id,
                    title: `Pago: ${p.tipo}`,
                    date: p.fecha,
                    amount: p.monto,
                    type: 'payment' as const,
                    raw: p
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            let earningsQueue = earnings.map(e => ({ ...e, remaining: e.amount }));

            const processedPayments = musicianPayments.map(payment => {
                let paymentRemaining = payment.amount;
                const coveredEvents = [];

                for (const earning of earningsQueue) {
                    if (paymentRemaining <= 0.01) break;
                    if (earning.remaining <= 0.01) continue;

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
                return { ...payment, coveredEvents } as LedgerPayment;
            });

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
                } as LedgerEarning;
            });

            const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);
            const totalPaid = musicianPayments.reduce((sum, p) => sum + p.amount, 0);
            const balance = totalEarned - totalPaid;

            const history: LedgerItem[] = [...processedEarnings, ...processedPayments].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            return {
                ...musician,
                totalEarned,
                totalPaid,
                balance,
                history
            };
        }).sort((a, b) => b.balance - a.balance);
    }, [musicians, events, payments]);

    // 2. Fragmentación de Listas para UI
    const debtors = useMemo(() => ledger.filter(l => l.balance > 0.01), [ledger]);
    const upToDate = useMemo(() => ledger.filter(l => l.balance <= 0.01), [ledger]);
    const activeLedger = useMemo(() =>
        selectedMusicianId ? ledger.find(l => l.id === selectedMusicianId) : null
        , [selectedMusicianId, ledger]);

    // 3. Totales Globales
    const stats = useMemo(() => {
        const totalIngresos = events.reduce((sum, e) => sum + (e.adelanto || 0), 0);
        const totalGastos = expenses.reduce((sum, e) => sum + e.monto, 0);
        const totalPagos = payments.reduce((sum, p) => sum + p.monto, 0);
        const totalDeuda = debtors.reduce((sum, d) => sum + d.balance, 0);
        const balance = totalIngresos - totalGastos - totalPagos;

        return { totalIngresos, totalGastos, totalPagos, balance, totalDeuda };
    }, [events, expenses, payments, debtors]);

    // 4. Selección
    const handleToggleSelect = useCallback((id: string) => {
        if (!activeLedger) return;
        const item = activeLedger.history.find((i) => i.id === id && i.type === 'earning') as LedgerEarning | undefined;
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
            .reduce((sum: number, item) => {
                const earning = item as LedgerEarning;
                const remaining = earning.amount - (earning.paidAmount || 0);
                return sum + remaining;
            }, 0);
    }, [activeLedger, selectedItems]);

    // 5. Historial Maestro (Buscador Global)
    const allTransactions = useMemo(() => {
        const income = events.filter(ev => ev.adelanto > 0).map(ev => ({
            id: `income-${ev.id}`,
            date: ev.date,
            title: ev.title,
            amount: ev.adelanto,
            type: 'ingreso' as const,
            category: 'Evento'
        }));

        const musicianPayments = payments.map(p => ({
            id: `pay-${p.id}`,
            date: p.fecha,
            title: `Pago: ${musicians.find(m => m.id === p.musicianId)?.nombre || 'Musico'}`,
            amount: p.monto,
            type: 'egreso' as const,
            category: 'Músico'
        }));

        const generalExpenses = expenses.map(e => ({
            id: `exp-${e.id}`,
            date: e.fecha,
            title: e.concepto,
            amount: e.monto,
            type: 'egreso' as const,
            category: e.categoria || 'Gasto'
        }));

        return [...income, ...musicianPayments, ...generalExpenses]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .filter(t => {
                const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.category.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;
                if (activeTab === 'Ingresos') return t.type === 'ingreso';
                if (activeTab === 'Egresos') return t.type === 'egreso';
                return true;
            });
    }, [events, payments, expenses, musicians, searchQuery, activeTab]);

    return {
        stats,
        debtors,
        upToDate,
        activeLedger,
        selectedMusicianId,
        setSelectedMusicianId,
        transactions: allTransactions,
        loading,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedItems,
        handleToggleSelect,
        selectedTotal,
        addPayment,
        deletePayment,
        addExpense
    };
};
