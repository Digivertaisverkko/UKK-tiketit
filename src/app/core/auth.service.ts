import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { isValidHttpUrl } from '../utils/isValidHttpUrl.util';
import { truncate } from '../utils/truncate';
import { ActivatedRoute, Router, ParamMap, ActivationEnd } from '@angular/router';
import * as shajs from 'sha.js';
import cryptoRandomString from 'crypto-random-string';
import { ErrorService } from './error.service';

import { getLocaleDateFormat, FormatWidth} from '@angular/common';
import { Inject, LOCALE_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })

// Luokka käsittelee käyttäjäautentikointiin liittyviä toimia.
export class AuthService {
  // private isUserLoggedIn$ = new fromEvent<StorageEvent(window, "storage");
  private isUserLoggedIn$ = new BehaviorSubject<boolean>(false);
  // Onko käyttäjä osallisena aktiivisella kurssilla.
  private isParticipant$ = new BehaviorSubject<boolean>(false);
  private user$ = new BehaviorSubject <User>({ id: 0, nimi: '', sposti: '', asema: '' });
  // TODO: nämä oAuth tiedot yhteen tietotyyppiin.
  private codeVerifier: string = '';
  private codeChallenge: string = '';
  private loginCode: string = '';

  private courseID: string | null = null;

  constructor(private errorService: ErrorService,
              private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute,
              @Inject( LOCALE_ID ) private localeDateFormat: string ) {

  }

  public initialize() {
    // this.checkIfSessionIDinStorage();
    // this.checkIfSessionIdInURL();
    this.updateUserInfo()
  }

  private checkIfSessionIDinStorage() {
    const savedSessionID = this.getSessionID();
    if (savedSessionID !== null) {
      console.log('Session ID on tallennettuna.');
      /* ? Muuta, että asetetaan kirjautuneeksi vasta, kun saada
      palvelimelta hyväksytty vastaus? */
      this.setLoggedIn();
    }
  }

  private checkIfSessionIdInURL() {
    // Angular Routella parametrien haku ei onnistunut.
    const urlParams = new URLSearchParams(window.location.search);
    const sessionID = urlParams.get('sessionID');
    if (sessionID !== undefined && sessionID !== null) {
      console.log('auth.service: saatiin session ID URL:sta.');
      this.setSessionID(sessionID);
    }
  }

