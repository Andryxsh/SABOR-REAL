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
import type { Event } from "@/core/domain/entities/Event";
import type { EventRepository } from "@/core/domain/repositories/EventRepository";

export class FirebaseEventRepository implements EventRepository {
    private collectionName = 'events';

    listenRecent(limitCount: number, callback: (events: Event[]) => void): () => void {
        const q = query(
            collection(db, this.collectionName),
            orderBy('date', 'desc'),
            limit(limitCount)
        );

        return onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Event[];
            callback(events);
        });
    }

    async create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const newRef = doc(collection(db, this.collectionName));
        const now = new Date().toISOString();

        const newEvent: Event = {
            id: newRef.id,
            ...event,
            createdAt: now,
            updatedAt: now
        };

        await setDoc(newRef, newEvent);
        return newRef.id;
    }

    async update(id: string, data: Partial<Event>): Promise<void> {
        const ref = doc(db, this.collectionName, id);
        const now = new Date().toISOString();

        await updateDoc(ref, {
            ...data,
            updatedAt: now
        });
    }

    async delete(id: string): Promise<void> {
        const ref = doc(db, this.collectionName, id);
        await deleteDoc(ref);
    }
}
