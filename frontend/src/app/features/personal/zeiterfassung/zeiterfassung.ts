import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Mitarbeiter } from '../../../core/models/personal.model';
import { AuthService } from '../../../core/services/auth.service';
import { FilialeService } from '../../../core/services/filiale.service';
import { MitarbeiterService } from '../../../core/services/mitarbeiter.service';
import { ZeiterfassungService } from '../../../core/services/zeiterfassung.service';

interface TeamZeile {
  mitarbeiter: Mitarbeiter;
  eingestempelt: boolean;
  seit: string | null;
}

@Component({
  selector: 'app-zeiterfassung',
  imports: [DatePipe],
  templateUrl: './zeiterfassung.html',
  styleUrl: './zeiterfassung.css',
})
export class Zeiterfassung {
  private readonly authService = inject(AuthService);
  private readonly zeiterfassungService = inject(ZeiterfassungService);
  private readonly mitarbeiterService = inject(MitarbeiterService);
  private readonly filialeService = inject(FilialeService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly eigeneEintraege = computed(() => {
    const user = this.currentUser();
    return user ? this.zeiterfassungService.getForMitarbeiter(user.id) : [];
  });

  protected readonly istEingestempelt = computed(() => {
    const user = this.currentUser();
    return user ? this.zeiterfassungService.istEingestempelt(user.id) : false;
  });

  protected readonly aktiverEintrag = computed(() => {
    const user = this.currentUser();
    return user ? this.zeiterfassungService.aktiverEintrag(user.id) : undefined;
  });

  protected readonly zeigeTeam = computed(() =>
    this.authService.hasAnyRole('FILIALLEITER', 'HR', 'ADMIN'),
  );

  protected readonly team = computed<TeamZeile[]>(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }
    const istZentral = this.authService.hasAnyRole('HR', 'ADMIN');
    const mitarbeiterListe = istZentral
      ? this.mitarbeiterService.mitarbeiter()
      : this.mitarbeiterService.getByFiliale(user.filialeId);

    return mitarbeiterListe
      .filter((m) => m.id !== user.id)
      .map((m) => {
        const aktiv = this.zeiterfassungService.aktiverEintrag(m.id);
        return { mitarbeiter: m, eingestempelt: !!aktiv, seit: aktiv?.kommen ?? null };
      });
  });

  protected dauer(kommen: string, gehen: string | null): string {
    const start = new Date(kommen).getTime();
    const ende = gehen ? new Date(gehen).getTime() : Date.now();
    const minuten = Math.max(0, Math.round((ende - start) / 60000));
    const stunden = Math.floor(minuten / 60);
    const rest = minuten % 60;
    return `${stunden}h ${rest.toString().padStart(2, '0')}min`;
  }

  protected filialeName(filialeId: number): string {
    return this.filialeService.getById(filialeId)?.name ?? '';
  }

  protected kommen(): void {
    const user = this.currentUser();
    if (user) {
      this.zeiterfassungService.kommen(user.id);
    }
  }

  protected gehen(): void {
    const user = this.currentUser();
    if (user) {
      this.zeiterfassungService.gehen(user.id);
    }
  }
}
