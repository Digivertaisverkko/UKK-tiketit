import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { Error } from "../core.models";
import { StoreService } from "./store.service";
import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";

interface BackendErrorResponse {
  success: boolean,
  error: Error
}

const CODE = {
  notSignedIn: 1000,
  noConnection: 1001,
  wrongCredentials: 1002,
  noPermission: 1003,
  accountAlreadyExists: 1010,
  noResults: 2000,
  wrongParameters: 3000,
  operationNotPossible: 3001,
  unfinishedAPI: 3002,
  somethingWentWrong: 3004
}

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

  /* Palauta samanlaisen virheen kuin palvelin. status on HTTP error status koodi,
      errorid on palvelimen nelinumeroinen virhekoodi. */
  public createError(status: number, errorid: number): BackendErrorResponse { 
    var e: BackendErrorResponse = {
      success: false,
      error: {
        tunnus: errorid
      } 
    };

    var status = 418;

    switch (errorid) {
        case CODE.notSignedIn:
            e.error.virheilmoitus = "Et ole kirjautunut.";
            status = 403
            break;
        case CODE.noConnection:
            e.error.virheilmoitus = "Kirjautumispalveluun ei saatu yhteyttä.";
            status = 503
            break;
        case CODE.wrongCredentials:
            e.error.virheilmoitus = "Väärä käyttäjätunnus tai salasana."
            status = 403
            break;
        case CODE.noPermission:
            e.error.virheilmoitus = "Ei tarvittavia oikeuksia.";
            status = 403
            break;
        case CODE.accountAlreadyExists:
            e.error.virheilmoitus = "Luotava tili on jo olemassa."
            status = 500
            break;
        case CODE.noResults:
            e.error.virheilmoitus = "Tuloksia ei löytynyt.";
            status = 204
            break;
        case CODE.wrongParameters:
            e.error.virheilmoitus = "Virheelliset parametrit.";
            status = 400
            break;
        case CODE.operationNotPossible:
            e.error.virheilmoitus = "Operaatiota ei voida suorittaa.";
            status = 400;
            break;
        case CODE.unfinishedAPI:
            e.error.virheilmoitus = "Rajapintaa ei ole vielä toteutettu.";
            status = 405;
            break;
        default:
            e.error.tunnus = CODE.somethingWentWrong;
            e.error.virheilmoitus = "Joku meni vikaan."
            e.error.originaali = String(errorid);
            status = 500
            break;
    }

    return e
  }

  public handleServerError(error: HttpErrorResponse) {
    var backendResponse = error?.error;
    var backendError: Error = backendResponse?.error;

    var logMessage = this.getHttpErrorLog(error);

    console.error(logMessage);

    if (backendError !== undefined) {
      console.error(this.getBackendErrorLog(backendError));
    }

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

  private getBackendErrorLog(backendError: Error): string {
    let logMessage = "Palvelimen virheen tilakoodi " + backendError.tunnus;

    if (backendError?.virheilmoitus && backendError?.virheilmoitus?.length > 1) {
      logMessage += ' ja viesti: "' + backendError.virheilmoitus + '".';
    } else {
      logMessage += ".";
    }

    if (backendError.originaali && backendError.originaali.length > 1) {
      logMessage += " Alkuperäinen palvelimen virheilmoitus: " + backendError.originaali;
    }

    return logMessage;
  }

  private getHttpErrorLog(error: any): string {
    let logMessage = '';

    console.warn('errori alla');
    console.dir(error);

    if (error.status === 0) {
      logMessage = "Saatiin virhe statuskoodilla 0. Yleensä tapahtuu," +
          "kun palvelimeen ei saada yhteyttä.";
      if (error.error !== undefined) {
        logMessage += ": " + error.error;
      }
    } else {
      logMessage = "Saatin virhe";
      if (error.status !== undefined) {
        logMessage += " HTTP-tilakoodilla " + error.status;
      }
      if (error.message != undefined) {
        logMessage += ' ja viestillä: "' + error.message;
      }
      logMessage += '.';
    }
    return logMessage;
  }


  public handleNotLoggedIn(): void {
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

  private routeToNoPrivileges(): void {
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

  public saveRedirectURL(): void {
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
