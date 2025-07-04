'use server';

import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { clients, team, appointments, timeEntries, revenues, content } from '@/lib/data';

export async function seedDatabase() {
    try {
        const batch = writeBatch(db);

        const collectionsToSeed = {
            clients: { data: clients, check: await getDocs(collection(db, 'clients')) },
            team: { data: team, check: await getDocs(collection(db, 'team')) },
            appointments: { data: appointments, check: await getDocs(collection(db, 'appointments')) },
            timeEntries: { data: timeEntries, check: await getDocs(collection(db, 'timeEntries')) },
            revenues: { data: revenues, check: await getDocs(collection(db, 'revenues')) },
            content: { data: content, check: await getDocs(collection(db, 'content')) },
        };

        let seeded = false;
        for (const [name, { data, check }] of Object.entries(collectionsToSeed)) {
            if (check.empty) {
                console.log(`Seeding ${name}...`);
                seeded = true;
                data.forEach((item: any) => {
                    // Firestore Timestamps are better for dates, so convert Date objects to ISO strings
                    const itemData = { ...item };
                    if (item.date && item.date instanceof Date) {
                        itemData.date = item.date.toISOString();
                    }
                    const docRef = doc(db, name, item.id);
                    batch.set(docRef, itemData);
                });
            } else {
                console.log(`Collection '${name}' is not empty, skipping.`);
            }
        }

        if (seeded) {
            await batch.commit();
            return { success: true, message: 'Database seeded successfully!' };
        } else {
            return { success: true, message: 'Database already contains data. No action taken.' };
        }
    } catch (error) {
        console.error("Error seeding database: ", error);
        if (error instanceof Error) {
            return { success: false, message: `Error seeding database: ${error.message}` };
        }
        return { success: false, message: 'An unknown error occurred while seeding database.' };
    }
}
