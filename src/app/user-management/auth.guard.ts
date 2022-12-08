import { CanActivateFn, CanActivateChildFn } from "@angular/router";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../core/auth.service";

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getIsUserLoggedIn()) {
    console.log('authGuard: olet kirjautunut.');
    return true
  } else {
    // console.log('authGuard: et ole kirjautunut.');
    // authService.onIsUserLoggedIn().subscribe(response => {
      /* Oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee kirjautumisruudussa
        jonkin muun tavan. Ei siirrytä suoraan /login, koska palvelimelta saatava
        URL sisältää login id:n. */
      // if (response == false) {
        const loginUrl = await authService.sendAskLoginRequest('own');
        console.log('authGuard: loginUrl: ' + loginUrl)
        return router.navigateByUrl(loginUrl);
        // Ei saatu login id:ä, mutta näytetään kirjautumisruutu.
        // this.router.navigateByUrl('login', { replaceUrl: true });
      // } else {
      //   return true
      // }
    // });
  
  }
}
