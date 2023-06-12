import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../core/services/auth.service";
import { getCourseIDfromURL } from "../shared/utils";
import { StoreService } from "../core/services/store.service";

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const store = inject(StoreService)
  // const location = inject(Location);

  if (store.getIsLoggedIn()) {
    // console.log('authGuard: olet kirjautunut.');
    return true
  } else {
    // console.log('authGuard: et ole kirjautunut.');
    // authService.onIsUserLoggedIn().subscribe(response => {
      /* Tämän sovelluksen oma kirjautumistapa on oletus ennen kuin käyttäjä valitsee kirjautumisruudussa
        jonkin muun tavan. Ei siirrytä suoraan /login, koska palvelimelta saatava
        URL sisältää login id:n. */
        authService.saveRedirectURL();
        const courseID = getCourseIDfromURL();
        const baseUrl = (courseID == null) ? '' : 'course/' + courseID + '/'
        const url = baseUrl + 'forbidden';
        router.navigateByUrl(url);
        return false
        // const route = window.location.pathname + window.location.search;
        // if (route.startsWith('/login') == false) {
        //   if (window.localStorage.getItem('REDIRECT_URL') == null) {
        //     window.localStorage.setItem('REDIRECT_URL', route);
        //     console.log('Tallennettiin redirect URL: ' + route + ', johon ohjataan kirjautumisen jälkeen.');
        //   }
        // }
        // const loginUrl = await authService.sendAskLoginRequest('own');
        // return router.navigateByUrl(loginUrl);
        // Ei saatu login id:ä, mutta näytetään kirjautumisruutu.
        // this.router.navigateByUrl('login', { replaceUrl: true });
      // } else {
      //   return true
      // }
    // });

  }
}