  private updateUserInfo() {
    this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        // const url = window.location.href;
        // console.log('urli: ' + url);
        const courseID = event.snapshot.paramMap.get('courseid');
        console.warn('updateUserInfo kurssi ID: ' + courseID);
        if (courseID !== undefined && courseID !== null) {
          // console.log('updateUserInfo: saatiin kurssi ID ' + courseID + ' url:sta');
          this.setCourseID(courseID);

          this.fetchUserInfo(courseID);

          // if (this.getSessionID !== null) {
            // console.log('updateUserInfo 1: haetaan käyttäjätiedot.');
            // this.fetchUserInfo(courseID);
          // }
        }
      }
    });
  }

  public setCourseID(courseID: string) {
    if (courseID !== this.courseID) {
      console.log('setCourseID: asetetaan kurssi id: ' + this.courseID);
      this.courseID = courseID;
    }
  }

  public getDateFormat(): string {
    return getLocaleDateFormat( this.localeDateFormat, FormatWidth.Short );
  }

    // Aseta tieto, onko käyttäjä osallistujana aktiivisella kurssilla.
  public setIsParticipant(isParticipant: boolean) {
    if (isParticipant) {
      if (this.isParticipant$.value === false) this.isParticipant$.next(true);
    } else {
      if (this.isParticipant$.value === true) this.isParticipant$.next(false);
    }
  }

  // Onko käyttäjä osallistustaja aktiivisella kurssilla.
  public getIsParticipant(): boolean {
    return this.isParticipant$.value
  }

  // Aseta tila kirjautuneeksi.
  public setLoggedIn() {
    if (this.isUserLoggedIn$.value === false) {
      this.isUserLoggedIn$.next(true);
      console.log('Olet nyt kirjautunut.');
    }
  }

  // Aseta tila kirjautumattomaksi.
  public setNotLoggegIn() {
    if (this.isUserLoggedIn$.value === true) {
      this.isUserLoggedIn$.next(false);
    }
    if (this.user$.value.nimi !== '') {
      this.user$.next({ id: 0, nimi: '', sposti: '', asema: ''});
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
    return user;
  }

  public trackUserInfo(): Observable<User> {
    return this.user$.asObservable();
  }

  // Aiheutti errorin.
  public unTrackUserInfo(): void {
    this.user$.unsubscribe();
  }

  public setSessionID(newSessionID: string) {
    const oldSessionID =  window.localStorage.getItem('SESSION_ID');
    if (oldSessionID == undefined || oldSessionID !== newSessionID)
    window.localStorage.setItem('SESSION_ID', newSessionID);
  }

  // Palauta session ID ja päivitä status kirjautumattomaksi, jos sitä ei ole.
  public getSessionID(): string | null {
    const sessionID = (window.localStorage.getItem('SESSION_ID'));
    // if (sessionID === undefined || sessionID === null) {
    //   this.setNotLoggegIn();
    // }
    return sessionID;
  }

  private getMethodName() {
    return this.getMethodName.caller.name
  }

  public async handleNotLoggedIn() {
    console.log('authService.handleNotLoggedIn(): et ole kirjaunut,' +
          'ohjataan kirjautumiseen.');
    this.setNotLoggegIn();
    window.localStorage.clear();
    const loginUrl = await this.sendAskLoginRequest('own');
    // console.log('Tallennettiin redirect URL: ' + window.location.pathname);
    const currentRoute = window.location.pathname + window.location.search;
    if (currentRoute.startsWith('/login') == false) {
      window.localStorage.setItem('REDIRECT_URL', window.location.pathname +
        window.location.search);
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
      response = await firstValueFrom(this.http.post<GenericResponse>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return (response?.success === true) ? true : false;
  }

  // Hae ja tallenna palvelimelta käyttöjätiedot auth.User -behavior subjektiin
  // käytettäviksi.
  public async fetchUserInfo(courseID: string): Promise<void> {
    console.warn('haetaan käyttäjätiedot');
    if (courseID === undefined || courseID === null || courseID === '') {
      throw new Error('authService.getMyUserInfo: Ei kurssi ID:ä: ' + courseID);
    }
    if (isNaN(Number(courseID))) {
      throw new Error('authService: Haussa olevat tiedot ovat väärässä muodossa.');
    }
    // if (window.localStorage.getItem('SESSION_ID') == null) {
    //   this.setNotLoggegIn();
    //   return
    // }
    let response: any;
    try {
      /* ? Pystyisikö await:sta luopumaan, jottei tulisi viivettä? Osataanko
      joka paikassa odottaa observablen arvoa? */
      const url = `${environment.apiBaseUrl}/kurssi/${courseID}/oikeudet`;
      response = await firstValueFrom<User>(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    let newUserInfo: any;
    if (response != null && response?.id != null)  {
      newUserInfo = response;
    } else {
      console.log('saatiin vastaus null');
      // Tarkistetaan, onko kirjautuneena eri kurssille.
      const response = await this.fetchVisitorInfo();
      if (response?.nimi != null) {
        console.log('fetchUserInfo: olet kirjautunut eri kurssille');
        newUserInfo = response ;
        newUserInfo.asema = '';
      } else {
        this.setNotLoggegIn();
        return
      }
    }
    if (newUserInfo === this.user$.value) {
      console.log('fetchUserInfo: Jatketaan samalla käyttäjällä.');
      return
    }
    console.log('fetchUserInfo: Asetetaan uusi userinfo.');
    this.setLoggedIn();
    this.user$.next(newUserInfo);
  }

  // Käytetään tarkistamaan ja palauttamaan tiedot, jos käyttäjä on
  // kirjautunut, mutta ei näkymän kurssille.
  private async fetchVisitorInfo(): Promise<{nimi: string, sposti: string | null}> {
    let response: any;
    try {
      /* ? Pystyisikö await:sta luopumaan, jottei tulisi viivettä? Osataanko
      joka paikassa odottaa observablen arvoa? */
      const url = `${environment.apiBaseUrl}/minun`;
      console.log('fetchVisitorInfo: koitetaan hakea tiedot');
      response = await firstValueFrom<any>(this.http.get<any>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  /* Lähetä 1. authorization code flown:n autentikointiin liittyvä kutsu.
     loginType voi olla atm: 'own' */
  public async sendAskLoginRequest(loginType: string, courseID?: string | null) {
    this.codeVerifier = cryptoRandomString({ length: 128, type: 'alphanumeric' });
    this.codeChallenge =  shajs('sha256').update(this.codeVerifier).digest('hex');
    // this.oAuthState = cryptoRandomString({ length: 30, type: 'alphanumeric' });
    // Jos haluaa storageen tallentaa:
    // this.storage.set('state', state);
    // this.storage.set('codeVerifier', codeVerifier);
    let url: string = environment.apiBaseUrl + '/login';
    const httpOptions =  {
      headers: new HttpHeaders({
        'login-type': loginType,
        'code-challenge': this.codeChallenge
      })
    };
    let response: any;
    try {
      response = await firstValueFrom(this.http.post<{'login-url': string}>
          (url, null, httpOptions));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response['login-url'] == undefined) {
      throw new Error("Palvelin ei palauttanut login URL:a. Ei pystytä kirjautumaan.");
    }
    // console.warn('auth. service kurssi id: '+ courseID);
    let loginUrl = response['login-url'];
    if (courseID != null) loginUrl = `course/${courseID}${loginUrl}`;
    // console.log('loginurl: ' + loginUrl);
    return loginUrl;
  }

  /* Lähetä 2. authorization code flown:n autentikointiin liittyvä kutsu.*/
  public async sendLoginRequest(email: string, password: string, loginID: string):
      Promise<LoginResult> {
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
      response = await firstValueFrom(
        this.http.post<LoginResponse>(url, null, httpOptions)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    if (response.success == true && response['login-code'] !== undefined) {
      // console.log(' login-code: ' + response['login-code']);
      this.loginCode = response['login-code'];
      return this.sendAuthRequest(this.codeVerifier, this.loginCode);
    } else {
      return { success: false };
    }
  }

  /* Lähetä 3. authorization code flown:n autentikointiin liittyvä kutsu. */
  private async sendAuthRequest(codeVerifier: string, loginCode: string):
      Promise<LoginResult> {
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
      response = await firstValueFrom(
        this.http.get<AuthRequestResponse>(url, httpOptions)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    var loginResult: LoginResult;
    if (response?.success == true) {
      loginResult = { success: true };
      const redirectUrl = window.localStorage.getItem('REDIRECT_URL')
      if (redirectUrl !== undefined && redirectUrl !== null) {
        loginResult.redirectUrl = redirectUrl;
        window.localStorage.removeItem('REDIRECT_URL')
      }
      const sessionID = response['session-id'];
      this.setSessionID(sessionID);
      this.setLoggedIn();
    } else {
      loginResult = { success: false };
    }
    return loginResult;
  }

  // Tämään hetkinen kirjautumisen tila.
  public getIsUserLoggedIn(): Boolean {
    this.getSessionID();
    return this.isUserLoggedIn$.value;
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

  // Suorita uloskirjautuminen.
  public async logout(): Promise<any> {
    // const sessionID = this.getSessionID();
    // if (sessionID == undefined) {
    //   this.setNotLoggegIn();
    //   window.localStorage.clear();
    // } else {
      let response: any;
      let url = environment.apiBaseUrl + '/kirjauduulos';
      try {
        response = await firstValueFrom(this.http.post(url, {}));
      } catch (error: any) {
        console.log('header.logout: saatiin sendAskLoginRequest vastaukseksi: ');
        console.dir(response);
        this.handleError(error);
      } finally {
        this.setNotLoggegIn();
        window.localStorage.clear();
        return true
      }
  }

  // Jos ei olle kirjautuneita, ohjataan kirjautumiseen. Muuten jatketaan
  // virheen käsittelyä.
  private handleError(error: HttpErrorResponse) {
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
        console.log('Virhe, et ole kirjautunut. Ohjataan kirjautumiseen.');
        this.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

} // End of class

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
// Jos ollaan kirjautunena eri kurssille, ei saada id:ä.
export interface User {
  id?: number,
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
