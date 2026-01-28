import { useMemo } from 'react';
import { useEventStore } from '@/application/store/useEventStore';
import { useMusicianStore } from '@/application/store/useMusicianStore';
import { useFinanceStore } from '@/application/store/useFinanceStore';

/**
 * useDashboardStats (v2 - Zustand Powered)
 * Hook de la capa de Aplicación que extrae y procesa las estadísticas del Dashboard.
 */
export const useDashboardStats = () => {
    const { events } = useEventStore();
    const { musicians } = useMusicianStore();
    const { expenses, payments, loadingExpenses, loadingPayments } = useFinanceStore();

    const loading = loadingExpenses || loadingPayments;

    const stats = useMemo(() => {
        if (loading) return null;

        // 1. Próximos eventos (ordenados por fecha)
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        const today = d.toISOString().split('T')[0];

        const upcomingEvents = events
            .filter(e => e.date >= today && e.status !== 'Cancelado' && !e.locked && e.status !== 'Finalizado')
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3);

        const totalUpcomingCount = events
            .filter(e => e.date >= today && e.status !== 'Cancelado' && !e.locked && e.status !== 'Finalizado').length;

        // 2. Músicos activos
        const activeMusiciansCount = musicians.filter(m => m.status === 'activo').length;

        // 3. Ingresos totales (eventos confirmados + finalizados)
        const totalIngresos = events
            .filter(e => e.status === 'Confirmado' || e.status === 'Finalizado')
            .reduce((sum, e) => sum + e.precio, 0);

        // 3. Gastos totales
        const totalGastos = expenses.reduce((sum, e) => sum + e.monto, 0);

        // 4. Total Pagado a Músicos (Real)
        const totalPagados = payments.reduce((sum, p) => sum + p.monto, 0);

        // 5. Balance general (Ingresos - Gastos - Pagos Reales)
        const balance = totalIngresos - totalGastos - totalPagados;

        // 6. Cálculo de Deuda Real Pendiente (Optimizado O(N))
        const earningsMap = new Map<string, number>();
        events.forEach(event => {
            if (event.status === 'Cancelado') return;
            event.musicosAsignados.forEach(m => {
                if (m.asistio) {
                    earningsMap.set(m.musicianId, (earningsMap.get(m.musicianId) || 0) + m.montoPagar);
                }
            });
        });

        const paymentsMap = new Map<string, number>();
        payments.forEach(payment => {
            paymentsMap.set(payment.musicianId, (paymentsMap.get(payment.musicianId) || 0) + payment.monto);
        });

        const musiciansWithDebt = musicians
            .map(musician => {
                const totalEarned = earningsMap.get(musician.id) || 0;
                const totalPaid = paymentsMap.get(musician.id) || 0;
                const debt = totalEarned - totalPaid;
                return { ...musician, debt };
            })
            .filter(m => m.debt > 0)
            .sort((a, b) => b.debt - a.debt);

        const totalDeudaMusicos = musiciansWithDebt.reduce((sum, m) => sum + m.debt, 0);

        return {
            upcomingEvents,
            totalUpcomingCount,
            activeMusiciansCount,
            totalIngresos,
            totalGastos,
            balance,
            totalDeudaMusicos,
            musiciansWithDebt: musiciansWithDebt.slice(0, 5), // Solo los top 5 para el dashboard
            totalDeudoresCount: musiciansWithDebt.length,
            loading,
        };
    }, [events, musicians, expenses, payments, loading]);

    return { stats, loading };
};
