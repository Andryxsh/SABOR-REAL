import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import { useMusicians } from '@/application/features/musicians/hooks/useMusicians';
import type { Musician } from '@/core/domain/entities/Musician';

// Componentes Modulares v2 (Detalle)
import MusicianProfileHeader from '@/presentation/features/musicians/components/detail/MusicianProfileHeader';
import MusicianStats from '@/presentation/features/musicians/components/detail/MusicianStats';
import MusicianHistory from '@/presentation/features/musicians/components/detail/MusicianHistory';
import EditMusicianModal from '@/presentation/features/musicians/components/modals/EditMusicianModal';

/**
 * MusicianDetail Page (v2)
 * Perfil detallado de un integrante de la orquesta.
 */
const MusicianDetailV2: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { musicians: allMusicians, events, payments, loading, updateMusician } = useMusicians();
    const [member, setMember] = useState<Musician | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const found = allMusicians.find(m => m.id === id);
        if (found) setMember(found);
    }, [id, allMusicians]);

    const handleEditMember = async (formData: any) => {
        if (!member) return;
        try {
            await updateMusician(member.id, formData);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar integrante');
        }
    };

    if (loading || !member) {
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
            <div className="flex flex-col gap-8 py-8 px-4 animate-fade-in pb-32 max-w-lg mx-auto">
                {/* 1. Cabecera con Info de Identidad */}
                <MusicianProfileHeader
                    member={member}
                    onEdit={() => setIsEditModalOpen(true)}
                />

                {/* 2. Resumen Estadístico / Financiero */}
                <MusicianStats
                    member={member}
                    allEvents={events}
                    allPayments={payments}
                />

                {/* 3. Línea de Tiempo / Historial */}
                <MusicianHistory
                    member={member}
                    allEvents={events}
                    allPayments={payments}
                />
            </div>

            <EditMusicianModal
                isOpen={isEditModalOpen}
                member={member}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditMember}
            />
        </MainLayout>
    );
};

export default MusicianDetailV2;
