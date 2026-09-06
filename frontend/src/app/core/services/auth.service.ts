import { Injectable, computed, inject, signal } from '@angular/core';
import { Mitarbeiter, Rolle } from '../models/personal.model';
import { MitarbeiterService } from './mitarbeiter.service';

interface DemoCredential {
  benutzername: string;
  passwort: string;
  mitarbeiterId: number;
}

// Demo-Zugangsdaten, solange kein Backend mit echter Authentifizierung existiert.
// Passwort für alle Demo-Konten: "test123"
const STANDARD_DEMO_PASSWORT = 'test123';

const DEMO_CREDENTIALS: DemoCredential[] = [
  { benutzername: 'max.mustermann', passwort: STANDARD_DEMO_PASSWORT, mitarbeiterId: 1 },
  { benutzername: 'erika.musterfrau', passwort: STANDARD_DEMO_PASSWORT, mitarbeiterId: 2 },
  { benutzername: 'hannah.huber', passwort: STANDARD_DEMO_PASSWORT, mitarbeiterId: 3 },
  { benutzername: 'alex.admin', passwort: STANDARD_DEMO_PASSWORT, mitarbeiterId: 4 },
  { benutzername: 'peter.petrov', passwort: STANDARD_DEMO_PASSWORT, mitarbeiterId: 5 },
  { benutzername: 'sonja.sommer', passwort: STANDARD_DEMO_PASSWORT, mitarbeiterId: 6 },
];

const STORAGE_KEY = 'pww_current_mitarbeiter_id';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly mitarbeiterService = inject(MitarbeiterService);

  private readonly credentials = signal<DemoCredential[]>(DEMO_CREDENTIALS);

  private readonly currentMitarbeiterId = signal<number | null>(this.readStoredId());

  readonly currentUser = computed<Mitarbeiter | null>(() => {
    const id = this.currentMitarbeiterId();
    return id === null ? null : (this.mitarbeiterService.getById(id) ?? null);
  });

  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(benutzername: string, passwort: string): boolean {
    const credential = this.credentials().find(
      (c) => c.benutzername === benutzername.trim().toLowerCase() && c.passwort === passwort,
    );
    if (!credential) {
      return false;
    }
    this.currentMitarbeiterId.set(credential.mitarbeiterId);
    localStorage.setItem(STORAGE_KEY, String(credential.mitarbeiterId));
    return true;
  }

  registerCredential(benutzername: string, mitarbeiterId: number, passwort = STANDARD_DEMO_PASSWORT): void {
    this.credentials.update((list) => [
      ...list,
      { benutzername: benutzername.trim().toLowerCase(), passwort, mitarbeiterId },
    ]);
  }

  logout(): void {
    this.currentMitarbeiterId.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  hasAnyRole(...rollen: Rolle[]): boolean {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    return user.rollen.some((r) => rollen.includes(r));
  }

  private readStoredId(): number | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  }
}
