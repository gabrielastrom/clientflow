import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
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
        throw new Error("Could not fetch content.");
    }
}

export async function addContent(content: Omit<Content, 'id'>): Promise<Content> {
    try {
        const newId = doc(collection(db, 'content')).id;
        const newContent: Content = { ...content, id: newId };
        await setDoc(doc(db, "content", newId), newContent);
        return newContent;
    } catch (error) {
        console.error("Error adding content: ", error);
        throw new Error("Failed to add content.");
    }
}

export async function updateContent(content: Content): Promise<void> {
    try {
        const contentRef = doc(db, "content", content.id);
        await setDoc(contentRef, content, { merge: true });
    } catch (error) {
        console.error("Error updating content: ", error);
        throw new Error("Failed to update content.");
    }
}

export async function deleteContent(contentId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "content", contentId));
    } catch (error) {
        console.error("Error deleting content: ", error);
        throw new Error("Failed to delete content.");
    }
}
