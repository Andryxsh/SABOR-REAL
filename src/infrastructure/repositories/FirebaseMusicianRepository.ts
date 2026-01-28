import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Musician } from "@/core/domain/entities/Musician";
import type { MusicianRepository } from "@/core/domain/repositories/MusicianRepository";

export class FirebaseMusicianRepository implements MusicianRepository {
    private collectionName = 'musicians';

    listenToAll(callback: (musicians: Musician[]) => void): () => void {
        const q = query(collection(db, this.collectionName));

        return onSnapshot(q, (snapshot) => {
            const musicians = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Musician[];
            callback(musicians);
        });
    }

    async create(musician: Omit<Musician, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const newRef = doc(collection(db, this.collectionName));
        const now = new Date().toISOString();

        const newMusician: Musician = {
            id: newRef.id,
            ...musician,
            createdAt: now,
            updatedAt: now,
            debt: 0 // Default debt
        };

        await setDoc(newRef, newMusician);
        return newRef.id;
    }

    async update(id: string, data: Partial<Musician>): Promise<void> {
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
