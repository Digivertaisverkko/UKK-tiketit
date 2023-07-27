// Tämä service käsittelee käyttäjäautentikointiin liittyviä toimia.

import { ActivationEnd, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FormatWidth, getLocaleDateFormat, Location } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import * as shajs from 'sha.js';
import cryptoRandomString from 'crypto-random-string';

import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';
import { getCourseIDfromURL } from '@shared/utils';
import { getRoleString } from '@shared/utils';
import { AuthInfo, LoginInfo, Role, User } from '../core.models';
import { StoreService } from './store.service';


interface UserRights {
  oikeudet: User,
  login: AuthInfo,
}

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

  private api: string;
  private codeVerifier: string = '';

  constructor(private errorService: ErrorService,
              private http: HttpClient,
              private location: Location,
              private router: Router,
              private store: StoreService,
              @Inject(LOCALE_ID) private localeDateFormat: string
              ) {
    this.api = environment.apiBaseUrl;
  }

  public initialize() {
    this.startUpdatingUserinfo();
  }

  /* Lähetä 3. authorization code flown:n autentikointiin liittyvä kutsu. */
  private async authenticate(codeVerifier: string, loginCode: string):
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
    window.sessionStorage.clear();
  } else {
    loginResult = { success: false };
  }
  return loginResult;
}

  // Liitä ulkopuolinen käyttäjä kurssille.
  public async createAccount(name: string, email: string, password: string,
      inviteID: string): Promise<{ success: boolean }> {
  let response;
  const url = `${this.api}/luotili`;
  const body = {
    nimi: name,
    salasana: password,
    sposti: email,
    kutsu: inviteID
  }
  try {
    response = await firstValueFrom(this.http.post<any>(url, body));
  } catch (error: any) {
    this.handleError(error);
  }
    return response;
  }

  // Hae ja tallenna palvelimelta käyttöjätiedot auth.User -behavior subjektiin
  // käytettäviksi eri puolilla ohjelmaa.
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
      console.log(`Haetaan, onko oikeuksia ja käyttäjätietoja kurssille ${courseID}.`);
      const url = `${environment.apiBaseUrl}/kurssi/${courseID}/oikeudet`;
      response = await firstValueFrom<UserRights>(this.http.get<any>(url));
    } catch (error: any) {
      response = null;
    }
    if (response === null) {
      console.warn(`Tällä käyttäjällä ei ole oikeuksia kurssille ${courseID}.`);
    }
    let newUserInfo: any;
    if (response != null && response.oikeudet != null)  {
      newUserInfo = response.oikeudet;
      const authInfo = response.login;
      if (authInfo) this.store.setAuthInfo(authInfo);
      newUserInfo.asemaStr = getRoleString(newUserInfo.asema);
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
      console.log('authService.fetchVisitorInfo: koitetaan hakea tiedot, onko kirjautuneena eri kurssille.');
      response = await firstValueFrom<any>(this.http.get<any>(url));
    } catch (error: any) {
      return null
    }
    return response
  }

  public getDateFormat(): string {
    return getLocaleDateFormat( this.localeDateFormat, FormatWidth.Short );
  }

  /* Palauta true, jos on tieto, että viimeisimmällä saadulla tokenid
     on datan luovutuksesta kieltäytyneiden joukossa */
  public getDenyDataConsent(): boolean {
    const lastTokenid: string | null = localStorage.getItem('lastTokenid');
    const noDataConsent = localStorage.getItem('noDataConsent')
    if (!noDataConsent || !lastTokenid) return false
    const noDataConsentList: string[] = JSON.parse(noDataConsent);
    /* Listassa on kieltäytyneiden tokenid:t. Jos ei ole kieltäytynyt,
    niin ei merkintää. */
    return (noDataConsentList.includes(lastTokenid)) ? true : false;
  }

  /* Lähetä 1. authorization code flown:n autentikointiin liittyvä kutsu.
  loginType voi olla atm: 'own'. Jos courseID on annettu, niin palautetaan
  linkki sen kurssin näkymään.¶ */
   public async getLoginInfo(loginType: string, courseID: string | null):
     Promise<LoginInfo> {
   if (courseID === null) {
     throw new Error('Ei kurssi ID:ä, ei voida jatkaa kirjautumista.');
   }
   this.codeVerifier = cryptoRandomString({ length: 128, type: 'alphanumeric' });
   const codeChallenge =  shajs('sha256').update(this.codeVerifier).digest('hex');
   // this.oAuthState = cryptoRandomString({ length: 30, type: 'alphanumeric' });
   // Jos haluaa storageen tallentaa:
   // this.storage.set('state', state);
   // this.storage.set('codeVerifier', codeVerifier);
   let url: string = environment.apiBaseUrl + '/login';
   const httpOptions =  {
     headers: new HttpHeaders({
       'login-type': loginType,
       'code-challenge': codeChallenge,
       'kurssi': courseID
     })
   };
   let response: any;
   try {
     response = await firstValueFrom(this.http.post(url, null, httpOptions));
   } catch (error: any) {
     this.handleError(error);
   }
   // if (response['login-url'] == undefined) {
   //   throw new Error("Palvelin ei palauttanut login URL:a. Ei pystytä kirjautumaan.");
   // }
   return response
   // const loginUrl = response['login-url'];
   // return loginUrl;
 }

  private getMethodName() {
    return this.getMethodName.caller.name
  }

  // Jos ei olle kirjautuneita, ohjataan kirjautumiseen. Muuten jatketaan
  // virheen käsittelyä.
  private handleError(error: HttpErrorResponse): void {
    this.errorService.handleServerError(error);
  }

  public async navigateToLogin(courseID: string | null,
        notification?: { message: string }) {
    if (courseID === null ) {
      throw Error('Ei kurssi ID:ä, ei voi voida lähettää loginia');
    }
    this.getLoginInfo('own', courseID).then((response: any) => {
      if (response === undefined) {
        console.log('Ei saatu palvelimelta kirjautumis-URL:a, ei voida ohjata kirjautumiseen.');
        return
      }
      const loginURL = response['login-url'];
      // const loginURL = response;
      if (notification) {
        this.router.navigate(loginURL, { state: { notification: notification } })
      }
      this.router.navigateByUrl(loginURL);
    })
  }

  /* Lähetä 2. authorization code flown:n autentikointiin liittyvä kutsu. */
  public async login(email: string, password: string, loginID: string):
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
      const loginCode = response['login-code'];
      return this.authenticate(this.codeVerifier, loginCode);
    } else {
      return { success: false };
    }
  }

  // Suorita uloskirjautuminen.
  public async logout(): Promise<{ success: boolean }> {
      let response: any;
      let url = environment.apiBaseUrl + '/kirjauduulos';
      try {
        response = await firstValueFrom(this.http.post(url, {}));
      } catch (error: any) {
        return { success: false }
      }
      this.store.setNotLoggegIn();
      this.store.setUserInfo(null);
      this.store.setParticipant(null);
      this.store.unsetPosition();
      this.store.setCourseName('');
      window.sessionStorage.clear();
      return { success: true }
        // if (courseID != null) {
        //   this.navigateToLogin(courseID);
        // }
  }

  // Poista tieto, että ollaan kieltäydytty datan luovutuksesta.
  public removeDenyConsent(): void {
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
    }
    console.log(JSON.stringify(localStorage.getItem('noDataConsent')));
  }

  public saveRedirectURL(): void {
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

  /* Routen vaihtuessa päivitä käyttäjätietoja ellei olla kirjautumisnäkymässä.
     Käyttäjää on voitu vaihtaa eri tabissa/ikkunassa. */
  public startUpdatingUserinfo(): void {
    this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        const courseID = getCourseIDfromURL();
        console.log('authService: huomattiin kurssi id ' + courseID);
        const currentUrl = this.location.path();
        const isInLogin: boolean = currentUrl.includes('login');
        if (!isInLogin && (courseID !== undefined && courseID !== null)) {
          this.fetchUserInfo(courseID);
        }
      }
    });
  }

}
