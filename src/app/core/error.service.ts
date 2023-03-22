import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Injectable({ providedIn: 'root' })

export class ErrorService {

  constructor(private router: Router,
              private route: ActivatedRoute) {
  }

  /* Käsittellään virheet ensin yleisellä tasolla, jonka jälkeen heitetään ne
    eteenpäin. Jos virhe on palvelimen käyttämää muotoa, heitetään virhe
    siinä muodossa. Käsittely sisältää virheen logituksen consoleen.
  */

  public handleServerError(error: any): never {
    var backendResponse = error?.error;
    var backendError: Error = backendResponse?.error;
    var logMessage: string; // Pastetaan consoleen.

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
      logMessage += ", palvelimen tilakoodilla " + backendError.tunnus;
      if (backendError.virheilmoitus?.length > 1) {
        logMessage += " ja viestillä: " + backendError.virheilmoitus;
      } else {
        logMessage += ".";
      }
      if (backendError.originaali && backendError.originaali.length > 1) {
        logMessage += " Alkuperäinen virheilmoitus: " + backendError.originaali;
      }
    }

    console.error(logMessage + ". Alkuperäinen vastaus alla.");

    if (backendError !== undefined) {
      console.dir(backendError);
    } else {
      console.dir(error);
    }

    if (backendError?.tunnus && backendError?.tunnus === 1003) {
      const courseID = this.route.snapshot.paramMap.get('courseid')
      console.log('***** courseID: ' + courseID);
      const baseRoute = courseID ? '/course/:courseid' : '';
      this.router.navigateByUrl(baseRoute + '/forbidden');
    }

    throw (backendError !== undefined) ? backendError : error;
  }
}

export interface Error {
  tunnus: number;
  virheilmoitus: string;
  originaali?: string;
}
