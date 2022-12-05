import { CanActivateFn, CanActivateChildFn } from "@angular/router";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../core/auth.service";

export const authGuard: CanActivateFn | CanActivateChildFn = () => {
  console.log('authGuard kutsuttu.');
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getIsUserLoggedIn()) {
    return true
  }

  return router.parseUrl('/login');
}
