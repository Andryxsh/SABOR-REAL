import React, { useState } from 'react';
import type { Musician } from '@/core/domain/entities/Musician';

interface MusicianFormProps {
    initialData?: Partial<Musician>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const MusicianForm: React.FC<MusicianFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        apellido: initialData?.apellido || '',
        apodo: initialData?.apodo || '',
        ci: initialData?.ci || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        fechaNacimiento: initialData?.fechaNacimiento || '',
        fechaIngreso: initialData?.fechaIngreso || '',
        role: initialData?.role || '',
        category: initialData?.category || 'musico',
        status: initialData?.status || 'activo',
        tarifas: {
            discoteca: initialData?.tarifas?.discoteca || 0,
            privado: initialData?.tarifas?.privado || 0,
            viaje: initialData?.tarifas?.viaje || 0,
            ensayo: initialData?.tarifas?.ensayo || 0,
            privado_3h: initialData?.tarifas?.privado_3h || 0,
            viaje_3h: initialData?.tarifas?.viaje_3h || 0,
            viaje_discoteca: initialData?.tarifas?.viaje_discoteca || 0,
            chofer_extra: initialData?.tarifas?.chofer_extra || 0,
        },
        formaPago: initialData?.formaPago || 'efectivo',
        cuentaBancaria: initialData?.cuentaBancaria || '',
        notas: initialData?.notas || ''
    });

    const isChofer = formData.category === 'chofer';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('tarifas.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                tarifas: { ...prev.tarifas, [field]: parseFloat(value) || 0 }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre) {
            alert('El nombre es obligatorio');
            return;
        }
        onSubmit(formData);
    };

    const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-bold text-sm";
    const labelClasses = "block text-[10px] font-bold text-white/40 uppercase mb-1.5 ml-1 trekking-widest";
    const sectionClasses = "text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECCIÓN 1: PERSONAL */}
            <div className="space-y-4">
                <h3 className={`${sectionClasses} text-primary`}>
                    <span className="material-symbols-outlined text-base">person</span>
                    Información Personal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Nombre *</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan" className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Apellido</label>
                        <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ej: Perez" className={inputClasses} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Apodo</label>
                        <input type="text" name="apodo" value={formData.apodo} onChange={handleChange} placeholder="Alias" className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>C.I.</label>
                        <input type="text" name="ci" value={formData.ci} onChange={handleChange} placeholder="Carnet" className={inputClasses} />
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* SECCIÓN 2: CONTACTO Y LABORAL */}
            <div className="space-y-4">
                <h3 className={`${sectionClasses} text-blue-400`}>
                    <span className="material-symbols-outlined text-base">work</span>
                    Contacto y Laboral
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Teléfono</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Celular" className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Categoría</label>
                        <select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                            <option value="musico">Músico</option>
                            <option value="staff">Staff</option>
                            <option value="chofer">Chofer</option>
                            <option value="camara">Cámara</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Rol / Instrumento</label>
                    <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Ej: Primera Voz, Timbales..." className={inputClasses} />
                </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* SECCIÓN 3: TARIFAS (Bs) - LOGICA CONDICIONAL */}
            <div className="space-y-4">
                <h3 className={`${sectionClasses} text-emerald-400`}>
                    <span className="material-symbols-outlined text-base">payments</span>
                    Tarifas por Evento (Bs)
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                    {/* Lógica Específica CHOFER vs OTROS vs STAFF */}
                    {formData.category === 'staff' ? (
                        <>
                            {/* Staff: Discoteca y Privado (200 Bs sugerido) + Viaje (300 Bs sugerido) */}
                            <div>
                                <label className={labelClasses}>Discoteca</label>
                                <input type="number" name="tarifas.discoteca" value={formData.tarifas.discoteca} onChange={handleChange} className={inputClasses} placeholder="200" />
                            </div>
                            <div>
                                <label className={labelClasses}>Privado</label>
                                <input type="number" name="tarifas.privado" value={formData.tarifas.privado} onChange={handleChange} className={inputClasses} placeholder="200" />
                            </div>
                            <div>
                                <label className={labelClasses}>Viaje</label>
                                <input type="number" name="tarifas.viaje" value={formData.tarifas.viaje} onChange={handleChange} className={inputClasses} placeholder="300" />
                            </div>
                        </>
                    ) : isChofer ? (
                        <>
                            {/* Chofer: Discoteca + Privado + Viaje Bloqueado + Extra Chofer */}
                            <div>
                                <label className={labelClasses}>Discoteca</label>
                                <input type="number" name="tarifas.discoteca" value={formData.tarifas.discoteca} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Privado</label>
                                <input type="number" name="tarifas.privado" value={formData.tarifas.privado} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Viaje (A tratar)</label>
                                <input
                                    type="number"
                                    disabled
                                    placeholder="Variable"
                                    className={`${inputClasses} opacity-50 cursor-not-allowed border-dashed`}
                                />
                            </div>
                            <div>
                                <label className={`${labelClasses} text-yellow-500`}>Extra Chofer (2do Evento)</label>
                                <input
                                    type="number"
                                    name="tarifas.chofer_extra"
                                    value={formData.tarifas.chofer_extra}
                                    onChange={handleChange}
                                    className={`${inputClasses} border-yellow-500/30 focus:border-yellow-500 text-yellow-400`}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Músicos: Tarifas Completas */}
                            <div>
                                <label className={labelClasses}>Discoteca</label>
                                <input type="number" name="tarifas.discoteca" value={formData.tarifas.discoteca} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Privado</label>
                                <input type="number" name="tarifas.privado" value={formData.tarifas.privado} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Viaje</label>
                                <input type="number" name="tarifas.viaje" value={formData.tarifas.viaje} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Ensayo</label>
                                <input type="number" name="tarifas.ensayo" value={formData.tarifas.ensayo} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Privado (3h)</label>
                                <input type="number" name="tarifas.privado_3h" value={formData.tarifas.privado_3h} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Viaje (3h)</label>
                                <input type="number" name="tarifas.viaje_3h" value={formData.tarifas.viaje_3h} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Viaje (Discoteca)</label>
                                <input type="number" name="tarifas.viaje_discoteca" value={formData.tarifas.viaje_discoteca} onChange={handleChange} className={inputClasses} />
                            </div>
                        </>
                    )}

                </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* SECCIÓN 4: PAGO */}
            <div className="space-y-4">
                <h3 className={`${sectionClasses} text-purple-400`}>
                    <span className="material-symbols-outlined text-base">account_balance</span>
                    Información de Pago
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Método</label>
                        <select name="formaPago" value={formData.formaPago} onChange={handleChange} className={inputClasses}>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Cuenta / Datos Bancarios</label>
                    <textarea name="cuentaBancaria" value={formData.cuentaBancaria} onChange={handleChange} rows={2} className={`${inputClasses} resize-none py-3`} placeholder="Banco Sol, Cta: 123456..."></textarea>
                </div>
            </div>

            {/* BOTONES */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-[#0a0a0a] pb-2">
                <button type="button" onClick={onCancel} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all active:scale-95">
                    Cancelar
                </button>
                <button type="submit" className="flex-2 py-4 px-8 bg-gradient-to-r from-primary to-purple-600 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                    Guardar Integrante
                </button>
            </div>
        </form>
    );
};

export default MusicianForm;
