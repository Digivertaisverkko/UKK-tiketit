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
    console.log('authGuard: et ole kirjautunut.');
    // authService.onIsUserLoggedIn().subscribe(response => {
      /* Tämän sovelluksen oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee kirjautumisruudussa
        jonkin muun tavan. Ei siirrytä suoraan /login, koska palvelimelta saatava
        URL sisältää login id:n. */
        const route = window.location.pathname + window.location.search;
        if (route.startsWith('/login') == false) {
          // Linkkejä valittaessa on voitu asettaa.
          if (window.localStorage.getItem('REDIRECT_URL') == null) {
            window.localStorage.setItem('REDIRECT_URL', route);
            console.log('Tallennettiin redirect URL: ' + route);
          }
        }
        const loginUrl = await authService.sendAskLoginRequest('own');
        return router.navigateByUrl(loginUrl);
        // Ei saatu login id:ä, mutta näytetään kirjautumisruutu.
        // this.router.navigateByUrl('login', { replaceUrl: true });
      // } else {
      //   return true
      // }
    // });

  }
}
