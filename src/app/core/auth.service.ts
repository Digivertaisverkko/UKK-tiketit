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

  public onIsUserLoggedIn(): Observable<any> {
    return this.isUserLoggedIn$.asObservable();
  }

  public unsubscribeIsUserLoggedin(): void {
    this.isUserLoggedIn$.unsubscribe;
  }

  public onErrorMessages(): Observable<any> {
    return this.errorMessages$.asObservable();
  }

  public clearMessages(): void {
    this.errorMessages$.next('');
  }

  public async logOut(): Promise<any> {

    const sessionID = window.sessionStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      throw new Error('Session ID not found.');
    }
    const httpOptions =  {
      headers: new HttpHeaders({
        'session-id': sessionID
      })
    }
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
    // this.logBeforeLogin();
    let url: string = environment.ownAskLoginUrl;
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

    // this.checkErrors(response);
    if (response['login-url'] !== undefined) {
      const loginUrl = response['login-url'];
      console.log('authService: saatiin vastaus POST pyyntöön URL:iin ' + url + ' :' + JSON.stringify(response), 'green');
      this.colorTrace('Yhteydenotto palvelimeen onnistui.', 'green');
      return loginUrl;
    } else {
      let message = 'Yhteydenotto palvelimeen ei onnistunut.';
      this.sendErrorMessage(message);
      throw new Error(message);
    }
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
    const url = environment.ownLoginUrl;
    let response: any;
    try {
      console.log('Kutsu ' + url + ':ään. lähetetään (alla):');
      console.log(httpOptions.headers);
      response = await firstValueFrom(this.http.post<LoginResponse>(url, null, httpOptions));
      this.colorTrace('authService: saatiin vastaus POST -kutsuun URL:iin ' + url + ': ' + JSON.stringify(response), 'green');
    } catch (error: any) {
      this.handleError(error);
    }
    if (response.success == true) {
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

  private colorTrace(msg: string, color: string) {
    console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
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
    const url = environment.ownTokenUrl;
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

  public saveSessionStatus(sessionID: string) {
    this.isUserLoggedIn$.next(true);
    window.sessionStorage.setItem('SESSION_ID', sessionID);
    console.log('tallennettiin sessionid: ' + sessionID);
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
        `Palvelin palautti virhetilan ${error.status}, viesti oli: `, error.error);
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
    return throwError(() => new Error(message));
  }

  // Show logs before login.
  private logBeforeLogin() {
    console.log('authService (before asking login):');
    console.log('Response type: ' + this.responseType);
    console.log('Code Verifier: ' + this.codeVerifier);
    console.log('Code challenge : ' + this.codeChallenge);
    console.log('Server login url: ' + environment.ownAskLoginUrl);
    console.log('oAuthState: ' + this.oAuthState);
  }
}
