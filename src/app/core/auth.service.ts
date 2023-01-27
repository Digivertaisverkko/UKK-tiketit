import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, throwError, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { isValidHttpUrl } from '../utils/isValidHttpUrl.util';
import { truncate } from '../utils/truncate';
import { Router } from '@angular/router';
import * as shajs from 'sha.js';
import cryptoRandomString from 'crypto-random-string';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})

// Tämä service käsittelee käyttäjäautentikointia.
export class AuthService {

  // Onko käyttäjä kirjautuneena.
  // private isUserLoggedIn$ = new fromEvent<StorageEvent(window, "storage");
  private isUserLoggedIn$ = new BehaviorSubject<boolean>(false);

  // Tullaan siirtymään käyttäjätiedoissa tähän:
  private user$ = new BehaviorSubject <User>({ id: 0, nimi: '', sposti: '', asema: '' });

  // private activeCourse$ = new BehaviorSubject <Kurssi>({ id: '0', nimi: '' });

  // Vanhat, vielä monessa paikkaa käytössä olevat:
  // private userRole$ = new BehaviorSubject <string>('');
  private userName$ = new BehaviorSubject <string>('');
  // private userEmail$ = new BehaviorSubject <string>('');

  private codeVerifier: string = '';
  private codeChallenge: string = '';
  private loginCode: string = '';

  // Sisältyy oAuth -tunnistautumiseen, mutta ei ole (vielä) kimage/pjpeg;base64,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äytössä.
  private oAuthState: string = '';
  private codeChallengeMethod: string = 'S256';
  private responseType: string = 'code';

  constructor(private errorService: ErrorService,
              private http: HttpClient,
              private router: Router) {
  }

  /* Alustetaan ohjelman tila huomioiden, että kirjautumiseen liittyvät tiedot voivat
    olla jo local storagessa. */
  public async initialize() {
    if (window.localStorage.getItem('SESSION_ID') == null) {
      return
    }
    const savedCourseID: string | null = window.localStorage.getItem('COURSE_ID');
    if (savedCourseID !== null) {
      // session id voi olla vanhentunut, mutta asetetaan kirjautuneeksi,
      // jotta ei ohjauduta loginiin page refresh:lla.
      this.setLoggedIn();
      this.saveUserInfo(savedCourseID);
    } else {
      console.log('authService.initialize: ei kurssi ID:ä!');
    }
  }

  // Aseta aktiivinen kurssi ja päivitä lokaalit käyttäjätiedot, jos niitä ei ole haettu.
  public setActiveCourse(courseID: string | null) {
    // Tallennetaan kurssi-ID sessioon, jos se on vaihtunut.
    // if (courseID !== null && this.activeCourse$.value.id !== courseID) {
    if (courseID !== null) {
      window.localStorage.setItem('COURSE_ID', courseID);
      // Nimi ei vielä käytössä.
      // this.activeCourse$.next({ id: courseID, nimi: ''});
      if (this.user$.value.id === 0) {
        this.getUserInfo();
      }
    }
  }

  public setLoggedIn() {
    if (this.isUserLoggedIn$.value == false) {
      this.isUserLoggedIn$.next(true);

      console.log('Olet nyt kirjautunut.');
    }
  }

  public setNotLoggegIn() {
    if (this.isUserLoggedIn$.value == true) {
      this.isUserLoggedIn$.next(false);
    }
  }

  // Ala seuraamaan, onko käyttäjä kirjautuneena.
  public onIsUserLoggedIn(): Observable<any> {
    return this.isUserLoggedIn$.asObservable();
  }

  // Lopeta kirjautumisen seuraaminen.
  public unsubscribeIsUserLoggedin(): void {
    this.isUserLoggedIn$.unsubscribe;
  }

  public getUserRole(): 'opettaja' | 'opiskelija' | 'admin' | '' {
    let user = this.user$.value;
    return (user.asema == null) ? '' : user.asema;
  }

