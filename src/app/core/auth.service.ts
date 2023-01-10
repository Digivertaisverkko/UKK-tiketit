import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, throwError, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { isValidHttpUrl } from '../utils/isValidHttpUrl.util';
import { truncate } from '../utils/truncate';
import { Router } from '@angular/router';
// import { LocalStorageModule } from 'angular-2-local-storage';
import * as shajs from 'sha.js';
import cryptoRandomString from 'crypto-random-string';

export interface LoginResponse {
  success: boolean,
  'login-code': string
}

interface LoginResult {
  success: boolean,
  redirectUrl?: string
};

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

export interface GenericResponse {
  success: boolean,
  error: object
}

@Injectable({
  providedIn: 'root'
})

// Tämä service käsittelee käyttäjäautentikointia.
export class AuthService {

  // Onko käyttäjä kirjautuneena.
  // private isUserLoggedIn$ = new fromEvent<StorageEvent(window, "storage");
  public isUserLoggedIn$ = new BehaviorSubject<boolean>(false);
  private userRole$ = new BehaviorSubject<string>('');
  private userName$ = new BehaviorSubject<string>('');
  private userEmail$ = new BehaviorSubject<string>('');
  private errorMessages$ = new Subject<any>();

  private codeVerifier: string = '';
  private codeChallenge: string = '';
  private loginCode: string = '';

  // Sisältyy oAuth -tunnistautumiseen, mutta ei ole (vielä) käytössä.
  private oAuthState: string = '';
  private codeChallengeMethod: string = 'S256';
  private responseType: string = 'code';

  constructor(private http: HttpClient,
              private router: Router) {
  }

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

  // Tyhjennä viestit
  public clearMessages(): void {
    this.errorMessages$.next('');
  }

  public onGetUserRole(): Observable<any> {
    return this.userRole$.asObservable();
  }

  public onGetUserName(): Observable<any> {
    return this.userName$.asObservable();
  }

  public onGetUserEmail(): Observable<any> {
    return this.userEmail$.asObservable();
  }

  // Alustetaan ohjelman tila huomioiden, että sessio voi olla aiemmin
  // aloitettu.
  public initialize() {
    if (window.sessionStorage.getItem('USER_ROLE') !== null) {
      const userRole = window.sessionStorage.getItem('USER_ROLE');
      switch (userRole) {
        case "opettaja":
        case "opiskelija":
        case "admin": {
          this.userRole$.next(userRole);
          // console.log('havaittiin user role ' + userRole);
        }
      }
    }
    if (window.sessionStorage.getItem('SESSION_ID') !== null) {
      const isUserLoggedIn: string | null = window.sessionStorage.getItem('SESSION_ID');
        this.isUserLoggedIn$.next(true);
    }
    if (window.sessionStorage.getItem('USER_NAME') !== null) {
      const userName: string | null = window.sessionStorage.getItem('USER_NAME');
      if (userName !== null && userName.length > 0 ) {
        this.userName$.next(userName);
      }
    }
    if (window.sessionStorage.getItem('EMAIL') !== null) {
      const userEmail: string | null = window.sessionStorage.getItem('EMAIL');
      if (userEmail !== null && userEmail.length > 0 ) {
        this.userEmail$.next(userEmail);
      }
    }
  }

  // public async handleNotLoggedIn() {
  //   console.log('authService.handleNotLoggedIn(): et ole kirjaunut, ohjataan kirjautumiseen.')
  //   const loginUrl = await this.sendAskLoginRequest('own');
  //   // console.log('Tallennettiin redirect URL: ' + window.location.pathname);
  //   const route = window.location.pathname;
  //   if (route.startsWith('/login') == false) {
  //     window.sessionStorage.setItem('REDIRECT_URL', window.location.pathname);
  //   }
  //   this.router.navigateByUrl(loginUrl);
  // }

  public setUserRole(asema: 'opiskelija' | 'opettaja' | 'admin' | '') {
    window.sessionStorage.setItem('USER_ROLE', asema);
    this.userRole$.next(asema);
  }

  public setUserName(name: string) {
    window.sessionStorage.setItem('USER_NAME', name);
    this.userName$.next(name);
  }

  public getUserName(): string | null {
    return window.sessionStorage.getItem('USER_NAME');
  }

  public setUserEmail(email: string) {
    window.sessionStorage.setItem('USER_EMAIL', email);
    this.userEmail$.next(email);
  }

  // Luo käyttäjätili
  public async addUser(email: string, password: string): Promise<boolean> {
    // ktunnus on sama kuin sposti.
    const body = {
      'ktunnus': email,
      'salasana': password,
      'sposti': email
    };
    const url = environment.apiBaseUrl + '/luotili';
    let response: any;
    try {
      console.log('Kutsu ' + url + ':ään. lähetetään (alla):');
      // console.dir(httpOptions);
      response = await firstValueFrom(this.http.post<GenericResponse>(url, body));
      console.log('authService: saatiin vastaus POST-kutsuun URL:iin ' + url + ': ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    if (response.success == true) {
      this.sendErrorMessage($localize `:@@Käyttäjän rekisteröinti:Käyttäjän rekisteröinti` + ' ' + $localize `:@@onnistui:onnistui` + '.');
      return true;
    } else {
      this.sendErrorMessage($localize `:@@Käyttäjän rekisteröinti:Käyttäjän rekisteröinti` + ' ' + $localize `:@@ei onnistunut:ei onnistunut` + '.');
      return false;
    }
  }

  // Hae omat kurssikohtaiset tiedot.
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

    if (response?.sposti > 0 ) {
      window.sessionStorage.setItem('EMAIL', response.sposti);
      this.userEmail$.next(response.sposti);
    }

    return response;
  }

