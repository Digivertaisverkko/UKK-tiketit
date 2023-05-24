// Tämä service käsittelee käyttäjäautentikointiin liittyviä toimia.

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import cryptoRandomString from 'crypto-random-string';
import { firstValueFrom } from 'rxjs';
import * as shajs from 'sha.js';
import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';

import { FormatWidth, getLocaleDateFormat, Location } from '@angular/common';
import { Inject, LOCALE_ID } from '@angular/core';
import { GenericResponse, Role, User } from './core.models';
import { Kurssini } from '../course/course.models';
import { CourseService } from '../course/course.service';
import { StoreService } from './store.service';

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

  // Onko käyttäjä osallisena aktiivisella kurssilla.
  // private user$ = new BehaviorSubject(null) ;
  // TODO: nämä oAuth tiedot yhteen tietotyyppiin.
  private codeVerifier: string = '';
  private codeChallenge: string = '';
  private loginCode: string = '';

  private courseID: string | null = null;

  constructor(private courses: CourseService,
              private errorService: ErrorService,
              private http: HttpClient,
              private location: Location,
              private router: Router,
              private store: StoreService,
              @Inject(LOCALE_ID) private localeDateFormat: string
              ) {
  }

  public initialize() {
    this.updateDataConsent();
    this.startUpdatingUserinfo();
  }

  /* Routen vaihtuessa päivitä käyttäjätietoja ellei olla kirjautumisnäkymässä.
     Käyttäjää on voitu vaihtaa eri tabissa/ikkunassa. */
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

  private checkIfParticipant(courseID: string) {
    console.log('tsekataan onko osallistuja');
    this.courses.getMyCourses().then(response => {
      if (response[0].kurssi === undefined) return
        const myCourses: Kurssini[] = response;
        // Onko käyttäjä osallistujana URL parametrilla saadulla kurssilla.
        if (myCourses.some(course => course.kurssi == Number(courseID))) {
          this.store.setParticipant(true);
          console.log('kurssi id: ' + this.courseID);
          console.log('ollaan kurssilla');
        } else {
          this.store.setParticipant(false);
          console.log('ei olla kurssilla');
          console.log('kurssi id: ' + this.courseID);
        }
    })
  }

  // Rooli muodossa, joka on tarkoitettu näytettäväksi UI:ssa.
  private getRoleString(asema: Role | null): string {
    let role: string;
      switch (asema) {
        case 'opiskelija':
          role = $localize`:@@Opiskelija:Opiskelija`; break;
        case 'opettaja':
          role = $localize`:@@Opettaja:Opettaja`; break;
        case 'admin':
          role = $localize`:@@Admin:Admin`; break;
        default:
          role = '';
      }
      return role;
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

  // public async handleNotLoggedIn() {
  //   console.log('authService.handleNotLoggedIn(): et ole kirjaunut,' +
  //         'ohjataan kirjautumiseen.');
  //   this.store.setNotLoggegIn();
  //   if (this.user$ !== null) this.user$.next(null);
  //   window.localStorage.clear();
  //   const courseID = getCourseIDfromURL();
  //   this.saveRedirectURL();
  //   const baseUrl = (courseID == null) ? '' : 'course/' + courseID  + '/';
  //   this.router.navigateByUrl(baseUrl + 'forbidden');
  // }

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
      /* Palauttaa tiedot, jos on käyttäjä on kirjautuneena kurssille.*/
      const url = `${environment.apiBaseUrl}/kurssi/${courseID}/oikeudet`;
      response = await firstValueFrom<User>(this.http.get<any>(url));
    } catch (error: any) {
      response = null;
    }
    let newUserInfo: any;
    if (response != null && response?.id != null)  {
      newUserInfo = response;
      newUserInfo.asemaStr = this.getRoleString(newUserInfo.asema);
      this.store.setLoggedIn();
      this.store.setParticipant(true);
    } else {
      this.store.setParticipant(false);
      console.log('authService: saatiin /oikeudet vastaus null');
      // Haetana käyttäjätiedot, jos on kirjautuneena, mutta eri kurssila.
      const response = await this.fetchVisitorInfo();
      if (response?.nimi != null) {
        console.log('fetchUserInfo: olet kirjautunut eri kurssille');
        newUserInfo = response ;
        newUserInfo.asema = null;
        this.store.setLoggedIn();
      } else {
        this.store.setNotLoggegIn();
        return
      }
    }
    this.store.setUserInfo(newUserInfo);
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

  // Poista tieto, että ollaan kieltäydytty datan luovutuksesta.
  public removeDenyConsent() {
    const noDataConsent: string | null = localStorage.getItem('noDataConsent')
    let noDataConsentList: string[] = noDataConsent ? JSON.parse(noDataConsent) : [];
    const lastTokenid = localStorage.getItem('lastTokenid')
    if (!lastTokenid) {
      console.error('refresh-dialog: Ei tallennettuna viimeisintä tokenid:ä, ei voida jatkaa.');
      return
    }
    const index = noDataConsentList.indexOf(lastTokenid);
    if (index !== -1) {
      noDataConsentList.splice(index, 1);
      localStorage.setItem('noDataConsent', JSON.stringify(noDataConsentList));
      this.store.setDenyDataConsent(false);
    }
    console.log(JSON.stringify(localStorage.getItem('noDataConsent')));
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
      this.store.setLoggedIn();
      this.store.setParticipant(null);
    } else {
      loginResult = { success: false };
    }
    return loginResult;
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
        window.localStorage.clear();
        if (courseID != null) {
          this.navigateToLogin(courseID);
        }
      }
  }

  // Jos ei olle kirjautuneita, ohjataan kirjautumiseen. Muuten jatketaan
  // virheen käsittelyä.
  private handleError(error: HttpErrorResponse) {
    this.errorService.handleServerError(error);
  }

  // Aseta storageen onko datan luovutuksesta kieltäydytty sen mukaan, miten
  // on local storageen tallennettu.
  public updateDataConsent() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenid = urlParams.get('tokenid');
    const noDataConsent = localStorage.getItem('noDataConsent')
    let noDataConsentList: string[];
    if (noDataConsent) {
      noDataConsentList = JSON.parse(noDataConsent);
      /* Listassa on kieltäytyneiden tokenid:t. Jos ei ole kieltäytynyt,
      niin ei merkintää. */
      if (tokenid && noDataConsentList?.includes(tokenid)) {
        this.store.setDenyDataConsent(true);
      } else {
        this.store.setDenyDataConsent(false);
      }
    }
  }


}
