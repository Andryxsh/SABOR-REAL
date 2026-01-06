import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy, limit, setDoc } from 'firebase/firestore';


// ============================================
// INTERFACES PROFESIONALES
// ============================================

export interface Musician {
    id: string;

    // Datos Personales
    nombre: string;
    apellido?: string;
    apodo?: string;
    fechaNacimiento?: string;
    ci?: string;
    email?: string;
    phone?: string;
    direccion?: {
        calle?: string;
        ciudad?: string;
        pais?: string;
    };

    // Datos de Trabajo
    category: 'musico' | 'staff' | 'chofer' | 'camara' | 'administrador';
    role?: string;
    fechaIngreso?: string;
    status: 'activo' | 'inactivo' | 'vacaciones' | 'suspendido';

    // Financiero
    tarifas: {
        discoteca: number;
        privado: number;
        viaje: number;
        ensayo?: number;
    };
    formaPago?: 'efectivo' | 'transferencia';
    cuentaBancaria?: string;

    // Administrativo
    imageUrl?: string;
    documentos?: {
        ci_url?: string;
        contrato_url?: string;
        certificadoSalud_url?: string;
    };
    notas?: string;
    debt: number; // Calculado: deuda total acumulada

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface Event {
    id: string;

    // Básico
    title: string;
    type: 'discoteca' | 'privado' | 'viaje' | 'ensayo';
    date: string;
    time: string;
    location: string;

    // Cliente
    cliente?: {
        nombre?: string;
        telefono?: string;
        email?: string;
        empresa?: string;
    };

    // Financiero
    precio: number; // Precio total del evento
    adelanto: number; // Anticipo recibido
    saldo: number; // Saldo pendiente
    gastos: Array<{
        concepto: string;
        monto: number;
        categoria?: 'transporte' | 'alimentacion' | 'equipo' | 'otro';
    }>;

    // Equipo Asignado
    musicosAsignados: Array<{
        musicianId: string;
        asistio: boolean;
        montoPagar: number; // Cuánto se le debe pagar a este músico
        pagado: boolean; // Si ya se le pagó
    }>;

    // Logística
    direccionExacta?: string;
    googleMapsLink?: string;
    horaInicio?: string;
    horaFin?: string;
    equipoNecesario?: string[];

    // Estado
    status: 'Confirmado' | 'Pendiente' | 'Finalizado' | 'Cancelado';
    locked?: boolean;
    notas?: string;
    imageUrl?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    musicianId: string; // Referencia al músico
    eventId?: string; // Opcional: si es pago de un evento específico
    monto: number;
    tipo: 'evento' | 'adelanto' | 'ajuste' | 'descuento';
    fecha: string;
    metodoPago: 'efectivo' | 'transferencia';
    comprobante_url?: string;
    notas?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface Expense {
    id: string;
    concepto: string;
    monto: number;
    categoria: 'transporte' | 'alimentacion' | 'equipo' | 'marketing' | 'administrativo' | 'otro';
    eventId?: string; // Opcional: si está relacionado a un evento
    fecha: string;
    comprobante_url?: string;
    aprobadoPor?: string; // userId de quien autorizó
    notas?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================
// CONTEXT TYPE
// ============================================

interface AppContextType {
    musicians: Musician[];
    events: Event[];
    payments: Payment[];
    expenses: Expense[];
    loading: boolean;

    // Musicians CRUD
    addMusician: (musician: Omit<Musician, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateMusician: (id: string, data: Partial<Musician>) => Promise<void>;
    deleteMusician: (id: string) => Promise<void>;

    // Events CRUD
    addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    // Payments CRUD
    addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
    deletePayment: (id: string) => Promise<void>;

    // Expenses CRUD
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AppProvider({ children }: { children: ReactNode }) {
    const [musicians, setMusicians] = useState<Musician[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔥 AppContext: Initializing Firebase listeners...');

        // Track initialization status of each subscription
        let loaded = { musicians: false, events: false, payments: false, expenses: false };

        const checkLoading = () => {
            if (loaded.musicians && loaded.events && loaded.payments && loaded.expenses) {
                console.log('✅ All collections loaded successfully');
                setLoading(false);
            }
        };

        // Helper to handle load/error
        const markLoaded = (key: keyof typeof loaded) => {
            console.log(`✅ ${key} collection loaded`);
            loaded[key] = true;
            checkLoading();
        };

        // Subscribe to Musicians
        const unsubMusicians = onSnapshot(
            collection(db, 'musicians'),
            (snapshot) => {
                console.log(`📥 Musicians snapshot: ${snapshot.docs.length} docs`);
                const musiciansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Musician[];
                setMusicians(musiciansData);
                markLoaded('musicians');
            },
            (error) => {
                console.error('❌ Error loading musicians:', error);
                markLoaded('musicians'); // Mark loaded anyway to unblock UI
            }
        );

        // Subscribe to Events (Optimized: Last 50 events)
        const qEvents = query(collection(db, 'events'), orderBy('date', 'desc'), limit(50));
        const unsubEvents = onSnapshot(
            qEvents,
            (snapshot) => {
                console.log(`📥 Events snapshot: ${snapshot.docs.length} docs`);
                const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
                setEvents(eventsData);
                markLoaded('events');
            },
            (error) => {
                console.error('❌ Error loading events:', error);
                markLoaded('events');
            }
        );

        // Subscribe to Payments (Optimized: Last 50 payments)
        const qPayments = query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(50));
        const unsubPayments = onSnapshot(
            qPayments,
            (snapshot) => {
                console.log(`📥 Payments snapshot: ${snapshot.docs.length} docs`);
                const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
                setPayments(paymentsData);
                markLoaded('payments');
            },
            (error) => {
                console.error('❌ Error loading payments:', error);
                markLoaded('payments');
            }
        );

        // Subscribe to Expenses (Optimized: Last 50 expenses)
        const qExpenses = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'), limit(50));
        const unsubExpenses = onSnapshot(
            qExpenses,
            (snapshot) => {
                console.log(`📥 Expenses snapshot: ${snapshot.docs.length} docs`);
                const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
                setExpenses(expensesData);
                markLoaded('expenses');
            },
            (error) => {
                console.error('❌ Error loading expenses:', error);
                markLoaded('expenses');
            }
        );

        return () => {
            console.log('🔌 Unsubscribing from Firebase listeners');
            unsubMusicians();
            unsubEvents();
            unsubPayments();
            unsubExpenses();
        };
    }, []);

    // ============================================
    // CRUD OPERATIONS - MUSICIANS (Optimistic Updates)
    // ============================================

    const addMusician = async (musician: Omit<Musician, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        // 1. Generate ID locally
        const newRef = doc(collection(db, 'musicians'));
        const newMusician = {
            id: newRef.id,
            ...musician,
            createdAt: now,
            updatedAt: now
        } as Musician;

        // 2. Optimistic Update
        setMusicians(prev => [...prev, newMusician]);

        // 3. Persist to DB
        await setDoc(newRef, newMusician);
    };

    const updateMusician = async (id: string, data: Partial<Musician>) => {
        const now = new Date().toISOString();
        const updates = { ...data, updatedAt: now };

        // 1. Optimistic Update
        setMusicians(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

        // 2. Persist to DB
        await updateDoc(doc(db, 'musicians', id), updates);
    };

    const deleteMusician = async (id: string) => {
        // 1. Optimistic Update
        setMusicians(prev => prev.filter(m => m.id !== id));

        // 2. Persist to DB
        await deleteDoc(doc(db, 'musicians', id));
    };

    // ============================================
    // CRUD OPERATIONS - EVENTS (Optimistic Updates)
    // ============================================

    const addEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newRef = doc(collection(db, 'events'));
        const newEvent = {
            id: newRef.id,
            ...event,
            createdAt: now,
            updatedAt: now
        } as Event;

        setEvents(prev => [newEvent, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        await setDoc(newRef, newEvent);
    };

    const updateEvent = async (id: string, data: Partial<Event>) => {
        const now = new Date().toISOString();
        const updates = { ...data, updatedAt: now };

        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
        await updateDoc(doc(db, 'events', id), updates);
    };

    const deleteEvent = async (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        await deleteDoc(doc(db, 'events', id));
    };

    // ============================================
    // CRUD OPERATIONS - PAYMENTS (Optimistic Updates)
    // ============================================

    const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newRef = doc(collection(db, 'payments'));
        const newPayment = {
            id: newRef.id,
            ...payment,
            createdAt: now,
            updatedAt: now
        } as Payment;

        setPayments(prev => [newPayment, ...prev]);
        await setDoc(newRef, newPayment);
    };

    const updatePayment = async (id: string, data: Partial<Payment>) => {
        const now = new Date().toISOString();
        const updates = { ...data, updatedAt: now };

        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        await updateDoc(doc(db, 'payments', id), updates);
    };

    const deletePayment = async (id: string) => {
        setPayments(prev => prev.filter(p => p.id !== id));
        await deleteDoc(doc(db, 'payments', id));
    };

    // ============================================
    // CRUD OPERATIONS - EXPENSES (Optimistic Updates)
    // ============================================

    const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newRef = doc(collection(db, 'expenses'));
        const newExpense = {
            id: newRef.id,
            ...expense,
            createdAt: now,
            updatedAt: now
        } as Expense;

        setExpenses(prev => [newExpense, ...prev]);
        await setDoc(newRef, newExpense);
    };

    const updateExpense = async (id: string, data: Partial<Expense>) => {
        const now = new Date().toISOString();
        const updates = { ...data, updatedAt: now };

        setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
        await updateDoc(doc(db, 'expenses', id), updates);
    };

    const deleteExpense = async (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        await deleteDoc(doc(db, 'expenses', id));
    };

    // ============================================
    // PROVIDER VALUE
    // ============================================

    const value = useMemo(() => ({
        musicians,
        events,
        payments,
        expenses,
        loading,
        addMusician,
        updateMusician,
        deleteMusician,
        addEvent,
        updateEvent,
        deleteEvent,
        addPayment,
        updatePayment,
        deletePayment,
        addExpense,
        updateExpense,
        deleteExpense
    }), [musicians, events, payments, expenses, loading]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
