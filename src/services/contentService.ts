'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Content } from '@/lib/types';

export async function getContent(): Promise<Content[]> {
    try {
        const contentCol = collection(db, 'content');
        const snapshot = await getDocs(contentCol);
        if (snapshot.empty) {
            console.log('No content found in Firestore.');
            return [];
        }
        const list = snapshot.docs.map(doc => doc.data() as Content);
        return list;
    } catch (error) {
        console.error("Error fetching content: ", error);
        return [];
    }
}
