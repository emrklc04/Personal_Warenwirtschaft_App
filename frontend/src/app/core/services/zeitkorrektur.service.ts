import { Injectable, inject, signal } from '@angular/core';
import { KorrekturStatus, Korrekturantrag } from '../models/personal.model';
import { MOCK_KORREKTURANTRAEGE } from '../mock/mock-data';
import { ZeiterfassungService } from './zeiterfassung.service';

export interface NeuerKorrekturantrag {
  arbeitszeiteintragId: number;
  mitarbeiterId: number;
  gewuenschtesKommen: string;
  gewuenschtesGehen: string | null;
  grund: string;
}

@Injectable({ providedIn: 'root' })
export class ZeitkorrekturService {
  private readonly zeiterfassungService = inject(ZeiterfassungService);

  private readonly antraegeSignal = signal<Korrekturantrag[]>(MOCK_KORREKTURANTRAEGE);
  readonly antraege = this.antraegeSignal.asReadonly();

  private nextId = Math.max(0, ...MOCK_KORREKTURANTRAEGE.map((a) => a.id)) + 1;

  getForMitarbeiter(mitarbeiterId: number): Korrekturantrag[] {
    return this.antraegeSignal()
      .filter((a) => a.mitarbeiterId === mitarbeiterId)
      .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
  }

  getOffeneFuerMitarbeiterIds(mitarbeiterIds: number[]): Korrekturantrag[] {
    return this.antraegeSignal()
      .filter((a) => a.status === 'OFFEN' && mitarbeiterIds.includes(a.mitarbeiterId))
      .sort((a, b) => a.erstelltAm.localeCompare(b.erstelltAm));
  }

  beantragen(input: NeuerKorrekturantrag): void {
    const neu: Korrekturantrag = {
      id: this.nextId++,
      status: 'OFFEN',
      erstelltAm: new Date().toISOString(),
      bearbeitetVon: null,
      bearbeitetAm: null,
      ...input,
    };
    this.antraegeSignal.update((list) => [...list, neu]);
  }

  genehmigen(id: number, bearbeiterId: number): void {
    const antrag = this.antraegeSignal().find((a) => a.id === id);
    if (!antrag) {
      return;
    }
    this.zeiterfassungService.updateZeiten(
      antrag.arbeitszeiteintragId,
      antrag.gewuenschtesKommen,
      antrag.gewuenschtesGehen,
    );
    this.setStatus(id, 'GENEHMIGT', bearbeiterId);
  }

  ablehnen(id: number, bearbeiterId: number): void {
    this.setStatus(id, 'ABGELEHNT', bearbeiterId);
  }

  private setStatus(id: number, status: KorrekturStatus, bearbeiterId: number): void {
    this.antraegeSignal.update((list) =>
      list.map((a) =>
        a.id === id ? { ...a, status, bearbeitetVon: bearbeiterId, bearbeitetAm: new Date().toISOString() } : a,
      ),
    );
  }
}
