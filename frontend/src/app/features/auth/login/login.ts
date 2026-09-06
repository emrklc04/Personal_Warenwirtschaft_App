import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly benutzername = signal('');
  protected readonly passwort = signal('');
  protected readonly fehler = signal(false);

  protected anmelden(): void {
    const erfolgreich = this.authService.login(this.benutzername(), this.passwort());
    if (!erfolgreich) {
      this.fehler.set(true);
      return;
    }
    this.fehler.set(false);
    this.router.navigateByUrl('/');
  }

  protected schnellAnmeldung(benutzername: string): void {
    this.benutzername.set(benutzername);
    this.passwort.set('test123');
    this.anmelden();
  }
}
