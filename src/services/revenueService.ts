
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import type { Revenue } from '@/lib/types';

const revenuesCollection = collection(db, 'revenues');

export function listenToRevenues(callback: (revenues: Revenue[]) => void): () => void {
    try {
        const unsubscribe = onSnapshot(revenuesCollection, (snapshot) => {
            if (snapshot.empty) {
                callback([]);
                return;
            }
            const list = snapshot.docs.map(doc => doc.data() as Revenue);
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
        console.error("Error setting up revenues listener: ", error);
        throw new Error("Could not listen to revenues.");
    }
}

export async function addRevenue(revenue: Omit<Revenue, 'id'>): Promise<Revenue> {
    try {
        const newId = doc(revenuesCollection).id;
        const newRevenue: Revenue = { ...revenue, id: newId };
        await setDoc(doc(db, "revenues", newId), newRevenue);
        return newRevenue;
    } catch (error) {
        console.error("Error adding revenue: ", error);
        throw new Error("Failed to add revenue.");
    }
}

export async function updateRevenue(revenue: Revenue): Promise<void> {
    try {
        const revenueRef = doc(db, "revenues", revenue.id);
        await setDoc(revenueRef, revenue, { merge: true });
    } catch (error) {
        console.error("Error updating revenue: ", error);
        throw new Error("Failed to update revenue.");
    }
}

export async function deleteRevenue(revenueId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "revenues", revenueId));
    } catch (error) {
        console.error("Error deleting revenue: ", error);
        throw new Error("Failed to delete revenue.");
    }
}
