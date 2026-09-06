import { Injectable, inject, signal } from '@angular/core';
import { Abschreibung, AbschreibungGrund } from '../models/warenwirtschaft.model';
import { MOCK_ABSCHREIBUNGEN } from '../mock/mock-data';
import { ArtikelService } from './artikel.service';

export interface NeueAbschreibung {
  filialeId: number;
  artikelId: number;
  menge: number;
  grund: AbschreibungGrund;
  bemerkung: string;
  erstelltVon: number;
}

@Injectable({ providedIn: 'root' })
export class AbschreibungService {
  private readonly artikelService = inject(ArtikelService);

  private readonly abschreibungenSignal = signal<Abschreibung[]>(MOCK_ABSCHREIBUNGEN);
  readonly abschreibungen = this.abschreibungenSignal.asReadonly();

  private nextId = Math.max(0, ...MOCK_ABSCHREIBUNGEN.map((a) => a.id)) + 1;

  getForFiliale(filialeId: number): Abschreibung[] {
    return this.abschreibungenSignal()
      .filter((a) => a.filialeId === filialeId)
      .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
  }

  buchen(input: NeueAbschreibung): void {
    const neu: Abschreibung = {
      id: this.nextId++,
      erstelltAm: new Date().toISOString(),
      ...input,
    };
    this.abschreibungenSignal.update((list) => [...list, neu]);
    this.artikelService.bestandAendern(input.artikelId, input.filialeId, -input.menge);
  }
}
