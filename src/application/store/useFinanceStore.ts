import { create } from 'zustand';
import { FirebaseFinanceRepository } from '@/infrastructure/repositories/FirebaseFinanceRepository';
import type { Payment } from '@/core/domain/entities/Payment';
import type { Expense } from '@/core/domain/entities/Expense';

interface FinanceState {
    payments: Payment[];
    expenses: Expense[];
    loadingPayments: boolean;
    loadingExpenses: boolean;
    error: string | null;

    // Actions - Payments
    subscribePayments: (limitCount?: number) => () => void;
    addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
    deletePayment: (id: string) => Promise<void>;

    // Actions - Expenses
    subscribeExpenses: (limitCount?: number) => () => void;
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
}

const repository = new FirebaseFinanceRepository();

export const useFinanceStore = create<FinanceState>((set) => ({
    payments: [],
    expenses: [],
    loadingPayments: false,
    loadingExpenses: false,
    error: null,

    // --- PAYMENTS ---
    subscribePayments: (limitCount = 50) => {
        set({ loadingPayments: true });
        const unsubscribe = repository.listenRecentPayments(limitCount, (payments) => {
            set({ payments, loadingPayments: false });
        });
        return unsubscribe;
    },

    addPayment: async (data) => {
        try {
            await repository.createPayment(data);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updatePayment: async (id, data) => {
        try {
            await repository.updatePayment(id, data);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deletePayment: async (id) => {
        try {
            await repository.deletePayment(id);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    // --- EXPENSES ---
    subscribeExpenses: (limitCount = 50) => {
        set({ loadingExpenses: true });
        const unsubscribe = repository.listenRecentExpenses(limitCount, (expenses) => {
            set({ expenses, loadingExpenses: false });
        });
        return unsubscribe;
    },

    addExpense: async (data) => {
        try {
            await repository.createExpense(data);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateExpense: async (id, data) => {
        try {
            await repository.updateExpense(id, data);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteExpense: async (id) => {
        try {
            await repository.deleteExpense(id);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    }
}));