  public getUserInfo(): User {
    const user: User | null = this.user$.value;
    // Hae käyttäjätiedot jos niitä ei ole?
    // if (user == null || user.nimi.length == 0) {
    //   const courseID: string = this.ticketService.getActiveCourse();
    //   this.getMyUserInfo(courseID).then( response => {
    //     this.user$.next(response)
    //   }).catch(error => {
    //     console.log("getUserInfo(): Virhe: ei saatu haettua käyttäjän tietoja");
    //   })
    // }
    return user;
  }

  private getActiveCourse(): string {
    var courseID: string = '';
    const savedCourseID: string | null = window.localStorage.getItem('COURSE_ID');
    if (savedCourseID !== null) {
        courseID = savedCourseID;
      } else {
        throw new Error('auth.Service: getActiveCourse(): Virhe: kurssi ID:ä ei löydetty.');
      }
    return courseID;
  }

  public trackUserInfo(): Observable<User> {
    return this.user$.asObservable();
  }

  public setSessionID(newSessionID: string) {
    const oldSessionID =  window.localStorage.getItem('SESSION_ID');
    if (oldSessionID !== undefined && oldSessionID !== newSessionID)
    window.localStorage.setItem('SESSION_ID', newSessionID);
  }

  public getSessionID(): string | null {
    return window.localStorage.getItem('SESSION_ID');
  }

  public async handleNotLoggedIn() {
    console.log('authService.handleNotLoggedIn(): et ole kirjaunut, ohjataan kirjautumiseen.');
    
    const loginUrl = await this.sendAskLoginRequest('own');
    // console.log('Tallennettiin redirect URL: ' + window.location.pathname);
    const currentRoute = window.location.pathname + window.location.search;
    if (currentRoute.startsWith('/login') == false) {
      window.localStorage.setItem('REDIRECT_URL', window.location.pathname + window.location.search);
    }
    this.router.navigateByUrl(loginUrl);
  }

  public getUserName(): string | null {
    // return this.userName$.value;
    const user: User  = this.user$.value;
    return user.nimi;
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
    // this.checkErrors(response);
    if (response.success == true) {
      // this.sendErrorMessage($localize `:@@Käyttäjän rekisteröinti:Käyttäjän rekisteröinti` + ' ' + $localize `:@@onnistui:onnistui` + '.');
      return true;
    } else {
      // this.sendErrorMessage($localize `:@@Käyttäjän rekisteröinti:Käyttäjän rekisteröinti` + ' ' + $localize `:@@ei onnistunut:ei onnistunut` + '.');
      return false;
    }
    
  }

