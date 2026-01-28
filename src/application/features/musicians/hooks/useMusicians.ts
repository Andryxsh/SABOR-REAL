import { useState, useMemo } from 'react';
import { useMusicianStore } from '@/application/store/useMusicianStore';
import { useEventStore } from '@/application/store/useEventStore';
import { useFinanceStore } from '@/application/store/useFinanceStore';

/**
 * useMusicians (v2 - Full Zustand Migration)
 * Hook para gestionar la lógica de la lista de integrantes.
 */
export const useMusicians = () => {
    // ZUSTAND STORES
    const {
        musicians,
        loading,
        addMusician,
        updateMusician,
        deleteMusician
    } = useMusicianStore();

    const { events } = useEventStore();
    const { payments } = useFinanceStore();

    // Suscripción manejada globalmente por useGlobalStoreInitializer

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Todos');

    const tabs = ['Todos', 'Músicos', 'Staff', 'Choferes', 'Cámaras', 'Inactivos'];

    const filteredMusicians = useMemo(() => {
        return musicians.filter(m => {
            // 1. Búsqueda Global
            const matchesSearch = searchQuery
                ? `${m.nombre} ${m.apellido || ''} ${m.apodo || ''} ${m.role || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            if (!matchesSearch) return false;

            // 2. Filtro por Pestañas
            if (activeTab === 'Todos') return m.status !== 'inactivo';
            if (activeTab === 'Inactivos') return m.status === 'inactivo';

            // Si hay pestaña específica, excluimos inactivos primero
            if (m.status === 'inactivo') return false;

            if (activeTab === 'Músicos') return m.category === 'musico';
            if (activeTab === 'Staff') return m.category === 'staff';
            if (activeTab === 'Choferes') return m.category === 'chofer';
            if (activeTab === 'Cámaras') return m.category === 'camara';

            return true;
        });
    }, [musicians, searchQuery, activeTab]);

    return {
        musicians: filteredMusicians,
        loading,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        tabs,
        events,
        payments,
        addMusician,
        updateMusician,
        deleteMusician
    };
};
