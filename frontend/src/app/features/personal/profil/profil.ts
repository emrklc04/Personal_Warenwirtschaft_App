import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
  selector: 'app-profil',
  imports: [DatePipe, FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {
  private readonly authService = inject(AuthService);
  private readonly filialeService = inject(FilialeService);
  private readonly mitarbeiterService = inject(MitarbeiterService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly filialeName = computed(() => {
    const user = this.currentUser();
    return user ? (this.filialeService.getById(user.filialeId)?.name ?? '') : '';
  });

  protected readonly rollenLabel = computed(() =>
    (this.currentUser()?.rollen ?? []).map((r) => ROLLEN_LABEL[r]).join(', '),
  );

  protected readonly email = signal(this.currentUser()?.email ?? '');
  protected readonly gespeichert = signal(false);

  protected speichern(): void {
    const user = this.currentUser();
    if (!user || !this.email().trim()) {
      return;
    }
    this.mitarbeiterService.updateEmail(user.id, this.email().trim());
    this.gespeichert.set(true);
    setTimeout(() => this.gespeichert.set(false), 3000);
  }
}
