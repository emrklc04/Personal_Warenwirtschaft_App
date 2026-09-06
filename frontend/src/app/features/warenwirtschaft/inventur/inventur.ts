import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ArtikelService } from '../../../core/services/artikel.service';
import { InventurService } from '../../../core/services/inventur.service';

@Component({
  selector: 'app-inventur',
  imports: [DatePipe, FormsModule],
  templateUrl: './inventur.html',
  styleUrl: './inventur.css',
})
export class InventurSeite {
  private readonly authService = inject(AuthService);
  private readonly artikelService = inject(ArtikelService);
  private readonly inventurService = inject(InventurService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly kannVerwalten = computed(() =>
    this.authService.hasAnyRole('FILIALLEITER', 'ADMIN'),
  );

  protected readonly filialeId = computed(() => this.currentUser()?.filialeId ?? null);

  protected readonly inventuren = computed(() => {
    const filialeId = this.filialeId();
    return filialeId === null ? [] : this.inventurService.getForFiliale(filialeId);
  });

  protected readonly laufendeInventur = computed(() => {
    const filialeId = this.filialeId();
    return filialeId === null ? undefined : this.inventurService.getLaufendeFuerFiliale(filialeId);
  });

  private readonly ausgewaehlteInventurId = signal<number | null>(null);

  protected readonly anzeigeInventur = computed(() => {
    const id = this.ausgewaehlteInventurId();
    if (id !== null) {
      return this.inventurService.getById(id);
    }
    return this.laufendeInventur();
  });

  protected readonly anzeigeEintraege = computed(() => {
    const inventur = this.anzeigeInventur();
    return inventur ? this.inventurService.getEintraege(inventur.id) : [];
  });

  protected auswaehlen(inventurId: number): void {
    this.ausgewaehlteInventurId.set(inventurId);
  }

  protected artikelBezeichnung(artikelId: number): string {
    return this.artikelService.getById(artikelId)?.bezeichnung ?? `#${artikelId}`;
  }

  protected artikelEinheit(artikelId: number): string {
    return this.artikelService.getById(artikelId)?.einheit ?? '';
  }

  protected differenz(sollMenge: number, istMenge: number | null): number | null {
    return istMenge === null ? null : istMenge - sollMenge;
  }

  protected neueInventurStarten(): void {
    const user = this.currentUser();
    const filialeId = this.filialeId();
    if (!user || filialeId === null || this.laufendeInventur()) {
      return;
    }
    const neu = this.inventurService.starten(filialeId, user.id);
    this.ausgewaehlteInventurId.set(neu.id);
  }

  protected zaehlungErfassen(eintragId: number, wert: number): void {
    if (Number.isNaN(wert) || wert < 0) {
      return;
    }
    this.inventurService.zaehlungErfassen(eintragId, wert);
  }

  protected abschliessen(): void {
    const inventur = this.anzeigeInventur();
    if (!inventur || inventur.status !== 'LAUFEND') {
      return;
    }
    this.inventurService.abschliessen(inventur.id);
    this.ausgewaehlteInventurId.set(inventur.id);
  }
}
