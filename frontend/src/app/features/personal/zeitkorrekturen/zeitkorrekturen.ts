import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MitarbeiterService } from '../../../core/services/mitarbeiter.service';
import { ZeiterfassungService } from '../../../core/services/zeiterfassung.service';
import { ZeitkorrekturService } from '../../../core/services/zeitkorrektur.service';

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-zeitkorrekturen',
  imports: [DatePipe, FormsModule],
  templateUrl: './zeitkorrekturen.html',
  styleUrl: './zeitkorrekturen.css',
})
export class Zeitkorrekturen {
  private readonly authService = inject(AuthService);
  private readonly mitarbeiterService = inject(MitarbeiterService);
  private readonly zeiterfassungService = inject(ZeiterfassungService);
  private readonly zeitkorrekturService = inject(ZeitkorrekturService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly eigeneEintraege = computed(() => {
    const user = this.currentUser();
    return user ? this.zeiterfassungService.getForMitarbeiter(user.id) : [];
  });

  protected readonly eigeneAntraege = computed(() => {
    const user = this.currentUser();
    return user ? this.zeitkorrekturService.getForMitarbeiter(user.id) : [];
  });

  protected readonly istGenehmiger = computed(() =>
    this.authService.hasAnyRole('FILIALLEITER', 'HR', 'ADMIN'),
  );

  protected readonly offeneAntraege = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }
    const istZentral = this.authService.hasAnyRole('HR', 'ADMIN');
    const relevanteIds = istZentral
      ? this.mitarbeiterService.mitarbeiter().map((m) => m.id)
      : this.mitarbeiterService.getByFiliale(user.filialeId).map((m) => m.id);
    return this.zeitkorrekturService.getOffeneFuerMitarbeiterIds(relevanteIds);
  });

  protected readonly ausgewaehlterEintragId = signal<number | null>(null);
  protected readonly gewuenschtesKommen = signal('');
  protected readonly gewuenschtesGehen = signal('');
  protected readonly grund = signal('');
  protected readonly erfolgsmeldung = signal(false);

  protected mitarbeiterName(mitarbeiterId: number): string {
    const m = this.mitarbeiterService.getById(mitarbeiterId);
    return m ? `${m.vorname} ${m.nachname}` : `#${mitarbeiterId}`;
  }

  protected eintragBeschriftung(eintragId: number): string {
    const eintrag = this.zeiterfassungService.getById(eintragId);
    if (!eintrag) {
      return `#${eintragId}`;
    }
    const optionen: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const datum = new Date(eintrag.kommen).toLocaleDateString('de-DE');
    const kommenZeit = new Date(eintrag.kommen).toLocaleTimeString('de-DE', optionen);
    const gehenZeit = eintrag.gehen
      ? new Date(eintrag.gehen).toLocaleTimeString('de-DE', optionen)
      : 'noch offen';
    return `${datum} (${kommenZeit} – ${gehenZeit})`;
  }

  protected eintragAuswaehlen(eintragId: number | null): void {
    this.ausgewaehlterEintragId.set(eintragId);
    const eintrag = eintragId ? this.zeiterfassungService.getById(eintragId) : undefined;
    this.gewuenschtesKommen.set(eintrag ? toLocalInputValue(eintrag.kommen) : '');
    this.gewuenschtesGehen.set(eintrag?.gehen ? toLocalInputValue(eintrag.gehen) : '');
  }

  protected antragAbsenden(): void {
    const user = this.currentUser();
    const eintragId = this.ausgewaehlterEintragId();
    if (!user || !eintragId || !this.gewuenschtesKommen() || !this.grund().trim()) {
      return;
    }
    this.zeitkorrekturService.beantragen({
      arbeitszeiteintragId: eintragId,
      mitarbeiterId: user.id,
      gewuenschtesKommen: new Date(this.gewuenschtesKommen()).toISOString(),
      gewuenschtesGehen: this.gewuenschtesGehen()
        ? new Date(this.gewuenschtesGehen()).toISOString()
        : null,
      grund: this.grund().trim(),
    });
    this.ausgewaehlterEintragId.set(null);
    this.gewuenschtesKommen.set('');
    this.gewuenschtesGehen.set('');
    this.grund.set('');
    this.erfolgsmeldung.set(true);
    setTimeout(() => this.erfolgsmeldung.set(false), 3000);
  }

  protected genehmigen(id: number): void {
    const user = this.currentUser();
    if (user) {
      this.zeitkorrekturService.genehmigen(id, user.id);
    }
  }

  protected ablehnen(id: number): void {
    const user = this.currentUser();
    if (user) {
      this.zeitkorrekturService.ablehnen(id, user.id);
    }
  }
}