  // Hae ja tallenna palvelimelta käyttöjätiedot paikallisesti käytettäviksi. Tarvitsee, että session id on asetettu.
  // Tästä luovutaan. Jatkossa yksi käyttäjäobjekti on vain auth.service:ssä.
  public async saveUserInfo(courseID: string) {
    if (window.localStorage.getItem('SESSION_ID') == null) {
      console.error('Virhe: saveUserInfo(): ei session id:ä, ei voida hakea ja tallentaa tietoja.');
      return;
    }
    try {
      const userInfo = await this.getMyUserInfo(courseID);
      if (userInfo !== null) {
        this.user$.next(userInfo);
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // Hae omat kurssikohtaiset tiedot.
  private async getMyUserInfo(courseID: string): Promise<User> {
    if (isNaN(Number(courseID))) {
      throw new Error('authService: Haussa olevat tiedot ovat väärässä muodossa.');
    }
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/oikeudet';
    try {
      response = await firstValueFrom<User>(this.http.get<any>(url, httpOptions));
      console.log('Haettiin käyttäjätiedot URL:lla "' + url + '" vastaus: ' + JSON.stringify(response))
      this.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
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
    let response: any;
    try {
      console.log('Lähetetään 1. kutsu');
      response = await firstValueFrom(this.http.post<{'login-url': string}>(url, null, httpOptions));
      console.log('authService: saatiin vastaus 1. kutsuun: ' + JSON.stringify(response));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response['login-url'] == undefined) {
      throw new Error("Palvelin ei palauttanut login URL:a. Ei pystytä kirjautumaan.");
    }
    const loginUrl = response['login-url'];
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
      this.handleError(error);
    }
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
      // console.log('Lähetetään auth-request headereilla (alla):');
      // console.dir(httpOptions);
      response = await firstValueFrom(this.http.get<AuthRequestResponse>(url, httpOptions));
      console.log('sendAuthRequest: got response: ');
      console.log(JSON.stringify(response));
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    var loginResult: LoginResult;
    if (response.success !== undefined && response.success == true) {
      loginResult = { success: true };
      if (window.localStorage.getItem('REDIRECT_URL') !== undefined) {
        const redirectUrl = window.localStorage.getItem('REDIRECT_URL');
        if (redirectUrl !== null) {
          loginResult.redirectUrl = redirectUrl;
        }
      }
      window.localStorage.removeItem('REDIRECT_URL')
      // console.log('sendAuthRequest: Got Session ID: ' + response['login-id']);
      // console.log('Vastaus: ' + JSON.stringify(response));
      let sessionID = response['session-id'];
      this.setLoggedIn();
      this.setSessionID(sessionID);
      // Kurssi ID voi olla, jos ollaan tultu loggaamattomaan näkymään ensin.
      const courseID: string | null = window.localStorage.getItem('COURSE_ID');
      if (courseID !== null) {
        console.log('-- ajetaan saveUserInfo ----');
        await this.saveUserInfo(courseID);
      } else {
        // console.log('-- ei ajettu saveUserInfo: kurssi ID: ' + courseID + ' ----');
      }
    } else {
      loginResult = { success: false };
      console.error(response.error);
    }
    return loginResult;
  }

  // Onko käyttäjät kirjautunut.
  public getIsUserLoggedIn(): Boolean {
    return this.isUserLoggedIn$.value;
  }

  // Palauta HttpOptions, johon on asetettu session-id headeriin.
  private getHttpOptions(): object {
    let sessionID = window.localStorage.getItem('SESSION_ID');
    // if (sessionID == undefined) {
    //   throw new Error('Session ID:ä ei ole asetettu. Ei olla kirjautuneita.');
    // }
    // console.log('session id on: ' + sessionID);
    var options;
    if (sessionID == null ) {
      options = {}
    } else {
      options = {
        headers: new HttpHeaders({
          'session-id': sessionID
        })
      };
    }
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

  // Lähetä muotoiltuvirheilmoitus consoleen, puutu ylemmän tason virheisiin kuten jos ei olle kirjautuneita.
  // Lähetä virheilmoitus templateen napattavaksi backendin virheolion muodossa.


  // Näytä client-side login tietoja ennen kirjautumisyritystä.
  private logBeforeLogin() {
    console.log('authService (before asking login):');
    console.log('Response type: ' + this.responseType);
    console.log('Code Verifier: ' + this.codeVerifier);
    console.log('Code challenge : ' + this.codeChallenge);
    console.log('oAuthState: ' + this.oAuthState);
  }

  // Suorita uloskirjautuminen.
  public async logOut(): Promise<any> {
    const sessionID = window.localStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      throw new Error('authService.logout: ei session ID:ä.');
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
      this.user$.next({ id: 0, nimi: '', sposti: '', asema: ''});
      window.localStorage.clear();
    }
  }

  // Jos ei olle kirjautuneita, ohjataan kirjautumiseen. Muuten jatketaan virheen käsittelyä.
  private handleError(error: HttpErrorResponse) {
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
        console.log('Virhe, et ole kirjautunut. Ohjataan kirjautumiseen.');
        this.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

}

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
  asema: 'opettaja' | 'opiskelija' | 'admin' | ''
}

export interface Kurssi {
  id: string;
  nimi: string;
}

export interface GenericResponse {
  success: boolean,
  error: object
}
