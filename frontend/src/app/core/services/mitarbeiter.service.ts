import { Injectable, signal } from '@angular/core';
import { Mitarbeiter } from '../models/personal.model';
import { MOCK_MITARBEITER } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class MitarbeiterService {
  private readonly mitarbeiterSignal = signal<Mitarbeiter[]>(MOCK_MITARBEITER);
  readonly mitarbeiter = this.mitarbeiterSignal.asReadonly();

  getById(id: number): Mitarbeiter | undefined {
    return this.mitarbeiterSignal().find((m) => m.id === id);
  }

  getByFiliale(filialeId: number): Mitarbeiter[] {
    return this.mitarbeiterSignal().filter((m) => m.filialeId === filialeId);
  }

  updateEmail(mitarbeiterId: number, email: string): void {
    this.mitarbeiterSignal.update((list) =>
      list.map((m) => (m.id === mitarbeiterId ? { ...m, email } : m)),
    );
  }
}
