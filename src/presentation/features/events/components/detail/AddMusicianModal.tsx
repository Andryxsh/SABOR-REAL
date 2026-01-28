import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Musician } from '@/core/domain/entities/Musician';
import type { Event } from '@/core/domain/entities/Event';

interface AddMusicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    musicians: Musician[];
    assignedIds: string[];
    eventType: Event['type'];
    events: Event[];
    currentEventDate: string;
    onAdd: (musicianId: string, monto: number) => void;
}

const AddMusicianModal: React.FC<AddMusicianModalProps> = ({
    isOpen,
    onClose,
    musicians,
    assignedIds,
    eventType,
    events,
    currentEventDate,
    onAdd
}) => {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [manualAmount, setManualAmount] = useState('');

    if (!isOpen) return null;

    const availableMusicians = musicians
        .filter(m => m.status === 'activo')
        .filter(m => !assignedIds.includes(m.id))
        .filter(m =>
            m.nombre.toLowerCase().includes(search.toLowerCase()) ||
            (m.role?.toLowerCase() || '').includes(search.toLowerCase())
        );

    // Tipos de evento que requieren o permiten monto manual (Viajes)
    const isTravelEvent = eventType.includes('viaje');

    const getRate = (m: Musician) => {
        // Regla: En viajes, la tarifa base es la del perfil, pero se espera negociación
        // Regla Chofer: Si es local (no viaje) y es 2do evento, aplica extra.
        // Si es viaje, la lógica de "Extra" no aplica automáticamente según el requerimiento, 
        // ya que el monto se define manualmente ("monto chofer viaje").

        if (!isTravelEvent && m.category === 'chofer') {
            const hasOtherEventToday = events.some(e =>
                e.date === currentEventDate &&
                e.musicosAsignados.some(ma => ma.musicianId === m.id)
            );

            if (hasOtherEventToday && (m.tarifas.chofer_extra || 0) > 0) {
                return { amount: m.tarifas.chofer_extra || 0, isExtra: true };
            }
        }

        return {
            amount: (m.tarifas as any)[eventType] || 0,
            isExtra: false
        };
    };

    const handleSelect = (m: Musician, rate: number) => {
        // Si es viaje o es un chofer en viaje, permitir edición manual
        if (isTravelEvent || (m.category === 'chofer' && isTravelEvent)) {
            if (selectedId === m.id) {
                // Ya estaba seleccionado, confirmar con el monto manual
                const finalAmount = manualAmount ? parseFloat(manualAmount) : rate;
                onAdd(m.id, finalAmount);
                setSelectedId(null);
                setManualAmount('');
            } else {
                // Seleccionar para editar monto
                setSelectedId(m.id);
                setManualAmount(rate.toString());
            }
        } else {
            // Evento normal local, asignación directa
            onAdd(m.id, rate);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col animate-slide-up">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">person_add</span>
                        Asignar Integrantes
                    </h2>
                    <button onClick={onClose} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 text-sm font-bold"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3 text-white/20 text-xl">search</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {availableMusicians.map((m) => {
                        const rateInfo = getRate(m);
                        const isSelected = selectedId === m.id;

                        return (
                            <div key={m.id} className={`flex flex-col rounded-2xl border transition-all overflow-hidden ${isSelected ? 'bg-white/10 border-purple-500/50' : 'bg-white/5 border-white/5'}`}>
                                <button
                                    onClick={() => handleSelect(m, rateInfo.amount)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="text-left">
                                        <p className="font-black text-sm text-white">{m.nombre} {m.apellido}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{m.role || 'Sin Rol'}</p>
                                            {rateInfo.isExtra && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 rounded font-bold uppercase">Extra</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {!isSelected && (
                                            <p className={`text-xs font-black ${rateInfo.isExtra ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                                {rateInfo.amount} <span className="text-[8px] font-normal text-white/40">Bs</span>
                                            </p>
                                        )}
                                        {isTravelEvent && !isSelected && <span className="text-[9px] text-blue-400 font-medium">Definir</span>}
                                    </div>
                                </button>

                                {isSelected && (
                                    <div className="p-4 pt-0 bg-black/20 flex gap-2 animate-fade-in">
                                        <div className="flex-1">
                                            <label className="text-[9px] font-bold text-white/40 uppercase mb-1 block">Monto a Pagar</label>
                                            <input
                                                type="number"
                                                autoFocus
                                                value={manualAmount}
                                                onChange={(e) => setManualAmount(e.target.value)}
                                                className="w-full px-3 py-2 bg-black border border-white/20 rounded-xl text-white font-bold text-right focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSelect(m, rateInfo.amount)}
                                            className="px-4 py-2 mt-auto bg-purple-600 rounded-xl text-white font-bold text-xs hover:bg-purple-500 transition-colors"
                                        >
                                            Confirmar
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddMusicianModal;
