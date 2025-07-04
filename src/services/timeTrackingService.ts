import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { TimeEntry } from '@/lib/types';

const timeEntriesCollection = collection(db, 'time-entries');

export async function getTimeEntries(): Promise<TimeEntry[]> {
    try {
        const snapshot = await getDocs(timeEntriesCollection);
        if (snapshot.empty) {
            console.log('No time entries found in Firestore.');
            return [];
        }
        const list = snapshot.docs.map(doc => doc.data() as TimeEntry);
        // Sort by date descending
        return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error fetching time entries: ", error);
        throw new Error("Could not fetch time entries.");
    }
}

export async function addTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
    try {
        const newId = doc(collection(db, 'time-entries')).id;
        const newEntry: TimeEntry = { ...entry, id: newId };
        await setDoc(doc(db, "time-entries", newId), newEntry);
        return newEntry;
    } catch (error) {
        console.error("Error adding time entry: ", error);
        throw new Error("Failed to add time entry.");
    }
}

export async function updateTimeEntry(entry: TimeEntry): Promise<void> {
    try {
        const entryRef = doc(db, "time-entries", entry.id);
        await setDoc(entryRef, entry, { merge: true });
    } catch (error) {
        console.error("Error updating time entry: ", error);
        throw new Error("Failed to update time entry.");
    }
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "time-entries", entryId));
    } catch (error) {
        console.error("Error deleting time entry: ", error);
        throw new Error("Failed to delete time entry.");
    }
}

    