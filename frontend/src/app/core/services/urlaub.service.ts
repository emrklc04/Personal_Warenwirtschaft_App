import { Injectable, signal } from '@angular/core';
import { UrlaubStatus, Urlaubsantrag } from '../models/personal.model';
import { MOCK_URLAUBSANTRAEGE } from '../mock/mock-data';

export interface NeuerUrlaubsantrag {
  mitarbeiterId: number;
  von: string;
  bis: string;
  kommentar: string;
}

const MILLISEKUNDEN_PRO_TAG = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class UrlaubService {
  private readonly antraegeSignal = signal<Urlaubsantrag[]>(MOCK_URLAUBSANTRAEGE);
  readonly antraege = this.antraegeSignal.asReadonly();

  private nextId = Math.max(0, ...MOCK_URLAUBSANTRAEGE.map((a) => a.id)) + 1;

  getForMitarbeiter(mitarbeiterId: number): Urlaubsantrag[] {
    return this.antraegeSignal()
      .filter((a) => a.mitarbeiterId === mitarbeiterId)
      .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
  }

  getOffeneFuerMitarbeiterIds(mitarbeiterIds: number[]): Urlaubsantrag[] {
    return this.antraegeSignal()
      .filter((a) => a.status === 'OFFEN' && mitarbeiterIds.includes(a.mitarbeiterId))
      .sort((a, b) => a.von.localeCompare(b.von));
  }

  genommeneTage(mitarbeiterId: number): number {
    return this.antraegeSignal()
      .filter((a) => a.mitarbeiterId === mitarbeiterId && a.status === 'GENEHMIGT')
      .reduce((summe, a) => summe + this.tageZaehlen(a.von, a.bis), 0);
  }

  tageZaehlen(von: string, bis: string): number {
    const start = new Date(von).getTime();
    const ende = new Date(bis).getTime();
    return Math.round((ende - start) / MILLISEKUNDEN_PRO_TAG) + 1;
  }

  beantragen(input: NeuerUrlaubsantrag): void {
    const neu: Urlaubsantrag = {
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
    this.setStatus(id, 'GENEHMIGT', bearbeiterId);
  }

  ablehnen(id: number, bearbeiterId: number): void {
    this.setStatus(id, 'ABGELEHNT', bearbeiterId);
  }

  private setStatus(id: number, status: UrlaubStatus, bearbeiterId: number): void {
    this.antraegeSignal.update((list) =>
      list.map((a) =>
        a.id === id
          ? { ...a, status, bearbeitetVon: bearbeiterId, bearbeitetAm: new Date().toISOString() }
          : a,
      ),
    );
  }
}
