import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import { useMusicians } from '@/application/features/musicians/hooks/useMusicians';

import MusicianCard from '@/presentation/features/musicians/components/list/MusicianCard';
import CreateMusicianModal from '@/presentation/features/musicians/components/modals/CreateMusicianModal';

/**
 * Musicians Page (v2)
 * Punto de entrada para la gestión del equipo Sabor Real.
 */
const MusiciansV2: React.FC = () => {
    const location = useLocation();
    const {
        musicians,
        loading,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        tabs,
        events,
        payments,
        addMusician
    } = useMusicians();

    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    // Detectar si se debe abrir el modal desde navegación (Navbar FAB)
    useEffect(() => {
        if (location.state?.openCreateMusicianModal) {
            setIsCreateModalOpen(true);
            // Limpiar el state para evitar que se abra de nuevo al volver
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleAddMusician = async (formData: any) => {
        try {
            await addMusician({
                ...formData,
                imageUrl: "/assets/default_avatar.webp",
                debt: 0
            });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Error al registrar integrante');
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 py-6 px-4 animate-fade-in pb-24">
                {/* 1. Cabecera Premium */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Integrantes</h1>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Equipo Sabor Real</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="size-10 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-primary/10"
                    >
                        <span className="material-symbols-outlined text-2xl">add</span>
                    </button>
                </div>

                {/* 2. Buscador y Filtros */}
                <div className="space-y-4">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-3 text-white/20 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre, apodo o rol..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-sm shadow-xl"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeTab === tab
                                    ? 'bg-primary/20 border-primary/50 text-white shadow-lg'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Lista de Integrantes Premium */}
                <div className="grid grid-cols-1 gap-4">
                    {musicians.length === 0 ? (
                        <div className="text-center py-20 opacity-20 italic text-xs uppercase font-bold tracking-widest">
                            No se encontraron integrantes
                        </div>
                    ) : (
                        musicians.map(member => (
                            <MusicianCard
                                key={member.id}
                                member={member}
                                allEvents={events}
                                allPayments={payments}
                            />
                        ))
                    )}
                </div>
            </div>

            <CreateMusicianModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleAddMusician}
            />
        </MainLayout>
    );
};

export default MusiciansV2;
