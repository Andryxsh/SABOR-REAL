import type { Payment } from "../entities/Payment";
import type { Expense } from "../entities/Expense";

export interface FinanceRepository {
    // Pagos
    listenRecentPayments(limitCount: number, callback: (payments: Payment[]) => void): () => void;
    createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    updatePayment(id: string, data: Partial<Payment>): Promise<void>;
    deletePayment(id: string): Promise<void>;

    // Gastos
    listenRecentExpenses(limitCount: number, callback: (expenses: Expense[]) => void): () => void;
    createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    updateExpense(id: string, data: Partial<Expense>): Promise<void>;
    deleteExpense(id: string): Promise<void>;
}
