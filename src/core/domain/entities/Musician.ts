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
        privado_3h?: number;
        viaje_3h?: number;
        viaje_discoteca?: number;
        chofer_extra?: number; // Tarifa reducida para 2do evento en ciudad (Choferes)
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
