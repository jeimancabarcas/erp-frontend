import { Observable } from 'rxjs';
import { Movement } from '../entities/movement.entity';

export abstract class MovementRepository {
    abstract getMovements(): Observable<Movement[]>;
    abstract createMovement(movement: Partial<Movement>): Observable<Movement>;
}
