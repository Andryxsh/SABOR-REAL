/**
 * Sabor Real Routes (v2 -> PROD)
 * Centralización de rutas definitivas.
 */

export const V2_ROUTES = {
    DASHBOARD: '/dashboard',
    EVENTS: '/events',
    EVENT_DETAIL: (id: string) => `/event/${id}`,
    FINANCE: '/finance',
    MUSICIANS: '/musicians',
    MUSICIAN_DETAIL: (id: string) => `/musician/${id}`,
    LOGIN: '/',
};
