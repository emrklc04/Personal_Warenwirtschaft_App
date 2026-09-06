import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MitarbeiterService } from '../../../core/services/mitarbeiter.service';
import { UrlaubService } from '../../../core/services/urlaub.service';

@Component({
  selector: 'app-urlaub',
  imports: [DatePipe, FormsModule],
  templateUrl: './urlaub.html',
  styleUrl: './urlaub.css',
})
export class Urlaub {
  private readonly authService = inject(AuthService);
  private readonly mitarbeiterService = inject(MitarbeiterService);
  private readonly urlaubService = inject(UrlaubService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly eigeneAntraege = computed(() => {
    const user = this.currentUser();
    return user ? this.urlaubService.getForMitarbeiter(user.id) : [];
  });

  protected readonly genommeneTage = computed(() => {
    const user = this.currentUser();
    return user ? this.urlaubService.genommeneTage(user.id) : 0;
  });

  protected readonly restTage = computed(() => {
    const user = this.currentUser();
    return user ? user.urlaubsanspruchTage - this.genommeneTage() : 0;
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
    return this.urlaubService.getOffeneFuerMitarbeiterIds(relevanteIds);
  });

  protected readonly von = signal('');
  protected readonly bis = signal('');
  protected readonly kommentar = signal('');
  protected readonly erfolgsmeldung = signal(false);
  protected readonly fehlermeldung = signal(false);

  protected mitarbeiterName(mitarbeiterId: number): string {
    const m = this.mitarbeiterService.getById(mitarbeiterId);
    return m ? `${m.vorname} ${m.nachname}` : `#${mitarbeiterId}`;
  }

  protected tage(von: string, bis: string): number {
    return this.urlaubService.tageZaehlen(von, bis);
  }

  protected antragAbsenden(): void {
    const user = this.currentUser();
    if (!user || !this.von() || !this.bis()) {
      return;
    }
    if (new Date(this.bis()) < new Date(this.von())) {
      this.fehlermeldung.set(true);
      return;
    }
    this.fehlermeldung.set(false);
    this.urlaubService.beantragen({
      mitarbeiterId: user.id,
      von: this.von(),
      bis: this.bis(),
      kommentar: this.kommentar().trim(),
    });
    this.von.set('');
    this.bis.set('');
    this.kommentar.set('');
    this.erfolgsmeldung.set(true);
    setTimeout(() => this.erfolgsmeldung.set(false), 3000);
  }

  protected genehmigen(id: number): void {
    const user = this.currentUser();
    if (user) {
      this.urlaubService.genehmigen(id, user.id);
    }
  }

  protected ablehnen(id: number): void {
    const user = this.currentUser();
    if (user) {
      this.urlaubService.ablehnen(id, user.id);
    }
  }
}
