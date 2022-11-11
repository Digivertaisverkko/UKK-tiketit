import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, throwError, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { isValidHttpUrl } from '../utils/isValidHttpUrl.util';
// import { LocalStorageModule } from 'angular-2-local-storage';
import * as shajs from 'sha.js';
import cryptoRandomString from 'crypto-random-string';

export interface LoginResponse {
  success: boolean,
  'login-code': string
}

export interface AuthRequestResponse {
  success: boolean,
  error: string,
  'session-id': string
}

export interface User {
  id: number,
  nimi: string,
  sposti: string,
  asema: 'opettaja' | 'oppilas' | 'admin'
}

@Injectable({
  providedIn: 'root'
})

// Tämä service käsittelee käyttäjäautentikointia.
export class AuthService {

  // Onko käyttäjä kirjautuneena.
  // private isUserLoggedIn$ = new fromEvent<StorageEvent(window, "storage");
  public isUserLoggedIn$ = new BehaviorSubject<boolean>(false);
  private errorMessages$ = new Subject<any>();

  private codeVerifier: string = '';
  private codeChallenge: string = '';
  private loginCode: string = '';

  // Sisältyy oAuth -tunnistautumiseen, mutta ei ole (vielä) käytössä.
  private oAuthState: string = '';
  private codeChallengeMethod: string = 'S256';
  private responseType: string = 'code';

  constructor(private http: HttpClient) {
  }

  // public getSessionID(): string {
  //   if (this.sessionID == undefined) {
  //     console.log('Error: no session id set.');
  //     return('Error');
  //   }
  //   return this.sessionID;
  // }

  // public setSessionID(sessionID: string): void {
  //   this.sessionID = sessionID;
  //   this.isUserLoggedIn$.next(true);
  // }

  // Ala seuraamaan, onko käyttäjä kirjautuneena.
  public onIsUserLoggedIn(): Observable<any> {
    return this.isUserLoggedIn$.asObservable();
  }

  // Lopeta kirjautumisen seuraaminen.
  public unsubscribeIsUserLoggedin(): void {
    this.isUserLoggedIn$.unsubscribe;
  }

  // Ala seuraamaan virheviestejä.
  public onErrorMessages(): Observable<any> {
    return this.errorMessages$.asObservable();
  }

  // Tyhjennä viestit.
  public clearMessages(): void {
    this.errorMessages$.next('');
  }

