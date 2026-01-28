export interface Event {
    id: string;

    // Básico
    title: string;
    type: 'discoteca' | 'privado' | 'viaje' | 'ensayo' | 'privado_3h' | 'viaje_3h' | 'viaje_discoteca';
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
