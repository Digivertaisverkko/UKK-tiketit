import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../core/auth.service";

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // const location = inject(Location);

  if (authService.getIsUserLoggedIn()) {
    // console.log('authGuard: olet kirjautunut.');
    return true
  } else {
    // console.log('authGuard: et ole kirjautunut.');
    // authService.onIsUserLoggedIn().subscribe(response => {
      /* Tämän sovleluksen oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee kirjautumisruudussa
        jonkin muun tavan. Ei siirrytä suoraan /login, koska palvelimelta saatava
        URL sisältää login id:n. */
        const loginUrl = await authService.sendAskLoginRequest('own');
        // console.log('Tallennettiin redirect URL: ' + window.location.pathname);
        const route = window.location.pathname;
        if (route.startsWith('/login') == false) {
          window.sessionStorage.setItem('REDIRECT_URL', window.location.pathname);
        }
        return router.navigateByUrl(loginUrl);
        // Ei saatu login id:ä, mutta näytetään kirjautumisruutu.
        // this.router.navigateByUrl('login', { replaceUrl: true });
      // } else {
      //   return true
      // }
    // });

  }
}
