import { useEffect } from 'react';
import { useMusicianStore } from '@/application/store/useMusicianStore';
import { useEventStore } from '@/application/store/useEventStore';
import { useFinanceStore } from '@/application/store/useFinanceStore';

/**
 * useGlobalStoreInitializer
 * Hook que inicializa las suscripciones Firebase GLOBALMENTE.
 * Se ejecuta UNA SOLA VEZ al montar la app.
 * 
 * Ventajas:
 * - Solo 3 conexiones Firebase (en lugar de N por cada página)
 * - Datos disponibles instantáneamente en todas las páginas
 * - Optimizado para móviles (menos overhead)
 */
export const useGlobalStoreInitializer = () => {
    const { subscribe: subscribeMus } = useMusicianStore();
    const { subscribeRecent: subscribeEvt } = useEventStore();
    const { subscribePayments, subscribeExpenses } = useFinanceStore();

    useEffect(() => {
        console.log('🚀 Inicializando suscripciones globales...');

        // Activar todas las suscripciones
        const unsubMusicians = subscribeMus();
        const unsubEvents = subscribeEvt(100); // Últimos 100 eventos
        const unsubPayments = subscribePayments(100);
        const unsubExpenses = subscribeExpenses(100);

        console.log('✅ Suscripciones activas');

        // Cleanup al desmontar la app
        return () => {
            console.log('🔌 Cerrando suscripciones globales');
            unsubMusicians();
            unsubEvents();
            unsubPayments();
            unsubExpenses();
        };
    }, []); // Solo se ejecuta una vez
};
