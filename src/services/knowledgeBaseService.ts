
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import type { KnowledgeBaseArticle as Article } from '@/lib/types';

const articlesCollection = collection(db, 'knowledge-base');

function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

export function listenToArticles(callback: (articles: Article[]) => void): () => void {
    try {
        const unsubscribe = onSnapshot(articlesCollection, (snapshot) => {
            if (snapshot.empty) {
                callback([]);
                return;
            }
            const list = snapshot.docs.map(doc => doc.data() as Article);
            callback(list);
        });
        return unsubscribe;
    } catch (error) {
        console.error("Error setting up articles listener: ", error);
        throw new Error("Could not listen to articles.");
    }
}

export async function addArticle(articleData: Omit<Article, 'id' | 'slug'>): Promise<Article> {
    try {
        const newId = doc(articlesCollection).id;
        const slug = createSlug(articleData.title);
        const newArticle: Article = { ...articleData, id: newId, slug };
        await setDoc(doc(db, "knowledge-base", newId), newArticle);
        return newArticle;
    } catch (error) {
        console.error("Error adding article: ", error);
        throw new Error("Failed to add article.");
    }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
    try {
        const q = query(articlesCollection, where("slug", "==", slug));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log('No matching article found.');
            return null;
        }
        return snapshot.docs[0].data() as Article;
    } catch (error) {
        console.error("Error fetching article by slug: ", error);
        throw new Error("Could not fetch article.");
    }
}

export async function updateArticle(article: Article): Promise<void> {
    try {
        // If the title changed, the slug might need to change.
        const newSlug = createSlug(article.title);
        const articleWithSlug = { ...article, slug: newSlug };
        const articleRef = doc(db, "knowledge-base", article.id);
        await setDoc(articleRef, articleWithSlug, { merge: true });
    } catch (error) {
        console.error("Error updating article: ", error);
        throw new Error("Failed to update article.");
    }
}

export async function deleteArticle(articleId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "knowledge-base", articleId));
    } catch (error) {
        console.error("Error deleting article: ", error);
        throw new Error("Failed to delete article.");
    }
}
