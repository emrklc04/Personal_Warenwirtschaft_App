import { Injectable, signal } from '@angular/core';
import { Mitarbeiter, Rolle } from '../models/personal.model';
import { MOCK_MITARBEITER } from '../mock/mock-data';

export interface NeuerMitarbeiter {
  benutzername: string;
  vorname: string;
  nachname: string;
  email: string;
  position: string;
  rollen: Rolle[];
  filialeId: number;
  urlaubsanspruchTage: number;
}

@Injectable({ providedIn: 'root' })
export class MitarbeiterService {
  private readonly mitarbeiterSignal = signal<Mitarbeiter[]>(MOCK_MITARBEITER);
  readonly mitarbeiter = this.mitarbeiterSignal.asReadonly();

  private nextId = Math.max(0, ...MOCK_MITARBEITER.map((m) => m.id)) + 1;

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

  anlegen(input: NeuerMitarbeiter): Mitarbeiter {
    const neu: Mitarbeiter = {
      id: this.nextId++,
      eintrittsdatum: new Date().toISOString().slice(0, 10),
      aktiv: true,
      ...input,
    };
    this.mitarbeiterSignal.update((list) => [...list, neu]);
    return neu;
  }

  setAktiv(mitarbeiterId: number, aktiv: boolean): void {
    this.mitarbeiterSignal.update((list) =>
      list.map((m) => (m.id === mitarbeiterId ? { ...m, aktiv } : m)),
    );
  }
}
