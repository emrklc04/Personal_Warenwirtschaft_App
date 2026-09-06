import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rolle } from '../../../core/models/personal.model';
import { AuthService } from '../../../core/services/auth.service';
import { FilialeService } from '../../../core/services/filiale.service';
import { MitarbeiterService } from '../../../core/services/mitarbeiter.service';

const ROLLEN_LABEL: Record<Rolle, string> = {
  MITARBEITER: 'Mitarbeiter',
  FILIALLEITER: 'Filialleiter:in',
  HR: 'HR',
  ADMIN: 'Admin',
};

@Component({
  selector: 'app-mitarbeiterverwaltung',
  imports: [DatePipe, FormsModule],
  templateUrl: './mitarbeiterverwaltung.html',
  styleUrl: './mitarbeiterverwaltung.css',
})
export class Mitarbeiterverwaltung {
  private readonly authService = inject(AuthService);
  private readonly mitarbeiterService = inject(MitarbeiterService);
  private readonly filialeService = inject(FilialeService);

  protected readonly mitarbeiter = this.mitarbeiterService.mitarbeiter;
  protected readonly filialen = this.filialeService.filialen;
  protected readonly alleRollen: Rolle[] = ['MITARBEITER', 'FILIALLEITER', 'HR', 'ADMIN'];

  protected readonly vorname = signal('');
  protected readonly nachname = signal('');
  protected readonly benutzername = signal('');
  protected readonly email = signal('');
  protected readonly position = signal('');
  protected readonly filialeId = signal<number | null>(null);
  protected readonly ausgewaehlteRollen = signal<Rolle[]>(['MITARBEITER']);
  protected readonly erfolgsmeldung = signal(false);
  protected readonly fehlermeldung = signal('');

  protected rollenLabel(rollen: Rolle[]): string {
    return rollen.map((r) => ROLLEN_LABEL[r]).join(', ');
  }

  protected filialeName(filialeId: number): string {
    return this.filialeService.getById(filialeId)?.name ?? '';
  }

  protected rolleUmschalten(rolle: Rolle, checked: boolean): void {
    this.ausgewaehlteRollen.update((liste) =>
      checked ? [...liste, rolle] : liste.filter((r) => r !== rolle),
    );
  }

  protected istRolleAusgewaehlt(rolle: Rolle): boolean {
    return this.ausgewaehlteRollen().includes(rolle);
  }

  protected mitarbeiterAnlegen(): void {
    const filialeId = this.filialeId();
    if (
      !this.vorname().trim() ||
      !this.nachname().trim() ||
      !this.benutzername().trim() ||
      !this.email().trim() ||
      filialeId === null ||
      this.ausgewaehlteRollen().length === 0
    ) {
      this.fehlermeldung.set(
        'Bitte alle Pflichtfelder ausfüllen und mindestens eine Rolle wählen.',
      );
      return;
    }
    const benutzername = this.benutzername().trim().toLowerCase();
    if (this.mitarbeiterService.mitarbeiter().some((m) => m.benutzername === benutzername)) {
      this.fehlermeldung.set('Dieser Benutzername ist bereits vergeben.');
      return;
    }

    const neu = this.mitarbeiterService.anlegen({
      vorname: this.vorname().trim(),
      nachname: this.nachname().trim(),
      benutzername,
      email: this.email().trim(),
      position: this.position().trim() || 'Mitarbeiter',
      rollen: [...this.ausgewaehlteRollen()],
      filialeId,
      urlaubsanspruchTage: 25,
    });
    this.authService.registerCredential(neu.benutzername, neu.id);

    this.fehlermeldung.set('');
    this.vorname.set('');
    this.nachname.set('');
    this.benutzername.set('');
    this.email.set('');
    this.position.set('');
    this.filialeId.set(null);
    this.ausgewaehlteRollen.set(['MITARBEITER']);
    this.erfolgsmeldung.set(true);
    setTimeout(() => this.erfolgsmeldung.set(false), 4000);
  }

  protected statusUmschalten(mitarbeiterId: number, aktuellAktiv: boolean): void {
    this.mitarbeiterService.setAktiv(mitarbeiterId, !aktuellAktiv);
  }
}
