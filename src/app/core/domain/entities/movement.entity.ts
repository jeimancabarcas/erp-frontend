export type MovementDirection = 'entrada' | 'salida';
export type MovementType = 'compra' | 'venta' | 'manual' | 'sistema';

export interface Movement {
    id: string;
    date: Date;
    productId: string;
    productName?: string;
    productSku?: string;
    direction: MovementDirection;
    type: MovementType;
    quantity: number;
    reference: string;
    notes: string;
    createdAt?: Date;
}
