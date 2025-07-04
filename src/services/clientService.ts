'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Client } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getClients(): Promise<Client[]> {
    try {
        const clientsCol = collection(db, 'clients');
        const clientSnapshot = await getDocs(clientsCol);
        if (clientSnapshot.empty) {
            console.log('No clients found in Firestore.');
            return [];
        }
        const clientList = clientSnapshot.docs.map(doc => doc.data() as Client);
        return clientList;
    } catch (error) {
        console.error("Error fetching clients: ", error);
        return [];
    }
}

export async function addClient(client: Omit<Client, 'id'>): Promise<Client> {
    const newId = doc(collection(db, 'clients')).id;
    const newClient: Client = { ...client, id: newId };
    await setDoc(doc(db, "clients", newId), newClient);
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return newClient;
}

export async function updateClient(client: Client): Promise<void> {
    const clientRef = doc(db, "clients", client.id);
    await setDoc(clientRef, client, { merge: true });
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    revalidatePath('/home');
}

export async function deleteClient(clientId: string): Promise<void> {
    await deleteDoc(doc(db, "clients", clientId));
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    revalidatePath('/home');
}
