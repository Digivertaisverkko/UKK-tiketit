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
  // Sisältyy oAuth -tunnistautumiseen, mutta ei ole (vielä) käytössä.
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
    if (window.localStorage.getItem('SESSION_ID') == null) return
    const savedCourseID: string | null = window.localStorage.getItem('COURSE_ID');
    if (savedCourseID !== null) {
      // session id voi olla vanhentunut, mutta asetetaan kirjautuneeksi,
      // jotta ei ohjauduta loginiin page refresh:lla.
      this.setLoggedIn();
      this.fetchUserInfo(savedCourseID);
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
      if (this.user$.value.id === 0) this.getUserInfo();
    }
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
    // console.log('--- Not logged ---');
    if (this.isUserLoggedIn$.value === true) {
      this.isUserLoggedIn$.next(false);
    }
    if (this.user$.value.nimi !== '') {
      // console.log('lähetetään tyhjä user');
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

  public getActiveCourse(): string | null{
    const courseID: string | null = window.localStorage.getItem('COURSE_ID');
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
    const sessionID = (window.localStorage.getItem('SESSION_ID'));
    if (sessionID === undefined || sessionID === null) this.setNotLoggegIn();
    return sessionID;
  }

  private getMethodName() {
    return this.getMethodName.caller.name
  }

  public async handleNotLoggedIn() {
    console.log('authService.handleNotLoggedIn(): et ole kirjaunut, ohjataan kirjautumiseen.');
    this.setNotLoggegIn();
    window.localStorage.clear();
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
  public async fetchUserInfo(courseID: string) {
    if (window.localStorage.getItem('SESSION_ID') == null) {
      console.error('Virhe: fetchUserInfo(): ei session id:ä, ei voida hakea ja tallentaa tietoja.');
      this.setNotLoggegIn();
    }
    if (courseID === null) {
      console.error('Virhe: fetchUserInfo(): Kurssi ID:ä, ei voida hakea tietoja.');
      return
    }
    try {
      // TODO: Pystyisikö await:sta luopumaan, jottei tulisi viivettä? Osataanko joka paikassa odottaa observablen arvoa?
      const userInfo = await this.getMyUserInfo(courseID);
      if (userInfo !== null && userInfo !== this.user$.value) {
        console.log('nykyinen userinfo: ' + JSON.stringify(this.user$.value));
        console.log('uusi userinfo: ' + JSON.stringify(userInfo));
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
        // console.log('-- ajetaan saveUserInfo ----');
        await this.fetchUserInfo(courseID);
      } else {
        // console.log('-- ei ajettu saveUserInfo: kurssi ID: ' + courseID + ' ----');
      }
    } else {
      loginResult = { success: false };
      console.error(response.error);
    }
    return loginResult;
  }

  // Tämään hetkinen kirjautumisen tila.
  public getIsUserLoggedIn(): Boolean {
    this.getSessionID();
    return this.isUserLoggedIn$.value;
  }

  // Palauta HTTP-kutsuihin tarvittavat HTTP -options, joka sisältää headerit, joissa on session id jos sellainen on saatavilla.
  private getHttpOptions(): object {
    let sessionID = window.localStorage.getItem('SESSION_ID');
    // if (sessionID == undefined) {
    //   throw new Error('Session ID:ä ei ole asetettu. Ei olla kirjautuneita.');
    // }
    // console.log('session id on: ' + sessionID);
    var options;
    if (sessionID == null ) {
      options = {};
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
    const sessionID = this.getSessionID();
    if (sessionID == undefined) {
      console.error('authService.logout: ei session ID:ä.');
      this.setNotLoggegIn();
      window.localStorage.clear();
    } else {
      const httpOptions = this.getHttpOptions();
      let response: any;
      let url = environment.apiBaseUrl + '/kirjaudu-ulos';
      try {
        console.log('Lähetettäisiin logout-kutsu, mutta ei ole tukea sille vielä.');
        // response = await firstValueFrom(this.http.post<{'login-url': string}>(url, null, httpOptions));
        // console.log('authService: saatiin vastaus logout kutsuun: ' + JSON.stringify(response));
      } catch (error: any) {
        this.handleError(error);
      } finally {
        this.setNotLoggegIn();
        window.localStorage.clear();
      }
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
