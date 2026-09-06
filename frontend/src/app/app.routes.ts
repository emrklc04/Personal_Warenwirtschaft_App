import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'personal/zeiterfassung',
        loadComponent: () =>
          import('./features/personal/zeiterfassung/zeiterfassung').then((m) => m.Zeiterfassung),
      },
      {
        path: 'personal/zeitkorrekturen',
        loadComponent: () =>
          import('./features/personal/zeitkorrekturen/zeitkorrekturen').then(
            (m) => m.Zeitkorrekturen,
          ),
      },
      {
        path: 'personal/urlaub',
        loadComponent: () => import('./features/personal/urlaub/urlaub').then((m) => m.Urlaub),
      },
      {
        path: 'personal/profil',
        loadComponent: () => import('./features/personal/profil/profil').then((m) => m.Profil),
      },
      {
        path: 'personal/mitarbeiterverwaltung',
        canActivate: [roleGuard('HR', 'ADMIN')],
        loadComponent: () =>
          import('./features/personal/mitarbeiterverwaltung/mitarbeiterverwaltung').then(
            (m) => m.Mitarbeiterverwaltung,
          ),
      },
      {
        path: 'warenwirtschaft/preisabfrage',
        loadComponent: () =>
          import('./features/warenwirtschaft/preisabfrage/preisabfrage').then(
            (m) => m.Preisabfrage,
          ),
      },
      {
        path: 'warenwirtschaft/lagerbestand',
        loadComponent: () =>
          import('./features/warenwirtschaft/lagerbestand/lagerbestand').then(
            (m) => m.Lagerbestand,
          ),
      },
      {
        path: 'warenwirtschaft/inventur',
        loadComponent: () =>
          import('./features/warenwirtschaft/inventur/inventur').then((m) => m.InventurSeite),
      },
      {
        path: 'warenwirtschaft/abschreibung',
        loadComponent: () =>
          import('./features/warenwirtschaft/abschreibung/abschreibung').then(
            (m) => m.AbschreibungSeite,
          ),
      },
      {
        path: 'warenwirtschaft/bestellungen',
        loadComponent: () =>
          import('./features/warenwirtschaft/bestellungen/bestellungen').then(
            (m) => m.Bestellungen,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
