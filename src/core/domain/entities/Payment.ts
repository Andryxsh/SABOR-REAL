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

