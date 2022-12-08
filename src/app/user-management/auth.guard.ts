import { CanActivateFn, CanActivateChildFn } from "@angular/router";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../core/auth.service";

export const authGuard: CanActivateFn | CanActivateChildFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getIsUserLoggedIn()) {
    // console.log('authGuard: olet kirjautunut.');
    return true
  } else {
    // console.log('authGuard: et ole kirjautunut.');
  }

  return router.parseUrl('/login');
}
