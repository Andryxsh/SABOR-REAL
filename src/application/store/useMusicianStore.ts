import { create } from 'zustand';
import { FirebaseMusicianRepository } from '@/infrastructure/repositories/FirebaseMusicianRepository';
import type { Musician } from '@/core/domain/entities/Musician';

interface MusicianState {
    musicians: Musician[];
    loading: boolean;
    error: string | null;

    // Actions
    subscribe: () => () => void; // Retorna función unsubscribe
    addMusician: (musician: Omit<Musician, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateMusician: (id: string, data: Partial<Musician>) => Promise<void>;
    deleteMusician: (id: string) => Promise<void>;
}

// Instancia del Repositorio (Infraestructura)
const repository = new FirebaseMusicianRepository();

export const useMusicianStore = create<MusicianState>((set) => ({
    musicians: [],
    loading: false, // Inicia false, subscribe lo pondrá true
    error: null,

    subscribe: () => {
        set({ loading: true });
        // Llama al repositorio para escuchar cambios
        const unsubscribe = repository.listenToAll((musicians) => {
            set({ musicians, loading: false });
        });
        return unsubscribe;
    },

    addMusician: async (data) => {
        try {
            await repository.create(data);
            // No need to update state manually, listener will do it
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateMusician: async (id, data) => {
        try {
            await repository.update(id, data);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteMusician: async (id) => {
        try {
            await repository.delete(id);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    }
}));
