import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ArtikelService } from '../../../core/services/artikel.service';

@Component({
  selector: 'app-preisabfrage',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './preisabfrage.html',
  styleUrl: './preisabfrage.css',
})
export class Preisabfrage {
  private readonly authService = inject(AuthService);
  private readonly artikelService = inject(ArtikelService);

  protected readonly suchbegriff = signal('');

  protected readonly filialeId = computed(() => this.authService.currentUser()?.filialeId ?? null);

  protected readonly treffer = computed(() => this.artikelService.suche(this.suchbegriff()));

  protected bestand(artikelId: number): number | null {
    const filialeId = this.filialeId();
    return filialeId === null ? null : this.artikelService.getBestand(artikelId, filialeId);
  }
}
