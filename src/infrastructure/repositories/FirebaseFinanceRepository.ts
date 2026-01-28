import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Payment } from "@/core/domain/entities/Payment";
import type { Expense } from "@/core/domain/entities/Expense";
import type { FinanceRepository } from "@/core/domain/repositories/FinanceRepository";

export class FirebaseFinanceRepository implements FinanceRepository {
    private paymentsCollection = 'payments';
    private expensesCollection = 'expenses';

    // --- PAYMENTS ---

    listenRecentPayments(limitCount: number, callback: (payments: Payment[]) => void): () => void {
        const q = query(
            collection(db, this.paymentsCollection),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        return onSnapshot(q, (snapshot) => {
            const payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Payment[];
            callback(payments);
        });
    }

    async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const newRef = doc(collection(db, this.paymentsCollection));
        const now = new Date().toISOString();

        const newPayment: Payment = {
            id: newRef.id,
            ...payment,
            createdAt: now,
            updatedAt: now
        };

        await setDoc(newRef, newPayment);
        return newRef.id;
    }

    async updatePayment(id: string, data: Partial<Payment>): Promise<void> {
        const ref = doc(db, this.paymentsCollection, id);
        const now = new Date().toISOString();

        await updateDoc(ref, {
            ...data,
            updatedAt: now
        });
    }

    async deletePayment(id: string): Promise<void> {
        const ref = doc(db, this.paymentsCollection, id);
        await deleteDoc(ref);
    }

    // --- EXPENSES ---

    listenRecentExpenses(limitCount: number, callback: (expenses: Expense[]) => void): () => void {
        const q = query(
            collection(db, this.expensesCollection),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        return onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Expense[];
            callback(expenses);
        });
    }

    async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const newRef = doc(collection(db, this.expensesCollection));
        const now = new Date().toISOString();

        const newExpense: Expense = {
            id: newRef.id,
            ...expense,
            createdAt: now,
            updatedAt: now
        };

        await setDoc(newRef, newExpense);
        return newRef.id;
    }

    async updateExpense(id: string, data: Partial<Expense>): Promise<void> {
        const ref = doc(db, this.expensesCollection, id);
        const now = new Date().toISOString();

        await updateDoc(ref, {
            ...data,
            updatedAt: now
        });
    }

    async deleteExpense(id: string): Promise<void> {
        const ref = doc(db, this.expensesCollection, id);
        await deleteDoc(ref);
    }
}
