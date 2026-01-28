import React, { useState } from 'react';
import type { Event } from '@/core/domain/entities/Event';

interface EventFormProps {
    initialData?: {
        title: string;
        type: Event['type'];
        date: string;
        time: string;
        location: string;
        status: Event['status'];
        precio: string;
        adelanto: string;
        cliente: {
            nombre: string;
            telefono: string;
        };
        notas?: string;
        driverTravelRate?: string;
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

/**
 * EventForm (v2)
 * Formulario modular para crear o editar eventos.
 */
const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        type: initialData?.type || 'privado',
        date: initialData?.date || '',
        time: initialData?.time || '',
        location: initialData?.location || '',
        status: initialData?.status || 'Pendiente',
        precio: initialData?.precio || '',
        adelanto: initialData?.adelanto || '',
        cliente: {
            nombre: initialData?.cliente?.nombre || '',
            telefono: initialData?.cliente?.telefono || '',
        },
        driverTravelRate: initialData?.driverTravelRate || '',
        notas: initialData?.notas || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('cliente.')) {
            const clientField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                cliente: { ...prev.cliente, [clientField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.date || !formData.time) {
            alert('Faltan campos obligatorios');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECCIÓN 1: PRINCIPAL */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Información Principal</h3>

                <div className="space-y-4">
                    <div className="relative group">
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1">Título del Evento *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ej: Boda Familia Pérez"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-bold text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1">Tipo</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 appearance-none font-bold text-sm"
                            >
                                <option value="privado">Privado</option>
                                <option value="discoteca">Discoteca</option>
                                <option value="viaje">Viaje</option>
                                <option value="ensayo">Ensayo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1">Estado</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 appearance-none font-bold text-sm"
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmado">Confirmado</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1">Fecha *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1">Hora *</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1">Ubicación</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Salón de Eventos..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 font-bold text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* SECCIÓN 2: CLIENTE */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Datos del Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="cliente.nombre"
                        value={formData.cliente.nombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 font-bold text-sm"
                    />
                    <input
                        type="tel"
                        name="cliente.telefono"
                        value={formData.cliente.telefono}
                        onChange={handleChange}
                        placeholder="Teléfono"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 font-bold text-sm"
                    />
                </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* SECCIÓN 3: FINANZAS */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Finanzas</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <input
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            placeholder="Precio (Bs)"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-emerald-400 font-black placeholder-white/10 focus:outline-none focus:border-emerald-500/50 text-sm"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            name="adelanto"
                            value={formData.adelanto}
                            onChange={handleChange}
                            placeholder="Adelanto (Bs)"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-emerald-400 font-black placeholder-white/10 focus:outline-none focus:border-emerald-500/50 text-sm"
                        />
                    </div>
                </div>

                {['viaje', 'viaje_3h', 'viaje_discoteca'].includes(formData.type) && (
                    <div className="animate-fade-in py-2">
                        <label className="block text-[10px] font-bold text-blue-400 uppercase mb-2 ml-1">Tarifa Choferes (Manual)</label>
                        <input
                            type="number"
                            name="driverTravelRate"
                            value={formData.driverTravelRate}
                            onChange={handleChange}
                            placeholder="Monto para transporte..."
                            className="w-full px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-blue-300 font-bold placeholder-blue-300/20 focus:outline-none focus:border-blue-500/50 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* BOTONES */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all active:scale-95"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-2 py-4 px-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95"
                >
                    Guardar Evento
                </button>
            </div>
        </form>
    );
};

export default EventForm;