  // Suorita uloskirjautuminen.
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
    } finally {
      this.isUserLoggedIn$.next(false);
      this.setUserName('');
      this.setUserRole('');
      this.setUserEmail('');
      window.sessionStorage.clear();
    }
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
      console.log('authService: saatiin vastaus 1. kutsuun: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    if (response['login-url'] == undefined) {
      throw new Error("Palvelin ei palauttanut login URL:a. Ei pystytä kirjautumaan.");
    }
    const loginUrl = response['login-url'];
    // console.log('loginurl : ' +loginUrl);
    return loginUrl;
  }

  /* Lähetä 2. authorization code flown:n autentikointiin liittyvä kutsu.*/
  public async sendLoginRequest(email: string, password: string, loginID: string): Promise<LoginResult> {
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
      if (error.status === 403) {
        const message = $localize`:@@Väärä käyttäjätunnus tai salasana:Virheellinen käyttäjätunnus tai salasana` + '.';
        this.sendErrorMessage(message);
      }
      this.handleError(error);
    }
    this.checkErrors(response);
    if (response.success == true && response['login-code'] !== undefined) {
      console.log(' login-code: ' + response['login-code']);
      this.loginCode = response['login-code'];
      console.log(' lähetetään: this.sendAuthRequest( ' + this.codeVerifier + ' ' + this.loginCode);
      return this.sendAuthRequest(this.codeVerifier, this.loginCode);
    } else {
      return { success: false };
    }
  }

  /* Lähetä 3. authorization code flown:n autentikointiin liittyvä kutsu. */
  private async sendAuthRequest(codeVerifier: string, loginCode: string): Promise<LoginResult> {
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
      console.log('Lähetetään auth-request headereilla (alla):');
      console.dir(httpOptions);
      response = await firstValueFrom(this.http.get<AuthRequestResponse>(url, httpOptions));
      console.log('sendAuthRequest: got response: ');
      console.log(JSON.stringify(response));
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);

    var loginResult: LoginResult;
    if (response.success !== undefined && response.success == true) {
      loginResult = { success: true };
      if (window.sessionStorage.getItem('REDIRECT_URL') !== undefined) {
        const redirectUrl = window.sessionStorage.getItem('REDIRECT_URL');
        if (redirectUrl !== null) {
          loginResult.redirectUrl = redirectUrl;
        }
      }
      // console.log('sendAuthRequest: Got Session ID: ' + response['login-id']);
      // console.log('Vastaus: ' + JSON.stringify(response));
      // let sessionID = response['login-id'];
      console.log('vastauksen sisältöä: ');

      let sessionID = response['session-id'];
      // console.log(' -- session ID on ' + sessionID);
      this.saveSessionStatus(sessionID);

      // onsole.log('Authorization success.');
    } else {
      loginResult = { success: false };
      console.error(response.error);
    }
    return loginResult;
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
      throw new Error('Session ID:ä ei ole asetettu. Kutsut palvelimeen eivät toimi.');
    }
    // console.log('session id on: ' + sessionID);
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

// HTTP-kutsujen virheidenkäsittely
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred.
      console.error('Virhe tapahtui:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Saatiin virhe tilakoodilla ${error.status} ja viestillä: `,
        truncate(error.error, 250, true)
      );
    }
    let message: string = '';
    if (error !== undefined) {
      if (error.error.length > 0 ) {
        message += $localize `:@@Virhe:Virhe` + ': ' + error.error;
      }
      if (error.status !== undefined ) {
        message += `:@@Tilakoodi:Tilakoodi` + ': ' + error.status;
      }
    }
    return throwError(
      () => new Error(message)
    );
  }

  // Palvelimelta saatujen vastauksien virheenkäsittely.
  private checkErrors(response: any) {
    var message: string = '';
    if (response == undefined) {
      message = $localize `:@@Ei vastausta palvelimelta:Ei vastausta palvelimelta`;
      this.sendErrorMessage(message);
      throw new Error(message);
    }
    if (response.error == undefined) {
      return
    }
    switch (response.error.tunnus) {
      case 1000:
        message = $localize`:@@Et ole kirjautunut:Et ole kirjautunut` + '.';
        break;
      case 1001:
        message = $localize`:@@Kirjautumispalveluun ei saatu yhteyttä:Kirjautumispalveluun ei saatu yhteyttä` + '.';
        break;
      case 1002:
        message = $localize`:@@Väärä käyttäjätunnus tai salasana:Virheellinen käyttäjätunnus tai salasana` + '.';
        break;
      case 1003:
        message = $localize`:@@Ei oikeuksia:Ei käyttäjäoikeuksia resurssiin` + '.';
        break;
      case 1010:
        message = $localize`:@@Luotava tili on jo olemassa:Luotava tili on jo olemassa` + '.';
        break;
      case 2000:
        // Ei löytynyt: ei virhettä.
        break;
      case 3000:
      case 3004:
        throw new Error(response.error);
      default:
        throw new Error('Tuntematon virhetunnus: ' + JSON.stringify(response.error));
    }
    if (message.length > 0) {
      this.sendErrorMessage(message);
      console.error($localize`:@@Virhe:Virhe` + ': ' + message);
    }
    if (response.error.tunnus !== 2000) {
      throw new Error('Virhe: tunnus: ' + response.error.tunnus + ', viesti: ' + truncate(response.error.virheilmoitus, 250, true));
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
