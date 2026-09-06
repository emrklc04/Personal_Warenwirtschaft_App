import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArtikelService } from '../../../core/services/artikel.service';
import { AuthService } from '../../../core/services/auth.service';
import { BestellungService } from '../../../core/services/bestellung.service';

@Component({
  selector: 'app-bestellungen',
  imports: [DatePipe, FormsModule],
  templateUrl: './bestellungen.html',
  styleUrl: './bestellungen.css',
})
export class Bestellungen {
  private readonly authService = inject(AuthService);
  private readonly artikelService = inject(ArtikelService);
  private readonly bestellungService = inject(BestellungService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly kannVerwalten = computed(() =>
    this.authService.hasAnyRole('FILIALLEITER', 'ADMIN'),
  );
  protected readonly artikel = this.artikelService.artikel;

  protected readonly bestellungen = computed(() => {
    const user = this.currentUser();
    return user ? this.bestellungService.getForFiliale(user.filialeId) : [];
  });

  protected readonly ausgewaehlterArtikelId = signal<number | null>(null);
  protected readonly menge = signal<number>(10);
  protected readonly erfolgsmeldung = signal(false);

  protected artikelBezeichnung(artikelId: number): string {
    return this.artikelService.getById(artikelId)?.bezeichnung ?? `#${artikelId}`;
  }

  protected bestandAktuell(artikelId: number): number {
    const user = this.currentUser();
    return user ? this.artikelService.getBestand(artikelId, user.filialeId) : 0;
  }

  protected bestellen(): void {
    const user = this.currentUser();
    const artikelId = this.ausgewaehlterArtikelId();
    if (!user || !artikelId || this.menge() <= 0) {
      return;
    }
    this.bestellungService.bestellen({
      filialeId: user.filialeId,
      artikelId,
      menge: this.menge(),
      bestelltVon: user.id,
    });
    this.ausgewaehlterArtikelId.set(null);
    this.menge.set(10);
    this.erfolgsmeldung.set(true);
    setTimeout(() => this.erfolgsmeldung.set(false), 3000);
  }

  protected wareneingangBuchen(bestellungId: number): void {
    this.bestellungService.wareneingangBuchen(bestellungId);
  }
}
