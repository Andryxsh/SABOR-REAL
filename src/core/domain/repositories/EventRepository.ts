import type { Event } from "../entities/Event";

export interface EventRepository {
    // Lectura reactiva optimizada (Últimos N eventos)
    listenRecent(limitCount: number, callback: (events: Event[]) => void): () => void;

    // CRUD
    create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    update(id: string, data: Partial<Event>): Promise<void>;
    delete(id: string): Promise<void>;
}
