// Tämä service käsittelee käyttäjäautentikointiin liittyviä toimia.

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import cryptoRandomString from 'crypto-random-string';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import * as shajs from 'sha.js';
import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';

import { FormatWidth, getLocaleDateFormat, Location } from '@angular/common';
import { Inject, LOCALE_ID } from '@angular/core';
import { getCourseIDfromURL } from '../shared/utils';
import { GenericResponse, Role, User } from './core.models';

interface LoginResponse {
  success: boolean,
  'login-code': string
}

interface ConsentResponse {
  success: boolean,
  kurssi: number
}

interface LoginResult {
  success: boolean,
  redirectUrl?: string
};

interface AuthRequestResponse {
  success: boolean;
  error: string;
  'session-id': string;
}

@Injectable({ providedIn: 'root' })

export class AuthService {
  // private isUserLoggedIn$ = new fromEvent<StorageEvent(window, "storage");
  private isUserLoggedIn$: BehaviorSubject<any> = new BehaviorSubject(null);
  // Onko käyttäjä osallisena aktiivisella kurssilla.
  private isParticipant$ = new BehaviorSubject<boolean>(false);
  private user$ = new BehaviorSubject(null) ;
  // TODO: nämä oAuth tiedot yhteen tietotyyppiin.
  private codeVerifier: string = '';
  private codeChallenge: string = '';
  private loginCode: string = '';

  private courseID: string | null = null;

  constructor(private errorService: ErrorService,
              private http: HttpClient,
              private location: Location,
              private router: Router,
              private route: ActivatedRoute,
              @Inject(LOCALE_ID) private localeDateFormat: string
              ) {
  }

  public initialize() {
    this.startUpdatingUserinfo();
  }

