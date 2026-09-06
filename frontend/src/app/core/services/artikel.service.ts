import { Injectable, signal } from '@angular/core';
import { Artikel, Lagerbestand } from '../models/warenwirtschaft.model';
import { MOCK_ARTIKEL, MOCK_LAGERBESTAND } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class ArtikelService {
  private readonly artikelSignal = signal<Artikel[]>(MOCK_ARTIKEL);
  readonly artikel = this.artikelSignal.asReadonly();

  private readonly lagerbestandSignal = signal<Lagerbestand[]>(MOCK_LAGERBESTAND);
  readonly lagerbestand = this.lagerbestandSignal.asReadonly();

  getById(id: number): Artikel | undefined {
    return this.artikelSignal().find((a) => a.id === id);
  }

  suche(query: string): Artikel[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.artikelSignal();
    }
    return this.artikelSignal().filter(
      (a) => a.barcode.includes(q) || a.bezeichnung.toLowerCase().includes(q),
    );
  }

  getBestand(artikelId: number, filialeId: number): number {
    return (
      this.lagerbestandSignal().find((l) => l.artikelId === artikelId && l.filialeId === filialeId)
        ?.menge ?? 0
    );
  }

  setBestand(artikelId: number, filialeId: number, menge: number): void {
    this.lagerbestandSignal.update((list) => {
      const exists = list.some((l) => l.artikelId === artikelId && l.filialeId === filialeId);
      if (exists) {
        return list.map((l) =>
          l.artikelId === artikelId && l.filialeId === filialeId ? { ...l, menge } : l,
        );
      }
      return [...list, { artikelId, filialeId, menge }];
    });
  }

  bestandAendern(artikelId: number, filialeId: number, delta: number): void {
    const aktuell = this.getBestand(artikelId, filialeId);
    this.setBestand(artikelId, filialeId, Math.max(0, aktuell + delta));
  }
}
