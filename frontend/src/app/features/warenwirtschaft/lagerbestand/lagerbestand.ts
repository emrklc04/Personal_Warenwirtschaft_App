import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ArtikelService } from '../../../core/services/artikel.service';

interface BestandZeile {
  artikelId: number;
  bezeichnung: string;
  einheit: string;
  preis: number;
  bestand: number;
  mindestbestand: number;
  unterMindestbestand: boolean;
}

@Component({
  selector: 'app-lagerbestand',
  imports: [CurrencyPipe],
  templateUrl: './lagerbestand.html',
  styleUrl: './lagerbestand.css',
})
export class Lagerbestand {
  private readonly authService = inject(AuthService);
  private readonly artikelService = inject(ArtikelService);

  protected readonly filialeId = computed(() => this.authService.currentUser()?.filialeId ?? null);

  protected readonly zeilen = computed<BestandZeile[]>(() => {
    const filialeId = this.filialeId();
    if (filialeId === null) {
      return [];
    }
    return this.artikelService
      .artikel()
      .map((a) => {
        const bestand = this.artikelService.getBestand(a.id, filialeId);
        return {
          artikelId: a.id,
          bezeichnung: a.bezeichnung,
          einheit: a.einheit,
          preis: a.preis,
          bestand,
          mindestbestand: a.mindestbestand,
          unterMindestbestand: bestand < a.mindestbestand,
        };
      })
      .sort((a, b) => Number(b.unterMindestbestand) - Number(a.unterMindestbestand));
  });

  protected readonly anzahlUnterMindestbestand = computed(
    () => this.zeilen().filter((z) => z.unterMindestbestand).length,
  );

  protected readonly gesamtwert = computed(() =>
    this.zeilen().reduce((summe, z) => summe + z.bestand * z.preis, 0),
  );
}