  // Hae omat tiedot.
  public async getMyUserInfo(courseID: string): Promise<User> {
    if (isNaN(Number(courseID))) {
      throw new Error('authService: Haussa olevat tiedot ovat väärässä muodossa.');
    }
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/oikeudet';
    try {
      response = await firstValueFrom<User>(this.http.get<any>(url, httpOptions));
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  public async logOut(): Promise<any> {
    const sessionID = window.sessionStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      throw new Error('Session ID not found.');
    }
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kirjaudu-ulos';
    try {
      response = await firstValueFrom(this.http.post<{'login-url': string}>(url, null, httpOptions));
      console.log('authService: saatiin vastaus logout kutsuun: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    this.isUserLoggedIn$.next(false);
    window.sessionStorage.clear();
  }

  /* Lähetä 1. authorization code flown:n autentikointiin liittyvä kutsu.
     loginType voi olla atm: 'own' */
  public async sendAskLoginRequest(loginType: string) {
    this.codeVerifier = cryptoRandomString({ length: 128, type: 'alphanumeric' });
    this.codeChallenge =  shajs('sha256').update(this.codeVerifier).digest('hex');
    this.oAuthState = cryptoRandomString({ length: 30, type: 'alphanumeric' });
    // Jos haluaa storageen tallentaa:
    // this.storage.set('state', state);
    // this.storage.set('codeVerifier', codeVerifier);
    //this.logBeforeLogin();
    let url: string = environment.apiBaseUrl + '/login';
    const httpOptions =  {
      headers: new HttpHeaders({
        'login-type': loginType,
        'code-challenge': this.codeChallenge
      })
    };
    // console.log(httpOptions);
    let response: any;
    try {
      console.log('Lähetetään 1. kutsu');
      response = await firstValueFrom(this.http.post<{'login-url': string}>(url, null, httpOptions));
      // console.log('authService: saatiin vastaus 1. kutsuun: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response['login-url'] == undefined) {
      throw new Error("Palvelin ei palauttanut login URL:a.");
    }
    const loginUrl = response['login-url'];
    console.log('loginurl : ' +loginUrl);
    return loginUrl;
  }

  /* Lähetä 2. authorization code flown:n autentikointiin liittyvä kutsu.*/
  public async sendLoginRequest(email: string, password: string, loginID: string) {
    const httpOptions =  {
      headers: new HttpHeaders({
        'ktunnus': email,
        'salasana': password,
        'login-id': loginID
      })
    }
    const url = environment.apiBaseUrl + '/omalogin';
    let response: any;
    try {
      console.log('Kutsu ' + url + ':ään. lähetetään (alla):');
      console.log(httpOptions.headers);
      response = await firstValueFrom(this.http.post<LoginResponse>(url, null, httpOptions));
      console.log('authService: saatiin vastaus 2. kutsuun: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    if (response.success == true && response['login-code'] !== undefined) {
      console.log(' login-code: ' + response['login-code']);
      this.loginCode = response['login-code'];
      console.log(' lähetetään: this.sendAuthRequest( ' + this.codeVerifier + ' ' + this.loginCode);
      this.sendAuthRequest(this.codeVerifier, this.loginCode);
    } else {
      console.error("Login authorization not succesful.");
      if (response)
      this.sendErrorMessage("(ei virheviestä)");

      // Ei ole error messageja tälle (vielä) api:ssa
      // console.error("Login attempt failed : " + response.error);
      // this.sendErrorMessage(response.error);
    }
  }

  /* Lähetä 3. authorization code flown:n autentikointiin liittyvä kutsu. */
  private async sendAuthRequest(codeVerifier: string, loginCode: string) {
    const httpOptions =  {
      headers: new HttpHeaders({
        'login-type': 'own',
        'code-verifier': codeVerifier,
        'login-code': loginCode,
      })
    }
    const url = environment.apiBaseUrl + '/authtoken';
    let response: any;
    try {
      console.log('Lähetetään auth-request headereilla: ');
      console.dir(httpOptions);
      response = await firstValueFrom(this.http.get<AuthRequestResponse>(url, httpOptions));
      console.log('sendAuthRequest: got response: ');
      console.log(JSON.stringify(response));
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response.success == true) {
      // console.log('sendAuthRequest: Got Session ID: ' + response['login-id']);
      console.log('Vastaus: ' + JSON.stringify(response));
      // let sessionID = response['login-id'];
      console.log('vastauksen sisältöä: ');

      let sessionID = response['session-id'];
      console.log(' -- session ID on ' + sessionID);
      this.saveSessionStatus(sessionID);
      console.log('Authorization success.');
    } else {
      console.error(response.error);
      this.sendErrorMessage(response.error);
    }
  }

  // Onko käyttäjät kirjautunut.
  public getIsUserLoggedIn(): Boolean {
    const sessionID = window.sessionStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      return false
    } else {
      return true
    }
  }

  public saveSessionStatus(sessionID: string) {
    this.isUserLoggedIn$.next(true);
    window.sessionStorage.setItem('SESSION_ID', sessionID);
    console.log('tallennettiin sessionid: ' + sessionID);
  }


  // Palauta HttpOptions, johon on asetettu session-id headeriin.
  private getHttpOptions(): object {
    let sessionID = window.sessionStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      throw new Error('No session id set.');
    }
    console.log('session id on: ' + sessionID);
    let options = {
      headers: new HttpHeaders({
        'session-id': sessionID
      })
    };
    return options;
  }

  // Näytä sendAskLoginRequest:n liittyviä logeja.
  private printAskLoginLog(response: any, loginUrl: string) {
    console.log('Got response: ');
    console.dir(response);
    console.log('Response as string: ' + loginUrl);
    if (isValidHttpUrl(loginUrl)) {
      console.log('It seems valid url.');
    } else {
      console.log("It's not valid url.");
    }
  }

  // Lähetä virheviesti näkymään.
  private sendErrorMessage(message: string) {
    this.errorMessages$.next(message);
  }

  // private getCodeChallenge(codeVerifier: string): string {
    // let codeVerifierHash = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
    // let codeChallenge = codeVerifierHash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    // return shajs('sha256').update({stringToBeHashed}).digest('hex')

      // const encoder = new TextEncoder();
      // const data = encoder.encode(codeVerifier);
      // return window.crypto.subtle.digest('SHA-256', data).then(array => {
      //   return this.base64UrlEncode(array);
      // });
  // }

  // base64UrlEncode(array) {
  //   return btoa(String.fromCharCode.apply(null, new Uint8Array(array)))
  //       .replace(/\+/g, '-')
  //       .replace(/\//g, '_')
  //       .replace(/=+$/, '');
  // }

    // Onko string muodoltaan HTTP URL.
    isValidHttpUrl(testString: string): boolean {
      let url: URL;
      try {
        url = new URL(testString);
      } catch (_) {
        return false;
      }
      return url.protocol === "http:" || url.protocol === "https:";
    }

  // Virheidenkäsittely
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred.
         console.error('Virhe tapahtui:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Saatiin virhe tilakoodilla ${error.status} ja viestillä: `,
        error.error
      );
    }
    let message = "Yhteydenotto palvelimeen ei onnistunut.";
    if (error !== undefined) {
      if (error.error.length > 0 ) {
        message += "Virhe: " + error.error;
      }
      if (error.status !== undefined ) {
        message += "Tilakoodi: " + error.status;
      }
    }
    this.sendErrorMessage(message);
    return throwError(() => new Error("Unable to continue authentication."));
  }

    // Palvelimelta saatujen vastauksien virheenkäsittely.
    private checkErrors(response: any) {
      var message: string = '';
      if (response == undefined) {
        message = 'Virhe: ei vastausta palvelimelta.';
        this.sendErrorMessage(message);
        throw new Error(message);
      }
      if (response.error !== undefined) {
        let errorInfo: string = '';
        const error = response.error;
        errorInfo = 'Virhekoodi: ' + error.tunnus + ', virheviesti: ' + error.virheilmoitus;
        message = 'Yhteydenotto palvelimeen epäonnistui. ' + errorInfo;
        this.sendErrorMessage(message);
        throw new Error(message);
      }
    }

  // Näytä client-side login tietoja ennen kirjautumisyritystä.
  private logBeforeLogin() {
    console.log('authService (before asking login):');
    console.log('Response type: ' + this.responseType);
    console.log('Code Verifier: ' + this.codeVerifier);
    console.log('Code challenge : ' + this.codeChallenge);
    console.log('oAuthState: ' + this.oAuthState);
  }

}
