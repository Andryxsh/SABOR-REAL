import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import { useEventStore } from '@/application/store/useEventStore';
import { useMusicianStore } from '@/application/store/useMusicianStore';
import { useFinanceStore } from '@/application/store/useFinanceStore';
import type { Event } from '@/core/domain/entities/Event';
import { V2_ROUTES } from '@/constants/Routes';

// Componentes Modulares v2 (Detalle)
import EventDetailHeader from '@/presentation/features/events/components/detail/EventDetailHeader';
import EventDetailInfo from '@/presentation/features/events/components/detail/EventDetailInfo';
import EventFinancialSummary from '@/presentation/features/events/components/detail/EventFinancialSummary';
import EventMusiciansList from '@/presentation/features/events/components/detail/EventMusiciansList';
import AddMusicianModal from '@/presentation/features/events/components/detail/AddMusicianModal';
import AdelantoModal from '@/presentation/features/events/components/detail/AdelantoModal';
import EditEventModal from '@/presentation/features/events/components/detail/EditEventModal';

/**
 * EventDetail Page (v2)
 * Punto de orquestación para la vista de detalle.
 * Mantiene la lógica centralizada y la vista modularizada.
 */
const EventDetailV2: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Hooks de Aplicación (Capa de Datos)
    // Hooks de Aplicación (Capa de Datos - Zustand Migration)
    const {
        events,
        updateEvent,
        deleteEvent,
        loading: loadingEvents
    } = useEventStore();

    const {
        musicians,
        loading: loadingMusicians
    } = useMusicianStore();

    const {
        payments,
        loadingPayments
    } = useFinanceStore();

    const appLoading = loadingEvents || loadingMusicians || loadingPayments;

    const [event, setEvent] = useState<Event | null>(null);

    // Estados para Modales
    const [isAddMusicianOpen, setIsAddMusicianOpen] = useState(false);
    const [isAdelantoOpen, setIsAdelantoOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Sincronización de estado local con el global
    useEffect(() => {
        const found = events.find(e => e.id === id);
        if (found) setEvent(found);
    }, [id, events]);

    // ACCIONES DE NEGOCIO
    const handleToggleAttendance = async (musicianId: string) => {
        if (!event || event.locked) return;

        // 1. Toggle Attendance Local
        let updatedMusicians = event.musicosAsignados.map(m =>
            m.musicianId === musicianId ? { ...m, asistio: !m.asistio } : m
        );

        // 2. Lógica Especial de Redistribución para STAFF (Solo en Eventos Locales)
        const isTravelEvent = event.type.includes('viaje');

        if (!isTravelEvent) {
            const targetMusician = musicians.find(m => m.id === musicianId);
            if (targetMusician?.category === 'staff') {
                // Filtrar solo los asignados que sean Staff
                const staffAssignments = updatedMusicians.filter(assign => {
                    const profile = musicians.find(m => m.id === assign.musicianId);
                    return profile?.category === 'staff';
                });

                // Calcular el "Pozo" total (Suma de las tarifas base de todos los asignados, asumiendo que el monto inicial era la tarifa base)
                // O mejor: Sumar los montos actuales NO funciona si ya se redistribuyeron.
                // Estrategia: Recuperar la tarifa base del perfil para recalcular el pozo original.
                const totalBudget = staffAssignments.reduce((acc, assign) => {
                    const profile = musicians.find(m => m.id === assign.musicianId);
                    return acc + ((profile?.tarifas?.discoteca || 200)); // Asumimos tarifa base discoteca/privado si no se guardó el original
                }, 0);

                const attendingStaffCount = staffAssignments.filter(m => m.asistio).length;

                if (attendingStaffCount > 0) {
                    const newPayPerHead = totalBudget / attendingStaffCount;

                    updatedMusicians = updatedMusicians.map(assign => {
                        const profile = musicians.find(m => m.id === assign.musicianId);
                        if (profile?.category === 'staff') {
                            return {
                                ...assign,
                                montoPagar: assign.asistio ? newPayPerHead : 0
                            };
                        }
                        return assign;
                    });
                } else {
                    // Si nadie asiste, resetear a los montos base (opcional) o dejar en 0
                    updatedMusicians = updatedMusicians.map(assign => {
                        const profile = musicians.find(m => m.id === assign.musicianId);
                        if (profile?.category === 'staff') {
                            return { ...assign, montoPagar: 0 }; // Nadie cobra si nadie va
                        }
                        return assign;
                    });
                }
            }
        }

        await updateEvent(event.id, { musicosAsignados: updatedMusicians });
    };

    const handleRemoveMusician = async (musicianId: string) => {
        if (!event || event.locked) return;
        if (!confirm('¿Eliminar a este músico del evento?')) return;
        const updatedMusicians = event.musicosAsignados.filter(m => m.musicianId !== musicianId);
        await updateEvent(event.id, { musicosAsignados: updatedMusicians });
    };

    const handleToggleLock = async () => {
        if (!event) return;
        await updateEvent(event.id, { locked: !event.locked });
    };

    const handleDelete = async () => {
        if (!event || event.locked) return;
        if (!confirm(`¿Estás seguro de eliminar "${event.title}"? Esta acción no tiene vuelta atrás.`)) return;
        await deleteEvent(event.id);
        navigate(V2_ROUTES.EVENTS);
    };

    const handleAddMusician = async (musicianId: string, monto: number) => {
        if (!event) return;
        const newMusician = { musicianId, asistio: false, montoPagar: monto, pagado: false };
        const updated = [...event.musicosAsignados, newMusician];
        await updateEvent(event.id, { musicosAsignados: updated });
        setIsAddMusicianOpen(false);
    };

    const handleUpdateAdelanto = async (amount: number, mode: 'add' | 'fix') => {
        if (!event) return;
        const newAdelanto = mode === 'fix' ? amount : (event.adelanto || 0) + amount;
        await updateEvent(event.id, { adelanto: newAdelanto, saldo: event.precio - newAdelanto });
    };

    const handleEditSubmit = async (formData: any) => {
        if (!event) return;
        const precio = parseFloat(formData.precio) || 0;
        const adelanto = parseFloat(formData.adelanto) || 0;
        await updateEvent(event.id, {
            ...formData,
            precio,
            adelanto,
            saldo: precio - adelanto
        });
        setIsEditOpen(false);
    };

    if (appLoading || !event) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="size-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 py-6 px-4 animate-fade-in pb-32 max-w-2xl mx-auto">

                {/* 1. Cabecera con Acciones */}
                <EventDetailHeader
                    isLocked={event.locked || false}
                    onToggleLock={handleToggleLock}
                    onEdit={() => setIsEditOpen(true)}
                    onDelete={handleDelete}
                />

                {/* 2. Información Principal */}
                <EventDetailInfo event={event} />

                {/* 3. Panel Financiero */}
                <EventFinancialSummary
                    event={event}
                    isLocked={event.locked || false}
                    onAddAdelanto={() => setIsAdelantoOpen(true)}
                />

                {/* 4. Lista de Integrantes */}
                <EventMusiciansList
                    assignedMusicians={event.musicosAsignados}
                    allMusicians={musicians}
                    allEvents={events}
                    allPayments={payments}
                    isLocked={event.locked || false}
                    onToggleAttendance={handleToggleAttendance}
                    onRemove={handleRemoveMusician}
                    onAdd={() => setIsAddMusicianOpen(true)}
                />
            </div>

            {/* MODALES MODULARES */}
            <AddMusicianModal
                isOpen={isAddMusicianOpen}
                onClose={() => setIsAddMusicianOpen(false)}
                musicians={musicians}
                assignedIds={event.musicosAsignados.map(m => m.musicianId)}
                eventType={event.type}
                events={events}
                currentEventDate={event.date}
                onAdd={handleAddMusician}
            />

            <AdelantoModal
                isOpen={isAdelantoOpen}
                onClose={() => setIsAdelantoOpen(false)}
                currentAdelanto={event.adelanto}
                precioTotal={event.precio}
                onSubmit={handleUpdateAdelanto}
            />

            <EditEventModal
                isOpen={isEditOpen}
                event={event}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleEditSubmit}
            />
        </MainLayout>
    );
};

export default EventDetailV2;
