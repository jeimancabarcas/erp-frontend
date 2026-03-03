import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Movement } from '../../domain/entities/movement.entity';
import { MovementRepository } from '../../domain/repositories/movement.repository';

@Injectable({
    providedIn: 'root'
})
export class GetMovementsUseCase {
    private repository = inject(MovementRepository);

    execute(): Observable<Movement[]> {
        return this.repository.getMovements();
    }
}
