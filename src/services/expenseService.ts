
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import type { Expense } from '@/lib/types';

const expensesCollection = collection(db, 'expenses');

export function listenToExpenses(callback: (expenses: Expense[]) => void): () => void {
    try {
        const unsubscribe = onSnapshot(expensesCollection, (snapshot) => {
            if (snapshot.empty) {
                callback([]);
                return;
            }
            const list = snapshot.docs.map(doc => doc.data() as Expense);
            // Sort by month descending
            const sortedList = list.sort((a, b) => {
                const dateA = new Date(`1 ${a.month}`);
                const dateB = new Date(`1 ${b.month}`);
                return dateB.getTime() - dateA.getTime();
            });
            callback(sortedList);
        });
        return unsubscribe;
    } catch (error) {
        console.error("Error setting up expenses listener: ", error);
        throw new Error("Could not listen to expenses.");
    }
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    try {
        const newId = doc(expensesCollection).id;
        const newExpense: Expense = { ...expense, id: newId };
        await setDoc(doc(db, "expenses", newId), newExpense);
        return newExpense;
    } catch (error) {
        console.error("Error adding expense: ", error);
        throw new Error("Failed to add expense.");
    }
}

export async function updateExpense(expense: Expense): Promise<void> {
    try {
        const expenseRef = doc(db, "expenses", expense.id);
        await setDoc(expenseRef, expense, { merge: true });
    } catch (error) {
        console.error("Error updating expense: ", error);
        throw new Error("Failed to update expense.");
    }
}

export async function deleteExpense(expenseId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "expenses", expenseId));
    } catch (error) {
        console.error("Error deleting expense: ", error);
        throw new Error("Failed to delete expense.");
    }
}
