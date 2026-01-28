import type { Musician } from "../entities/Musician";

export interface MusicianRepository {
    // Lectura reactiva (Realtime)
    listenToAll(callback: (musicians: Musician[]) => void): () => void;

    // Operaciones CRUD
    create(musician: Omit<Musician, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    update(id: string, data: Partial<Musician>): Promise<void>;
    delete(id: string): Promise<void>;

    // Consultas específicas (si fueran necesarias sin realtime)
    // getById(id: string): Promise<Musician | null>;
}
