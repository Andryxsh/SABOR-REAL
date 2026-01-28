import { create } from 'zustand';
import { FirebaseEventRepository } from '@/infrastructure/repositories/FirebaseEventRepository';
import type { Event } from '@/core/domain/entities/Event';

interface EventState {
    events: Event[];
    loading: boolean;
    error: string | null;

    // Actions
    subscribeRecent: (limitCount?: number) => () => void;
    addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
}

const repository = new FirebaseEventRepository();

export const useEventStore = create<EventState>((set) => ({
    events: [],
    loading: false,
    error: null,

    subscribeRecent: (limitCount = 50) => {
        set({ loading: true });
        const unsubscribe = repository.listenRecent(limitCount, (events) => {
            set({ events, loading: false });
        });
        return unsubscribe;
    },

    addEvent: async (data) => {
        try {
            await repository.create(data);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateEvent: async (id, data) => {
        try {
            await repository.update(id, data);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            await repository.delete(id);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    }
}));
