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
