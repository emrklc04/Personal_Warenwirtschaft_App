import { Injectable, signal } from '@angular/core';
import { Filiale } from '../models/personal.model';
import { MOCK_FILIALEN } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class FilialeService {
  private readonly filialenSignal = signal<Filiale[]>(MOCK_FILIALEN);
  readonly filialen = this.filialenSignal.asReadonly();

  getById(id: number): Filiale | undefined {
    return this.filialenSignal().find((f) => f.id === id);
  }
}