  public startUpdatingUserinfo() {
    this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        // const url = window.location.href;
        // console.log('urli: ' + url);
        const courseID = event.snapshot.paramMap.get('courseid');
        console.log('authService: huomattiin kurssi id ' + this.courseID);
        const currentUrl = this.location.path();
        const isInLogin: boolean = currentUrl.includes('login');
        if (!isInLogin && (courseID !== undefined && courseID !== null)) {
          // console.log('updateUserInfo: saatiin kurssi ID ' + courseID + ' url:sta');
          // console.dir(event.snapshot.url);
          this.fetchUserInfo(courseID);
        }
      }
    });
  }

  public async sendDataConsent(tokenid: string | null, allow: boolean):
      Promise<ConsentResponse> {
    const body = { 'lupa-id': tokenid };
    console.log(body);
    let url = '/lti/';
    url += allow ? 'gdpr-lupa-ok' : 'gdpr-lupa-kielto';
    let res: any;
    try {
      res = await firstValueFrom(this.http.post(url, body));
    } catch (error: any) {
      this.handleError(error)
    }
    return res
  }

  public getDateFormat(): string {
    return getLocaleDateFormat( this.localeDateFormat, FormatWidth.Short );
  }

  // Aseta tila kirjautuneeksi.
  public setLoggedIn() {
    console.log('setLoggedIn: vanha logged in value: ' + this.isUserLoggedIn$.value);

    if (this.isUserLoggedIn$.value !== true) {
      // this.setSessionID('loggedin');
      this.isUserLoggedIn$.next(true);
      console.log('authService: asetettiin kirjautuminen.');
    } else {
      console.log('ei aseteta uutta arvoa');
    }
  }

  // Aseta tila kirjautumattomaksi.
  public setNotLoggegIn() {
    if (this.isUserLoggedIn$.value !== false) {
      this.isUserLoggedIn$.next(false);
    }
    if (this.user$ !== null) this.user$.next(null);
  }

  // Ala seuraamaan, onko käyttäjä kirjautuneena.
  public onIsUserLoggedIn(): Observable<any> {
    return this.isUserLoggedIn$.asObservable();
  }

  // Lopeta kirjautumisen seuraaminen.
  public unsubscribeIsUserLoggedin(): void {
    this.isUserLoggedIn$.unsubscribe;
  }

  public getUserRole(): Role | null {
    return this.user$.value;
  }

  public getUserInfo(): User | null {
    const user: User | null = this.user$.value;
    return user;
  }

  public trackUserInfo(): Observable<User | null> {
    return this.user$.asObservable();
  }

  // Aiheutti errorin.
  public unTrackUserInfo(): void {
    this.user$.unsubscribe();
  }

  private getMethodName() {
    return this.getMethodName.caller.name
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

  public async handleNotLoggedIn() {
    console.log('authService.handleNotLoggedIn(): et ole kirjaunut,' +
          'ohjataan kirjautumiseen.');
    this.setNotLoggegIn();
    window.localStorage.clear();
    const courseID = getCourseIDfromURL();
    this.saveRedirectURL();
    const baseUrl = (courseID == null) ? '' : 'course/' + courseID  + '/';
    this.router.navigateByUrl(baseUrl + 'forbidden');
  }

  public getUserName(): string | null {
    // return this.userName$.value;
    // const user: User  = this.user$.value;
    // return user.nimi;
    return this.user$ === null ? null : this.user$.value;
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
    if (courseID === undefined || courseID === null || courseID === '') {
      throw new Error('authService.getMyUserInfo: Ei kurssi ID:ä: ' + courseID);
    }
    if (isNaN(Number(courseID))) {
      throw new Error('authService: Haussa olevat tiedot ovat väärässä muodossa.');
    }
    let response: any;
    try {
      /* ? Pystyisikö await:sta luopumaan, jottei tulisi viivettä? Osataanko
      joka paikassa odottaa observablen arvoa? */
      const url = `${environment.apiBaseUrl}/kurssi/${courseID}/oikeudet`;
      response = await firstValueFrom<User>(this.http.get<any>(url));
    } catch (error: any) {
      response = null;
    }
    let newUserInfo: any;
    if (response != null && response?.id != null)  {
      newUserInfo = response;
      this.setLoggedIn();
    } else {
      console.log('saatiin vastaus null');
      // Tarkistetaan, onko kirjautuneena eri kurssille.
      const response = await this.fetchVisitorInfo();
      if (response?.nimi != null) {
        console.log('fetchUserInfo: olet kirjautunut eri kurssille');
        newUserInfo = response ;
        newUserInfo.asema = null;
      } else {
        this.setNotLoggegIn();
        return
      }
    }
    if (newUserInfo === this.user$.value) {
      console.log('fetchUserInfo: Jatketaan samalla käyttäjällä.');
      return
    }
    this.user$.next(newUserInfo);
    console.log('asetettiin uusi käyttäjä ' + JSON.stringify(newUserInfo));
  }

  // Käytetään tarkistamaan ja palauttamaan tiedot, jos käyttäjä on
  // kirjautunut, mutta ei näkymän kurssille.
  private async fetchVisitorInfo(): Promise<{nimi: string, sposti: string | null}
        | null> {
    let response: any;
    try {
      /* ? Pystyisikö await:sta luopumaan, jottei tulisi viivettä? Osataanko
      joka paikassa odottaa observablen arvoa? */
      const url = `${environment.apiBaseUrl}/minun`;
      console.log('fetchVisitorInfo: koitetaan hakea tiedot');
      response = await firstValueFrom<any>(this.http.get<any>(url));
    } catch (error: any) {
      return null
    }
    return response
  }

  public async navigateToLogin(courseID: string | null) {
    // console.warn('logout: kurssi id: ' + this.courseID);
    if (courseID === null ) {
      throw Error('Ei kurssi ID:ä, ei voi voida lähettää loginia');
    }
    this.sendAskLoginRequest('own', courseID).then((response: any) => {
      if (response === undefined) {
        console.log('Ei saatu palvelimelta kirjautumis-URL:a, ei voida ohjata kirjautumiseen.');
        return
      }
      const loginURL = response;
      this.router.navigateByUrl(loginURL);
    })
  }

  /* Lähetä 1. authorization code flown:n autentikointiin liittyvä kutsu.
    loginType voi olla atm: 'own'. Jos courseID on annettu, niin palautetaan
     linkki sen kurssin näkymään.¶ */
  public async sendAskLoginRequest(loginType: string, courseID: string | null) {
    if (courseID === null) {
      throw new Error('Ei kurssi ID:ä, ei voida jatkaa kirjautumista.');
    }
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
        'code-challenge': this.codeChallenge,
        'kurssi': courseID
      })
    };
    let response: any;
    try {
      response = await firstValueFrom(this.http.post<{'login-url': string}>(url, null, httpOptions));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response['login-url'] == undefined) {
      throw new Error("Palvelin ei palauttanut login URL:a. Ei pystytä kirjautumaan.");
    }
    // console.warn('auth. service kurssi id: '+ courseID);
    const loginUrl = response['login-url'];
    // if (courseID != null) loginUrl = `course/${courseID}${loginUrl}`;
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
      const redirectUrl = window.localStorage.getItem('REDIRECT_URL');
      console.log('sendAuthRequest: redirect url: ' + redirectUrl);
      if (redirectUrl !== undefined && redirectUrl !== null) {
        loginResult.redirectUrl = redirectUrl;
        window.localStorage.removeItem('REDIRECT_URL')
      }
      this.setLoggedIn();
    } else {
      loginResult = { success: false };
    }
    return loginResult;
  }

  // Tämään hetkinen kirjautumisen tila.
  public getIsUserLoggedIn(): Boolean {
    return this.isUserLoggedIn$.value;
  }

  // Suorita uloskirjautuminen.
  public async logout(courseID: string | null) {
      let response: any;
      let url = environment.apiBaseUrl + '/kirjauduulos';
      try {
        response = await firstValueFrom(this.http.post(url, {}));
      } catch (error: any) {
        this.handleError(error);
      } finally {
        this.setNotLoggegIn();
        window.localStorage.clear();
        if (courseID != null) {
          this.navigateToLogin(courseID);
        }
      }
  }

  // Jos ei olle kirjautuneita, ohjataan kirjautumiseen. Muuten jatketaan
  // virheen käsittelyä.
  private handleError(error: HttpErrorResponse) {
    console.log('authService: saatiin virhe.');
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
        console.log('Virhe, et ole kirjautunut. Ohjataan kirjautumiseen.');
        this.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

}
