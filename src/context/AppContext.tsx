import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

/**
 * AppContext (v1 - DEPRECATED)
 * Este archivo se mantiene ÚNICAMENTE por compatibilidad estructural.
 * La lógica real y los datos han migrado al motor V2 (Zustand + Hexagonal).
 * 
 * TODO: Eliminar este archivo una vez se verifique la estabilidad total.
 */

// Cascarón vacío para evitar errores de tipos en componentes legacy que no fueron actualizados
const AppContext = createContext<any>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    // Valor vacío. Si algo usa AppContext ahora, recibirá un objeto vacío.
    // Esto es intencional para forzar el uso de la V2.
    const value = {};

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
