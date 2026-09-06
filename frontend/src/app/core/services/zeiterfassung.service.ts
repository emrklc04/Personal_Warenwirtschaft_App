import { Injectable, signal } from '@angular/core';
import { Arbeitszeiteintrag } from '../models/personal.model';
import { MOCK_ARBEITSZEITEINTRAEGE } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class ZeiterfassungService {
  private readonly eintraegeSignal = signal<Arbeitszeiteintrag[]>(MOCK_ARBEITSZEITEINTRAEGE);
  readonly eintraege = this.eintraegeSignal.asReadonly();

  private nextId = Math.max(0, ...MOCK_ARBEITSZEITEINTRAEGE.map((e) => e.id)) + 1;

  getById(id: number): Arbeitszeiteintrag | undefined {
    return this.eintraegeSignal().find((e) => e.id === id);
  }

  getForMitarbeiter(mitarbeiterId: number): Arbeitszeiteintrag[] {
    return this.eintraegeSignal()
      .filter((e) => e.mitarbeiterId === mitarbeiterId)
      .sort((a, b) => b.kommen.localeCompare(a.kommen));
  }

  istEingestempelt(mitarbeiterId: number): boolean {
    return this.eintraegeSignal().some((e) => e.mitarbeiterId === mitarbeiterId && e.gehen === null);
  }

  aktiverEintrag(mitarbeiterId: number): Arbeitszeiteintrag | undefined {
    return this.eintraegeSignal().find((e) => e.mitarbeiterId === mitarbeiterId && e.gehen === null);
  }

  kommen(mitarbeiterId: number): void {
    if (this.istEingestempelt(mitarbeiterId)) {
      return;
    }
    const neu: Arbeitszeiteintrag = {
      id: this.nextId++,
      mitarbeiterId,
      kommen: new Date().toISOString(),
      gehen: null,
    };
    this.eintraegeSignal.update((list) => [...list, neu]);
  }

  gehen(mitarbeiterId: number): void {
    this.eintraegeSignal.update((list) =>
      list.map((e) =>
        e.mitarbeiterId === mitarbeiterId && e.gehen === null
          ? { ...e, gehen: new Date().toISOString() }
          : e,
      ),
    );
  }

  updateZeiten(eintragId: number, kommen: string, gehen: string | null): void {
    this.eintraegeSignal.update((list) =>
      list.map((e) => (e.id === eintragId ? { ...e, kommen, gehen } : e)),
    );
  }
}
