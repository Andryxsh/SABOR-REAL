import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Musician } from '../context/AppContext';

export default function Musicians() {
    const navigate = useNavigate();
    const location = useLocation();
    const { musicians, events, payments, addMusician, updateMusician, deleteMusician: removeMusician, loading } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState(''); // NEW SEARCH STATE
    const [editMember, setEditMember] = useState<Musician | null>(null);
    const [deleteMember, setDeleteMember] = useState<Musician | null>(null);
    const [historyMember, setHistoryMember] = useState<Musician | null>(null);

    // Initial check for navigation state
    useEffect(() => {
        if (location.state?.openModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Form states - TODOS LOS CAMPOS NUEVOS
    const [newMemberNombre, setNewMemberNombre] = useState('');
    const [newMemberApellido, setNewMemberApellido] = useState('');
    const [newMemberApodo, setNewMemberApodo] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [newMemberCI, setNewMemberCI] = useState('');
    const [newMemberFechaNacimiento, setNewMemberFechaNacimiento] = useState('');
    const [newMemberFechaIngreso, setNewMemberFechaIngreso] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('');
    const [newMemberCategory, setNewMemberCategory] = useState<Musician['category']>('musico');
    const [newMemberStatus, setNewMemberStatus] = useState<Musician['status']>('activo');
    const [newMemberTarifaDiscoteca, setNewMemberTarifaDiscoteca] = useState('');
    const [newMemberTarifaPrivado, setNewMemberTarifaPrivado] = useState('');
    const [newMemberTarifaViaje, setNewMemberTarifaViaje] = useState('');
    const [newMemberTarifaEnsayo, setNewMemberTarifaEnsayo] = useState('');
    const [newMemberTarifaPrivado3h, setNewMemberTarifaPrivado3h] = useState(''); // New State
    const [newMemberTarifaViaje3h, setNewMemberTarifaViaje3h] = useState('');     // New State
    const [newMemberChoferExtra, setNewMemberChoferExtra] = useState(''); // New State
    const [newMemberFormaPago, setNewMemberFormaPago] = useState<'efectivo' | 'transferencia'>('efectivo');
    const [newMemberCuentaBancaria, setNewMemberCuentaBancaria] = useState('');
    const [newMemberNotas, setNewMemberNotas] = useState('');

    const handleAddMember = async () => {
        if (!newMemberNombre) {
            alert('Por favor completa el nombre');
            return;
        }
        try {
            const newMusician: any = {
                nombre: newMemberNombre,
                category: newMemberCategory,
                status: newMemberStatus,
                tarifas: {
                    discoteca: parseFloat(newMemberTarifaDiscoteca) || 0,
                    privado: parseFloat(newMemberTarifaPrivado) || 0,
                    viaje: parseFloat(newMemberTarifaViaje) || 0,
                },
                debt: 0,
                imageUrl: "/assets/default_avatar.webp"
            };

            // Solo agregar campos opcionales si tienen valor
            if (newMemberApellido) newMusician.apellido = newMemberApellido;
            if (newMemberApodo) newMusician.apodo = newMemberApodo;
            if (newMemberEmail) newMusician.email = newMemberEmail;
            if (newMemberPhone) newMusician.phone = newMemberPhone;
            if (newMemberCI) newMusician.ci = newMemberCI;
            if (newMemberFechaNacimiento) newMusician.fechaNacimiento = newMemberFechaNacimiento;
            if (newMemberFechaIngreso) newMusician.fechaIngreso = newMemberFechaIngreso;
            if (newMemberRole) newMusician.role = newMemberRole;
            if (newMemberFormaPago) newMusician.formaPago = newMemberFormaPago;
            if (newMemberCuentaBancaria) newMusician.cuentaBancaria = newMemberCuentaBancaria;
            if (newMemberNotas) newMusician.notas = newMemberNotas;
            if (newMemberTarifaEnsayo) newMusician.tarifas.ensayo = parseFloat(newMemberTarifaEnsayo);
            if (newMemberTarifaPrivado3h) newMusician.tarifas.privado_3h = parseFloat(newMemberTarifaPrivado3h); // New Logic
            if (newMemberTarifaViaje3h) newMusician.tarifas.viaje_3h = parseFloat(newMemberTarifaViaje3h);       // New Logic
            if (newMemberChoferExtra) newMusician.tarifas.chofer_extra = parseFloat(newMemberChoferExtra);       // New Logic

            await addMusician(newMusician);
            setIsModalOpen(false);
            // Reset ALL fields
            setNewMemberNombre('');
            setNewMemberApellido('');
            setNewMemberApodo('');
            setNewMemberEmail('');
            setNewMemberPhone('');
            setNewMemberCI('');
            setNewMemberFechaNacimiento('');
            setNewMemberFechaIngreso('');
            setNewMemberRole('');
            setNewMemberCategory('musico');
            setNewMemberStatus('activo');
            setNewMemberTarifaDiscoteca('');
            setNewMemberTarifaPrivado('');
            setNewMemberTarifaViaje('');
            setNewMemberTarifaEnsayo('');
            setNewMemberTarifaPrivado3h(''); // Reset
            setNewMemberTarifaViaje3h('');   // Reset
            setNewMemberChoferExtra('');     // Reset
            setNewMemberFormaPago('efectivo');
            setNewMemberCuentaBancaria('');
            setNewMemberNotas('');
        } catch (error) {
            console.error(error);
            alert('Error al agregar integrante');
        }
    };

    const handleUpdateMember = async () => {
        if (!editMember) return;
        try {
            const updates: any = {
                nombre: editMember.nombre,
                category: editMember.category,
                status: editMember.status,
                tarifas: editMember.tarifas,
            };

            // Solo agregar campos opcionales si tienen valor
            if (editMember.apellido) updates.apellido = editMember.apellido;
            if (editMember.apodo) updates.apodo = editMember.apodo;
            if (editMember.email) updates.email = editMember.email;
            if (editMember.phone) updates.phone = editMember.phone;
            if (editMember.ci) updates.ci = editMember.ci;
            if (editMember.fechaNacimiento) updates.fechaNacimiento = editMember.fechaNacimiento;
            if (editMember.fechaIngreso) updates.fechaIngreso = editMember.fechaIngreso;
            if (editMember.role) updates.role = editMember.role;
            if (editMember.formaPago) updates.formaPago = editMember.formaPago;
            if (editMember.cuentaBancaria) updates.cuentaBancaria = editMember.cuentaBancaria;
            if (editMember.notas) updates.notas = editMember.notas;

            await updateMusician(editMember.id, updates);
            setEditMember(null);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        }
    };

    const handleDeleteMember = async () => {
        if (!deleteMember) return;
        try {
            if (deleteMember.status === 'inactivo') {
                // HARD DELETE: Permanently remove if already inactive
                await removeMusician(deleteMember.id);
            } else {
                // SOFT DELETE: Change status to 'inactivo'
                await updateMusician(deleteMember.id, { status: 'inactivo' });
            }
            setDeleteMember(null);
        } catch (error) {
            console.error(error);
            alert('Error al procesar la baja');
        }
    };


    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const filteredMusicians = musicians.filter(m => {
        // 1. GLOBAL SEARCH (Overrides everything if active)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const fullName = `${m.nombre} ${m.apellido || ''}`.toLowerCase();
            const nickname = m.apodo?.toLowerCase() || '';
            const role = m.role?.toLowerCase() || '';

            return fullName.includes(query) ||
                nickname.includes(query) ||
                role.includes(query) ||
                m.ci?.includes(query);
        }

        // 2. NORMAL FILTERS (If not searching)

        // Special tab for Inactive members
        if (selectedFilter === 'Inactivos') return m.status === 'inactivo';

        // For all other tabs, EXCLUDE inactive members
        if (m.status === 'inactivo') return false;

        if (selectedFilter === 'Todos') return true;
        if (selectedFilter === 'Músicos') return m.category === 'musico';
        if (selectedFilter === 'Staff') return m.category === 'staff';
        if (selectedFilter === 'Choferes') return m.category === 'chofer';
        if (selectedFilter === 'Cámaras') return m.category === 'camara';
        if (selectedFilter === 'Administradores') return m.category === 'administrador';
        return true;
    });

    return (
        <div className="relative z-10 min-h-screen pb-20">
            {/* Header Glass */}
            <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between shrink-0">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 group">
                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back_ios_new</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Equipo Sabor Real</span>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-text-flow">Integrantes</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center size-10 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary transition-all hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <span className="material-symbols-outlined text-2xl">add</span>
                </button>
            </header>

            <div className="px-4 py-6 space-y-6">
                {/* Search Bar - Glass */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-black/60 transition-all shadow-lg"
                        placeholder="Buscar por nombre, apodo, rol o CI..."
                        type="text"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['Todos', 'Músicos', 'Staff', 'Choferes', 'Cámaras', 'Administradores', 'Inactivos'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-full whitespace-nowrap transition-all border ${selectedFilter === filter
                                ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}>
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Musician List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-gray-400 text-sm font-medium animate-pulse">Cargando equipo...</p>
                        </div>
                    ) : filteredMusicians.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-white/30 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5">
                            <span className="material-symbols-outlined text-5xl mb-3 opacity-50">group_off</span>
                            <p className="text-sm font-medium">No se encontraron integrantes</p>
                        </div>
                    ) : (
                        filteredMusicians.map(member => {
                            // Calcular deuda total (Total Ganado - Total Pagado - Deuda del músico al grupo)
                            const totalEarned = events.reduce((sum, event) => {
                                const assigned = event.musicosAsignados.find(
                                    m => m.musicianId === member.id && m.asistio
                                );
                                return sum + (assigned ? assigned.montoPagar : 0);
                            }, 0);

                            const totalPaid = payments
                                .filter(p => p.musicianId === member.id)
                                .reduce((sum, p) => sum + p.monto, 0);

                            const balance = totalEarned - totalPaid; // Positive: User owes Musician. Negative: Musician owes User.

                            return (
                                <div key={member.id} className={`group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-4 transition-all hover:bg-white/5 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] ${openMenuId === member.id ? 'z-50' : 'z-0'} ${member.status === 'inactivo' ? 'grayscale opacity-75' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="size-16 rounded-full p-[2px] bg-gradient-to-br from-primary via-purple-500 to-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                                <div className="w-full h-full rounded-full bg-gray-900 bg-cover bg-center border-2 border-black"
                                                    style={{ backgroundImage: `url("${member.imageUrl || '/assets/default_avatar.webp'}")` }}>
                                                </div>
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-4 h-4 border-[3px] border-black rounded-full shadow-sm ${member.status === 'activo' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : member.status === 'vacaciones' ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-base font-bold text-white truncate drop-shadow-md">
                                                    {member.nombre} {member.apellido || ''}
                                                </h3>
                                                <button
                                                    onClick={() => toggleMenu(member.id)}
                                                    className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap text-xs">
                                                {member.apodo && (
                                                    <span className="text-purple-300/80 font-medium italic">"{member.apodo}"</span>
                                                )}

                                                {member.role && (
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium uppercase tracking-wider text-[10px]">
                                                        {member.role}
                                                    </span>
                                                )}

                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold text-[10px] tracking-wide shadow-lg ${balance > 0
                                                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                                    : balance < 0
                                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                                                        : 'bg-white/5 border-white/10 text-gray-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${balance !== 0 ? 'animate-pulse' : ''} ${balance > 0 ? 'bg-yellow-500' : balance < 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                                    {balance > 0
                                                        ? `Le debes: ${balance} Bs`
                                                        : balance < 0
                                                            ? `Te debe: ${Math.abs(balance)} Bs`
                                                            : 'Saldado'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    {openMenuId === member.id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                            <div className="absolute right-4 top-14 w-48 bg-[#1a1025] border border-primary/20 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl ring-1 ring-white/10 animate-scale-in origin-top-right">
                                                <button
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setEditMember(member);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/10 transition-colors text-white group">
                                                    <span className="material-symbols-outlined text-lg text-primary group-hover:scale-110 transition-transform">edit</span>
                                                    <span className="text-sm font-medium">Editar</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setHistoryMember(member);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-blue-300 group">
                                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform text-blue-400">history_edu</span>
                                                    <span className="text-sm font-medium">Historial</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        navigate('/finance', { state: { musicianId: member.id } });
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-green-300 group">
                                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform text-green-400">payments</span>
                                                    <span className="text-sm font-medium">Pagar</span>
                                                </button>



                                                <div className="h-px bg-white/5 mx-2"></div>
                                                <button
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setDeleteMember(member);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 transition-colors text-red-400 group">
                                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">delete</span>
                                                    <span className="text-sm font-medium">{member.status === 'inactivo' ? 'Eliminar Definitivamente' : 'Dar de Baja'}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Musician Modal - FORMULARIO COMPLETO */}
            {/* Add Musician Modal - Neon Glass */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full sm:max-w-2xl bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-scale-in will-change-transform">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Nuevo Integrante</h2>
                                <p className="text-xs text-gray-400 font-medium">Complete la información del personal</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">

                            {/* Personal Info Group */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-primary/50"></span>
                                    Información Personal
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Nombre *</label>
                                        <input
                                            type="text"
                                            value={newMemberNombre}
                                            onChange={(e) => setNewMemberNombre(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                            placeholder="Ej: Juan Carlos"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Apellido</label>
                                        <input
                                            type="text"
                                            value={newMemberApellido}
                                            onChange={(e) => setNewMemberApellido(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                            placeholder="Ej: Mamani"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Apodo (Alias)</label>
                                        <input
                                            type="text"
                                            value={newMemberApodo}
                                            onChange={(e) => setNewMemberApodo(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                            placeholder="Ej: El Tigre"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">C.I.</label>
                                        <input
                                            type="text"
                                            value={newMemberCI}
                                            onChange={(e) => setNewMemberCI(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                            placeholder="Carnet de Identidad"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={newMemberPhone}
                                            onChange={(e) => setNewMemberPhone(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                            placeholder="Celular"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Fecha Nacimiento</label>
                                        <input
                                            type="date"
                                            value={newMemberFechaNacimiento}
                                            onChange={(e) => setNewMemberFechaNacimiento(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium dark-date-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Work Info Group */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-blue-500/50"></span>
                                    Datos Laborales
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Categoría</label>
                                        <div className="relative">
                                            <select
                                                value={newMemberCategory}
                                                onChange={(e) => setNewMemberCategory(e.target.value as Musician['category'])}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 appearance-none transition-all font-medium">
                                                <option value="musico" className="bg-gray-900">Músico</option>
                                                <option value="staff" className="bg-gray-900">Staff</option>
                                                <option value="chofer" className="bg-gray-900">Chofer</option>
                                                <option value="camara" className="bg-gray-900">Cámara</option>
                                                <option value="administrador" className="bg-gray-900">Administrador</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-3 text-gray-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Estado</label>
                                        <div className="relative">
                                            <select
                                                value={newMemberStatus}
                                                onChange={(e) => setNewMemberStatus(e.target.value as Musician['status'])}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 appearance-none transition-all font-medium">
                                                <option value="activo" className="bg-gray-900">Activo</option>
                                                <option value="inactivo" className="bg-gray-900">Inactivo</option>
                                                <option value="vacaciones" className="bg-gray-900">Vacaciones</option>
                                                <option value="suspendido" className="bg-gray-900">Suspendido</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-3 text-gray-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400 ml-1">Rol / Instrumento</label>
                                    <input
                                        type="text"
                                        value={newMemberRole}
                                        onChange={(e) => setNewMemberRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                        placeholder="Ej: Timbales, Primera Voz, Logística"
                                    />
                                </div>
                            </div>

                            {/* Rates Group */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-emerald-500/50"></span>
                                    Tarifas (Bs)
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Discoteca</label>
                                        <input
                                            type="number"
                                            value={newMemberTarifaDiscoteca}
                                            onChange={(e) => setNewMemberTarifaDiscoteca(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Privado</label>
                                        <input
                                            type="number"
                                            value={newMemberTarifaPrivado}
                                            onChange={(e) => setNewMemberTarifaPrivado(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Viaje</label>
                                        <input
                                            type="number"
                                            value={newMemberTarifaViaje}
                                            onChange={(e) => setNewMemberTarifaViaje(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Ensayo</label>
                                        <input
                                            type="number"
                                            value={newMemberTarifaEnsayo}
                                            onChange={(e) => setNewMemberTarifaEnsayo(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Privado (3 Horas)</label>
                                        <input
                                            type="number"
                                            value={newMemberTarifaPrivado3h}
                                            onChange={(e) => setNewMemberTarifaPrivado3h(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Extra Chofer (2do Evento)</label>
                                        <input
                                            type="number"
                                            value={newMemberChoferExtra}
                                            onChange={(e) => setNewMemberChoferExtra(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Viaje (3 Horas)</label>
                                        <input
                                            type="number"
                                            value={newMemberTarifaViaje3h}
                                            onChange={(e) => setNewMemberTarifaViaje3h(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 mt-auto bg-black/40">
                            <button
                                onClick={handleAddMember}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">person_add</span>
                                Registrar Integrante
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Modal - Neon Glass */}
            {editMember && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setEditMember(null)} />
                    <div className="relative w-full sm:max-w-2xl bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-scale-in will-change-transform">

                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Editar Integrante</h2>
                                <p className="text-xs text-gray-400 font-medium">{editMember.nombre} {editMember.apellido}</p>
                            </div>
                            <button
                                onClick={() => setEditMember(null)}
                                className="size-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
                            {/* Personal Info Group */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-primary/50"></span>
                                    Información
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Nombre</label>
                                        <input type="text" value={editMember.nombre} onChange={(e) => setEditMember({ ...editMember, nombre: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Apellido</label>
                                        <input type="text" value={editMember.apellido || ''} onChange={(e) => setEditMember({ ...editMember, apellido: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400 ml-1">Rol / Instrumento</label>
                                    <input type="text" value={editMember.role || ''} onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>

                            {/* Rates Group */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-[1px] bg-emerald-500/50"></span>
                                    Tarifas
                                    <span className="flex-1 h-[1px] bg-white/5"></span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Discoteca</label>
                                        <input type="number" value={editMember.tarifas.discoteca} onChange={(e) => setEditMember({ ...editMember, tarifas: { ...editMember.tarifas, discoteca: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-right" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Privado</label>
                                        <input type="number" value={editMember.tarifas.privado} onChange={(e) => setEditMember({ ...editMember, tarifas: { ...editMember.tarifas, privado: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-right" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Viaje</label>
                                        <input type="number" value={editMember.tarifas.viaje} onChange={(e) => setEditMember({ ...editMember, tarifas: { ...editMember.tarifas, viaje: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-right" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Ensayo</label>
                                        <input type="number" value={editMember.tarifas.ensayo || 0} onChange={(e) => setEditMember({ ...editMember, tarifas: { ...editMember.tarifas, ensayo: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-right" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Privado (3 Horas)</label>
                                        <input type="number" value={editMember.tarifas.privado_3h || 0} onChange={(e) => setEditMember({ ...editMember, tarifas: { ...editMember.tarifas, privado_3h: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-right" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Viaje (3 Horas)</label>
                                        <input type="number" value={editMember.tarifas.viaje_3h || 0} onChange={(e) => setEditMember({ ...editMember, tarifas: { ...editMember.tarifas, viaje_3h: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-right" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Extra Chofer (2do Evento)</label>
                                        <input type="number" value={editMember.tarifas.chofer_extra || 0} onChange={(e) => setEditMember({ ...editMember, tarifas: { ...editMember.tarifas, chofer_extra: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-right" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 mt-auto bg-black/40">
                            <button onClick={handleUpdateMember}
                                className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation - Neon Glass */}
            {deleteMember && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setDeleteMember(null)} />
                    <div className="relative w-full max-w-sm bg-[#150a1b] rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.2)] border border-red-500/20 p-6 space-y-6 animate-scale-in will-change-transform">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <span className="material-symbols-outlined text-red-500 text-4xl animate-pulse">warning</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Integrante?</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Estás a punto de dar de baja a <span className="text-white font-bold">{deleteMember.nombre}</span>.
                                    {deleteMember.status === 'inactivo'
                                        ? " Esta acción pasará el usuario a inactivo y ocultará su historial de la vista principal."
                                        : " Sus datos financieros se conservarán en el historial, pero ya no aparecerá en las listas activas."}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDeleteMember(null)}
                                className="py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition-colors border border-white/5">
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteMember}
                                className="py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:scale-105 active:scale-95">
                                Sí, dar de baja
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* History Modal - Neon Glass */}
            {historyMember && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setHistoryMember(null)} />
                    <div className="relative w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-scale-in will-change-transform">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0 bg-white/5">
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">history_edu</span>
                                    Estado de Cuenta
                                </h2>
                                <p className="text-xs text-blue-200/70 font-medium ml-7">{historyMember.nombre} {historyMember.apellido}</p>
                            </div>
                            <button
                                onClick={() => setHistoryMember(null)}
                                className="size-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                            {(() => {
                                // 1. Get all events attended by this musician
                                const attendedEvents = events
                                    .filter(e => e.musicosAsignados.some(m => m.musicianId === historyMember.id && m.asistio))
                                    .map(e => ({
                                        type: 'earning',
                                        subtype: 'event',
                                        date: e.date,
                                        title: `Evento: ${e.title}`,
                                        amount: e.musicosAsignados.find(m => m.musicianId === historyMember.id)?.montoPagar || 0,
                                        id: e.id,
                                        description: 'Trabajo realizado'
                                    }));

                                // 2. Get all payments made to this musician
                                const memberPayments = payments
                                    .filter(p => p.musicianId === historyMember.id)
                                    .map(p => ({
                                        type: 'payment',
                                        subtype: p.tipo.toLowerCase(), // 'evento', 'adelanto', etc.
                                        date: p.fecha,
                                        title: `Pago: ${p.tipo}`,
                                        amount: p.monto,
                                        id: p.id,
                                        description: p.metodoPago
                                    }));

                                // 3. Merge and sort chronological (Oldest first for running balance)
                                const history = [...attendedEvents, ...memberPayments]
                                    .sort((a, b) => {
                                        const dateCompare = a.date.localeCompare(b.date);
                                        if (dateCompare !== 0) return dateCompare;

                                        // Same date logic:
                                        // 1. Adelantos (Advances) come FIRST (before the event)
                                        // 2. Events (Earnings) come MIDDLE
                                        // 3. Regular Payments (Pagos) come LAST (after the event)

                                        const getOrder = (item: typeof attendedEvents[0] | typeof memberPayments[0]) => {
                                            if (item.type === 'payment' && item.subtype.includes('adelanto')) return 0;
                                            if (item.type === 'earning') return 1;
                                            return 2;
                                        };

                                        return getOrder(a) - getOrder(b);
                                    });

                                let runningBalance = 0;

                                if (history.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-12 text-white/30">
                                            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined text-3xl opacity-50">receipt_long</span>
                                            </div>
                                            <p className="text-sm font-medium">Sin movimientos registrados</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3">
                                        {history.map((item) => {
                                            if (item.type === 'earning') {
                                                runningBalance += item.amount;
                                            } else {
                                                runningBalance -= item.amount;
                                            }



                                            return (
                                                <div key={`${item.type}-${item.id}`} className="group relative flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                    {/* Vertical Line Connector (Optional Visual) */}

                                                    {/* Icon */}
                                                    <div className={`mt-0.5 size-9 rounded-full flex items-center justify-center border shrink-0 shadow-lg ${item.type === 'earning'
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-lg">
                                                            {item.type === 'earning' ? 'work' : 'payments'}
                                                        </span>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-white leading-tight capitalize">
                                                                    {item.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 font-medium uppercase tracking-wider">
                                                                        {item.description}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500">{item.date}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`text-sm font-bold tracking-tight ${item.type === 'earning' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                    {item.type === 'earning' ? '+' : '-'}{item.amount}
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer Summary */}
                        <div className="p-5 bg-[#0f0f0f] border-t border-white/10 shrink-0 z-20">
                            {(() => {
                                const totalEarned = events.reduce((sum, e) => {
                                    const assigned = e.musicosAsignados.find(m => m.musicianId === historyMember.id && m.asistio);
                                    return sum + (assigned ? assigned.montoPagar : 0);
                                }, 0);
                                const totalPaid = payments.filter(p => p.musicianId === historyMember.id).reduce((sum, p) => sum + p.monto, 0);
                                const finalBalance = totalEarned - totalPaid;

                                return (
                                    <div className="space-y-4">
                                        {/* Summary Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                <div className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider mb-1">Total Ganado</div>
                                                <div className="text-lg font-bold text-emerald-400">{totalEarned} Bs</div>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                                                <div className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider mb-1">Total Recibido</div>
                                                <div className="text-lg font-bold text-red-400">{totalPaid} Bs</div>
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${finalBalance > 0
                                            ? 'bg-yellow-500/10 border-yellow-500/30'
                                            : finalBalance < 0
                                                ? 'bg-blue-500/10 border-blue-500/30'
                                                : 'bg-white/5 border-white/10'
                                            }`}>
                                            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${finalBalance > 0 ? 'bg-yellow-500 text-black' : finalBalance < 0 ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                                                }`}>
                                                <span className="material-symbols-outlined text-2xl">
                                                    {finalBalance > 0 ? 'priority_high' : finalBalance < 0 ? 'savings' : 'check'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${finalBalance > 0 ? 'text-yellow-400' : finalBalance < 0 ? 'text-blue-300' : 'text-gray-400'
                                                    }`}>
                                                    ESTADO ACTUAL
                                                </div>
                                                <div className="text-sm font-medium text-white leading-tight">
                                                    {finalBalance > 0 ? (
                                                        <>El grupo le debe <span className="text-lg font-bold text-yellow-400 mx-1">{finalBalance} Bs</span> al músico</>
                                                    ) : finalBalance < 0 ? (
                                                        <>El músico le debe <span className="text-lg font-bold text-blue-300 mx-1">{Math.abs(finalBalance)} Bs</span> al grupo</>
                                                    ) : (
                                                        <span className="text-gray-300">Cuentas saldadas (0 Bs)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
