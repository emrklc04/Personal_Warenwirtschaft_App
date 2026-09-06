import { Injectable, inject, signal } from '@angular/core';
import { Bestellung } from '../models/warenwirtschaft.model';
import { MOCK_BESTELLUNGEN } from '../mock/mock-data';
import { ArtikelService } from './artikel.service';

export interface NeueBestellung {
  filialeId: number;
  artikelId: number;
  menge: number;
  bestelltVon: number;
}

@Injectable({ providedIn: 'root' })
export class BestellungService {
  private readonly artikelService = inject(ArtikelService);

  private readonly bestellungenSignal = signal<Bestellung[]>(MOCK_BESTELLUNGEN);
  readonly bestellungen = this.bestellungenSignal.asReadonly();

  private nextId = Math.max(0, ...MOCK_BESTELLUNGEN.map((b) => b.id)) + 1;

  getForFiliale(filialeId: number): Bestellung[] {
    return this.bestellungenSignal()
      .filter((b) => b.filialeId === filialeId)
      .sort((a, b) => b.bestelltAm.localeCompare(a.bestelltAm));
  }

  bestellen(input: NeueBestellung): void {
    const neu: Bestellung = {
      id: this.nextId++,
      status: 'OFFEN',
      bestelltAm: new Date().toISOString(),
      eingetroffenAm: null,
      ...input,
    };
    this.bestellungenSignal.update((list) => [...list, neu]);
  }

  wareneingangBuchen(bestellungId: number): void {
    const bestellung = this.bestellungenSignal().find((b) => b.id === bestellungId);
    if (!bestellung || bestellung.status === 'EINGETROFFEN') {
      return;
    }
    this.artikelService.bestandAendern(bestellung.artikelId, bestellung.filialeId, bestellung.menge);
    this.bestellungenSignal.update((list) =>
      list.map((b) =>
        b.id === bestellungId
          ? { ...b, status: 'EINGETROFFEN', eingetroffenAm: new Date().toISOString() }
          : b,
      ),
    );
  }
}
