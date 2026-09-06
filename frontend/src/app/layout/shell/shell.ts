import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Rolle } from '../../core/models/personal.model';
import { AuthService } from '../../core/services/auth.service';
import { FilialeService } from '../../core/services/filiale.service';

const ROLLEN_LABEL: Record<Rolle, string> = {
  MITARBEITER: 'Mitarbeiter',
  FILIALLEITER: 'Filialleiter:in',
  HR: 'HR',
  ADMIN: 'Admin',
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly filialeService = inject(FilialeService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly filialeName = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }
    return this.filialeService.getById(user.filialeId)?.name ?? '';
  });

  protected readonly rollenLabel = computed(() =>
    (this.currentUser()?.rollen ?? []).map((r) => ROLLEN_LABEL[r]).join(', '),
  );

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
