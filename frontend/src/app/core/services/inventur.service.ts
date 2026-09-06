import { Injectable, inject, signal } from '@angular/core';
import { Inventur, InventurEintrag } from '../models/warenwirtschaft.model';
import { MOCK_INVENTUREINTRAEGE, MOCK_INVENTUREN } from '../mock/mock-data';
import { ArtikelService } from './artikel.service';

@Injectable({ providedIn: 'root' })
export class InventurService {
  private readonly artikelService = inject(ArtikelService);

  private readonly inventurenSignal = signal<Inventur[]>(MOCK_INVENTUREN);
  readonly inventuren = this.inventurenSignal.asReadonly();

  private readonly eintraegeSignal = signal<InventurEintrag[]>(MOCK_INVENTUREINTRAEGE);
  readonly eintraege = this.eintraegeSignal.asReadonly();

  private nextInventurId = Math.max(0, ...MOCK_INVENTUREN.map((i) => i.id)) + 1;
  private nextEintragId = Math.max(0, ...MOCK_INVENTUREINTRAEGE.map((e) => e.id)) + 1;

  getForFiliale(filialeId: number): Inventur[] {
    return this.inventurenSignal()
      .filter((i) => i.filialeId === filialeId)
      .sort((a, b) => b.stichtag.localeCompare(a.stichtag));
  }

  getLaufendeFuerFiliale(filialeId: number): Inventur | undefined {
    return this.inventurenSignal().find((i) => i.filialeId === filialeId && i.status === 'LAUFEND');
  }

  getById(id: number): Inventur | undefined {
    return this.inventurenSignal().find((i) => i.id === id);
  }

  getEintraege(inventurId: number): InventurEintrag[] {
    return this.eintraegeSignal().filter((e) => e.inventurId === inventurId);
  }

  starten(filialeId: number, erstelltVon: number): Inventur {
    const neu: Inventur = {
      id: this.nextInventurId++,
      filialeId,
      stichtag: new Date().toISOString(),
      status: 'LAUFEND',
      erstelltVon,
    };
    this.inventurenSignal.update((list) => [...list, neu]);

    const neueEintraege: InventurEintrag[] = this.artikelService.artikel().map((a) => ({
      id: this.nextEintragId++,
      inventurId: neu.id,
      artikelId: a.id,
      sollMenge: this.artikelService.getBestand(a.id, filialeId),
      istMenge: null,
    }));
    this.eintraegeSignal.update((list) => [...list, ...neueEintraege]);
    return neu;
  }

  zaehlungErfassen(eintragId: number, istMenge: number): void {
    this.eintraegeSignal.update((list) =>
      list.map((e) => (e.id === eintragId ? { ...e, istMenge } : e)),
    );
  }

  abschliessen(inventurId: number): void {
    const inventur = this.getById(inventurId);
    if (!inventur) {
      return;
    }
    for (const eintrag of this.getEintraege(inventurId)) {
      if (eintrag.istMenge !== null) {
        this.artikelService.setBestand(eintrag.artikelId, inventur.filialeId, eintrag.istMenge);
      }
    }
    this.inventurenSignal.update((list) =>
      list.map((i) => (i.id === inventurId ? { ...i, status: 'ABGESCHLOSSEN' } : i)),
    );
  }
}
