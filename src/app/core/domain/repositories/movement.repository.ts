import { Observable } from 'rxjs';
import { Movement } from '../entities/movement.entity';

export interface MovementsQuery {
    search?: string;
    direction?: 'entrada' | 'salida';
    type?: 'compra' | 'venta' | 'manual' | 'sistema';
    sortBy?: 'date' | 'productName' | 'productSku' | 'quantity' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface MovementMonthlyStats {
    totalEntradas: number;
    totalSalidas: number;
    totalMovements: number;
}

export interface MovementsListResponse {
    movements: Movement[];
    total: number;
}

export abstract class MovementRepository {
    abstract getMovements(query?: MovementsQuery): Observable<MovementsListResponse>;
    abstract getMonthlyStats(): Observable<MovementMonthlyStats>;
    abstract createMovement(movement: Partial<Movement>): Observable<Movement>;
}
