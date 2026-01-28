import React from 'react';
import { useLocation } from 'react-router-dom';
import HeaderV2 from '@/presentation/components/shared/Header';
import NavbarV2 from '@/presentation/components/shared/Navbar';
import { V2_ROUTES } from '@/constants/Routes';

interface MainLayoutProps {
    children: React.ReactNode;
}

/**
 * MainLayout (v2)
 * Proporciona la estructura base con Header y Navbar fijos.
 * Maneja el padding superior dinámicamente para que el banner del Dashboard
 * pueda ir debajo del header (transparente), mientras que las otras páginas
 * mantienen su espaciado correcto.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();
    const isDashboard = location.pathname === V2_ROUTES.DASHBOARD || location.pathname === '/';

    return (
        <div className="bg-black font-display antialiased min-h-screen text-white overflow-hidden relative selection:bg-purple-500 selection:text-white">

            {/* Global Aurora Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 animate-aurora"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse duration-[10s]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse duration-[12s]"></div>
            </div>

            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-transparent z-10">
                {/* Header (Absolute para flotar sobre todo) */}
                <HeaderV2 />

                {/* Área de contenido (Padding condicional) */}
                <main className={`flex-1 overflow-y-auto pb-24 scrollbar-hide ${isDashboard ? '' : 'pt-24'}`}>
                    {children}
                </main>

                {/* Navbar fijo */}
                <NavbarV2 />
            </div>
        </div>
    );
};

export default MainLayout;
