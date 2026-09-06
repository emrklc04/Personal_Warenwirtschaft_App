import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbschreibungGrund } from '../../../core/models/warenwirtschaft.model';
import { AbschreibungService } from '../../../core/services/abschreibung.service';
import { ArtikelService } from '../../../core/services/artikel.service';
import { AuthService } from '../../../core/services/auth.service';
import { MitarbeiterService } from '../../../core/services/mitarbeiter.service';

const GRUND_LABEL: Record<AbschreibungGrund, string> = {
  VERDERB: 'Verderb',
  BRUCH: 'Bruch',
  DIEBSTAHL: 'Diebstahl',
  SONSTIGES: 'Sonstiges',
};

@Component({
  selector: 'app-abschreibung',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './abschreibung.html',
  styleUrl: './abschreibung.css',
})
export class AbschreibungSeite {
  private readonly authService = inject(AuthService);
  private readonly artikelService = inject(ArtikelService);
  private readonly abschreibungService = inject(AbschreibungService);
  private readonly mitarbeiterService = inject(MitarbeiterService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly kannBuchen = computed(() =>
    this.authService.hasAnyRole('FILIALLEITER', 'ADMIN'),
  );
  protected readonly artikel = this.artikelService.artikel;
  protected readonly gruende: AbschreibungGrund[] = ['VERDERB', 'BRUCH', 'DIEBSTAHL', 'SONSTIGES'];

  protected readonly liste = computed(() => {
    const user = this.currentUser();
    return user ? this.abschreibungService.getForFiliale(user.filialeId) : [];
  });

  protected readonly ausgewaehlterArtikelId = signal<number | null>(null);
  protected readonly menge = signal<number>(1);
  protected readonly grund = signal<AbschreibungGrund>('VERDERB');
  protected readonly bemerkung = signal('');
  protected readonly erfolgsmeldung = signal(false);

  protected grundLabel(grund: AbschreibungGrund): string {
    return GRUND_LABEL[grund];
  }

  protected artikelBezeichnung(artikelId: number): string {
    return this.artikelService.getById(artikelId)?.bezeichnung ?? `#${artikelId}`;
  }

  protected mitarbeiterName(mitarbeiterId: number): string {
    const m = this.mitarbeiterService.getById(mitarbeiterId);
    return m ? `${m.vorname} ${m.nachname}` : `#${mitarbeiterId}`;
  }

  protected wert(artikelId: number, menge: number): number {
    const artikel = this.artikelService.getById(artikelId);
    return artikel ? artikel.preis * menge : 0;
  }

  protected buchen(): void {
    const user = this.currentUser();
    const artikelId = this.ausgewaehlterArtikelId();
    if (!user || !artikelId || this.menge() <= 0) {
      return;
    }
    this.abschreibungService.buchen({
      filialeId: user.filialeId,
      artikelId,
      menge: this.menge(),
      grund: this.grund(),
      bemerkung: this.bemerkung().trim(),
      erstelltVon: user.id,
    });
    this.ausgewaehlterArtikelId.set(null);
    this.menge.set(1);
    this.grund.set('VERDERB');
    this.bemerkung.set('');
    this.erfolgsmeldung.set(true);
    setTimeout(() => this.erfolgsmeldung.set(false), 3000);
  }
}
