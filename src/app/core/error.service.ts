import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { Error } from "./core.models";
import { StoreService } from "./store.service";

@Injectable({ providedIn: 'root' })

export class ErrorService {

  constructor(
      private router: Router,
      private store: StoreService
      ) {
  }

  /* Käsitellään virheitä ennen niiden toimittamista komponenteille. Logitetaan
      kaikki virheet. Jos käyttäjällä ei ole oikeuksia resurssiin tai virheenä
      on, ettei ole kirjautunut, niin ohjataan "Ei oikeuksia" -näkymään. Muussa
      tapauksessa virhe heitetään eteenpäin komponenteille, jotka voivat
      tarpeen mukaan näyttää käyttäjällle virheilmoituksia.
  */

  public handleServerError(error: any) {
    var backendResponse = error?.error;
    var backendError: Error = backendResponse?.error;
    var logMessage: string = ''; // Pastetaan consoleen.


    // console.log('backendResponse: ' + JSON.stringify(backendResponse) +
    // ' backendError: ' + JSON.stringify(backendError))

    if (error.status === 0) {
      logMessage = "Saatiin virhe statuskoodilla 0. Yleensä tapahtuu," +
          "kun palvelimeen ei saada yhteyttä.";
      if (error.error !== undefined) {
        logMessage += ": " + error.error;
      }
    } else {
      logMessage = "Saatin virhe ";
      if (error.status !== undefined) {
        logMessage += "HTTP-tilakoodilla " + error.status;
      }
    }

    if (error.message != undefined) {
      logMessage += ", viestillä: " + error.message;
    }

    if (backendError !== undefined) {
      logMessage += this.getBackendErrorLog(backendError, logMessage);
    }

    console.error(logMessage + " Alkuperäinen vastaus alla.");

    if (backendError !== undefined) {
      console.dir(backendError);
    } else {
      console.dir(error);
    }

    // if (error.status === 403 && error?.error?.error?.tunnus == 1000)  {
    //   this.handleNotLoggedIn();
    // }
    const eiKirjautunut = 1000;
    const eiOikeuksia = 1003;

    if (error.status === 403 && backendError?.tunnus === eiKirjautunut)  {
      this.handleNotLoggedIn();
    } else if (backendError?.tunnus === eiOikeuksia) {
      this.routeToNoPrivileges();
    } else {
      // Komponentin on tarkoitus catchata tämä.
      throw (backendError !== undefined) ? backendError : error;
    }

  }

  private getBackendErrorLog(backendError: Error, logMessage: string): string {
    logMessage += ", palvelimen tilakoodilla " + backendError.tunnus;
    if (backendError.virheilmoitus?.length > 1) {
      logMessage += " ja viestillä: " + backendError.virheilmoitus;
    } else {
      logMessage += ".";
    }
    if (backendError.originaali && backendError.originaali.length > 1) {
      logMessage += " Alkuperäinen palvelimen virheilmoitus: " + backendError.originaali;
    }
    return logMessage
  }

  public handleNotLoggedIn() {
    console.log('errorService.handleNotLoggedIn(): et ole kirjaunut,' +
          'ohjataan virhesivulle.');
    this.store.setNotLoggegIn();
    // window.localStorage.clear();
    // const courseID = getCourseIDfromURL();
    // this.saveRedirectURL();
    this.routeToNoPrivileges();
    // const baseUrl = (courseID == null) ? '' : 'course/' + courseID  + '/';
    // this.router.navigateByUrl(baseUrl + 'forbidden');
  }

  private routeToNoPrivileges() {
    // Ei toimi tässä this.route.snapshot.paramMap.get('courseid').
    const currentRoute = window.location.pathname + window.location.search;
    // Kirjautumisnäkymässä ei koskaan haluta ohjata tähän näkymään.
    if (currentRoute.indexOf('/login') !== -1) return
    const pathArray = window.location.pathname.split('/');
    let baseRoute = '';
    const courseid = pathArray[2];
    if (pathArray[1] === 'course' && courseid != null)  {
      this.router.navigateByUrl('/course/' + courseid + '/forbidden');
    } else {
    this.router.navigateByUrl('forbidden');
    }
  }

  public saveRedirectURL() {
    const currentRoute = window.location.pathname + window.location.search;
    // Kirjautumissivulle ei haluta ohjata.
    if (currentRoute.indexOf('/login') === -1) {
      if (window.localStorage.getItem('REDIRECT_URL') == null) {
      window.localStorage.setItem('REDIRECT_URL', currentRoute);
      console.log('tallennettiin redirect URL: ' + currentRoute);
      } else {
        console.log('Löydettiin redirect URL, ei tallenneta päälle.');
      }
    }
  }

}
