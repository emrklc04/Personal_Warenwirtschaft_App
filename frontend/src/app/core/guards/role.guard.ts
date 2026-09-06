import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rolle } from '../models/personal.model';
import { AuthService } from '../services/auth.service';

export function roleGuard(...rollen: Rolle[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasAnyRole(...rollen)) {
      return true;
    }
    return router.parseUrl('/');
  };
}
