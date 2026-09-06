import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ArtikelService } from '../../core/services/artikel.service';
import { BestellungService } from '../../core/services/bestellung.service';
import { InventurService } from '../../core/services/inventur.service';
import { MitarbeiterService } from '../../core/services/mitarbeiter.service';
import { UrlaubService } from '../../core/services/urlaub.service';
import { ZeiterfassungService } from '../../core/services/zeiterfassung.service';
import { ZeitkorrekturService } from '../../core/services/zeitkorrektur.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly zeiterfassungService = inject(ZeiterfassungService);
  private readonly zeitkorrekturService = inject(ZeitkorrekturService);
  private readonly urlaubService = inject(UrlaubService);
  private readonly mitarbeiterService = inject(MitarbeiterService);
  private readonly artikelService = inject(ArtikelService);
  private readonly inventurService = inject(InventurService);
  private readonly bestellungService = inject(BestellungService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly istGenehmiger = computed(() =>
    this.authService.hasAnyRole('FILIALLEITER', 'HR', 'ADMIN'),
  );
  protected readonly istFilialverwalter = computed(() =>
    this.authService.hasAnyRole('FILIALLEITER', 'ADMIN'),
  );
  protected readonly istZentral = computed(() => this.authService.hasAnyRole('HR', 'ADMIN'));

  protected readonly istEingestempelt = computed(() => {
    const user = this.currentUser();
    return user ? this.zeiterfassungService.istEingestempelt(user.id) : false;
  });

  protected readonly aktiverEintrag = computed(() => {
    const user = this.currentUser();
    return user ? this.zeiterfassungService.aktiverEintrag(user.id) : undefined;
  });

  protected readonly restUrlaub = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return 0;
    }
    return user.urlaubsanspruchTage - this.urlaubService.genommeneTage(user.id);
  });

  private relevanteMitarbeiterIds(): number[] {
    const user = this.currentUser();
    if (!user) {
      return [];
    }
    return this.istZentral()
      ? this.mitarbeiterService.mitarbeiter().map((m) => m.id)
      : this.mitarbeiterService.getByFiliale(user.filialeId).map((m) => m.id);
  }

  protected readonly offeneZeitkorrekturen = computed(
    () => this.zeitkorrekturService.getOffeneFuerMitarbeiterIds(this.relevanteMitarbeiterIds()).length,
  );

  protected readonly offeneUrlaubsantraege = computed(
    () => this.urlaubService.getOffeneFuerMitarbeiterIds(this.relevanteMitarbeiterIds()).length,
  );

  protected readonly mitarbeiterGesamt = computed(() => this.mitarbeiterService.mitarbeiter().length);
  protected readonly mitarbeiterAktiv = computed(
    () => this.mitarbeiterService.mitarbeiter().filter((m) => m.aktiv).length,
  );

  protected readonly artikelUnterMindestbestand = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return 0;
    }
    return this.artikelService
      .artikel()
      .filter((a) => this.artikelService.getBestand(a.id, user.filialeId) < a.mindestbestand).length;
  });

  protected readonly laufendeInventur = computed(() => {
    const user = this.currentUser();
    return user ? this.inventurService.getLaufendeFuerFiliale(user.filialeId) : undefined;
  });

  protected readonly offeneBestellungen = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return 0;
    }
    return this.bestellungService
      .getForFiliale(user.filialeId)
      .filter((b) => b.status === 'OFFEN').length;
  });
}
