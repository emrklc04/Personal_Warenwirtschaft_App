import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
      { path: '', pathMatch: 'full', redirectTo: 'personal/zeiterfassung' },
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
        path: 'personal/profil',
        loadComponent: () => import('./features/personal/profil/profil').then((m) => m.Profil),
      },
      {
        path: 'warenwirtschaft/preisabfrage',
        loadComponent: () =>
          import('./features/warenwirtschaft/preisabfrage/preisabfrage').then(
            (m) => m.Preisabfrage,
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
    ],
  },
  { path: '**', redirectTo: 'login' },
];
