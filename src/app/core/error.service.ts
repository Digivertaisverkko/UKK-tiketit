import { Injectable, Injector } from '@angular/core';
// import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  // private auth: AuthService = {} as AuthService;

  constructor( injector: Injector) {
    // Tällä vältetään circular dependency.
    // setTimeout( () => this.auth = injector.get(AuthService));
  }

  /* Käsittellään virheet ensin yleisellä tasolla, jonka jälkeen heitetään ne eteenpäin.
     Käsittely sisältää lähinnä virheen logituksen consoleen.
  */
  public handleServerError(error: any): never {
    var logMessage: string; // Pastetaan consoleen.
    var backendResponse = error?.error;
    var backendError = backendResponse?.error;

    // console.log('errori:');
    // console.dir(error);

    if (error.status === 0) {
      // A client-side or network error occurred.
      logMessage = 'Saatiin virhe statuskoodilla 0. Yleensä tapahtuu, kun palvelimeen ei saada yhteyttä.';
      if (error.error !== undefined) {
        logMessage += ": " + error.error;
      }
    } else {
      // The backend returned an unsuccessful response code.
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
      if (backendError.virheilmoitus?.length > 1 ) {
        logMessage += " ja viestillä: " + backendError.virheilmoitus;
      } else {
        logMessage += ".";
      }
      if (backendError.original?.length > 0) {
        logMessage += " Alkuperäinen virheilmoitus: " + backendError.original;
      }
    }
    
    console.error(logMessage + ". Alkuperäinen vastaus alla.");

    if (backendError !== undefined) {  
      console.dir(backendError);
      throw backendError;
    } else {
      console.dir(error);
      throw error;
    }
    // return throwError(() => new Error(error));
  }

}