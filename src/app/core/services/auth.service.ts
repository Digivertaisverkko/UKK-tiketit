import { ActivationEnd, Router } from '@angular/router';
import cryptoRandomString from 'crypto-random-string';
import { filter, firstValueFrom } from 'rxjs';
import { FormatWidth, getLocaleDateFormat } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import * as shajs from 'sha.js';

import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';
import { AuthInfo, ConsentResponse, LoginInfo, LoginResult, Role, User } from '../core.models';
import { StoreService } from './store.service';
import { UtilsService } from './utils.service';

interface UserRights {
  oikeudet: User,
  login: AuthInfo,
}

interface LoginResponse {
  success: boolean,
  'login-code': string
}

interface AuthRequestResponse {
  success: boolean;
  error: string;
  'session-id': string;
}
/**
 * Käsittelee käyttäjäautentikointiin liittyvää tietoa.
 *
 * @export
 * @class AuthService
 */

@Injectable({ providedIn: 'root' })

export class AuthService {

  private api: string;
  private codeVerifier: string = '';

  constructor(private errorService: ErrorService,
              private http: HttpClient,
              private router: Router,
              private store: StoreService,
              private utils: UtilsService,
              @Inject(LOCALE_ID) private localeDateFormat: string
              ) {
    this.api = environment.apiBaseUrl;
  }

  /**
   * Sovelluksen alussa tehtävät toimet.
   * Aletaan päivittämään käyttäjätietoja storeServiceen.
   *
   * @returns  {boolean}
   * @memberof AuthService
   */

  public initialize() {
    this.startUpdatingUserinfo();
  }

  /**
   * Lähetä 3. authorization code flown:n liittyvä kutsu. Kutsutaan .login:sta.
   *
   * @private
   * @param {string} codeVerifier
   * @param {string} loginCode
   * @returns  {Promise<LoginResult>}
   * @memberof AuthService
   */
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
    const redirectUrl = window.localStorage.getItem('redirectUrl');
    if (redirectUrl !== undefined && redirectUrl !== null) {
      loginResult.redirectUrl = redirectUrl;
      window.localStorage.removeItem('redirectUrl')
    }
    window.sessionStorage.clear();
  } else {
    loginResult = { success: false };
  }
  return loginResult;
}

  /**
   * Liitä ulkopuolinen käyttäjä kurssille.
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} inviteID
   * @returns  {Promise<{ success: boolean }>}
   * @memberof AuthService
   */
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

  /**
  * Hae palvelimesta tiedot kirjautumisen tilasta, käyttäjätiedot- ja
  * oikeudet, onko osallistujana näkymän kurssilla ja sijoita ne store
  * serviveen.
  *
  * @param {string} courseID
  * @returns  {Promise<void>}
  * @memberof AuthService
  */
  public async fetchUserInfo(courseID: string): Promise<void> {
    if (courseID === undefined || courseID === null || courseID === '') {
      throw new Error('authService.getMyUserInfo: Ei kurssi ID:ä: ' + courseID);
    }
    if (isNaN(Number(courseID))) {
      throw new Error('authService: Haussa olevat tiedot ovat väärässä muodossa.');
    }
    let response: any;
    try {
      /* Palauttaa tiedot, jos on käyttäjä on kirjautuneena kurssille.*/
      console.log(`auth.fetcUserInfo: Haetaan, onko oikeuksia ja käyttäjätietoja kurssille ${courseID}.`);
      const url = `${environment.apiBaseUrl}/kurssi/${courseID}/oikeudet`;
      response = await firstValueFrom<UserRights>(this.http.get<any>(url));
    } catch (error: any) {
      response = null;
    }
    let userInfo: any;
    if (response != null && response?.oikeudet != null)  {
      userInfo = response.oikeudet;
      userInfo.osallistuja = true;
      const authInfo = response.login;
      if (authInfo) this.store.setAuthInfo(authInfo);
      userInfo.asemaStr = this.getRoleString(userInfo.asema);
    } else {
      console.warn(`Käyttäjällä ei ole oikeuksia kurssille ${courseID}.`);
      // Haetaan käyttäjätiedot, jos on kirjautuneena, mutta eri kurssila.
      const response = await this.fetchVisitorInfo();
      userInfo = response;
      if (response?.nimi != null) {
        console.log('fetchUserInfo: olet kirjautunut eri kurssille');
        userInfo.asema = null;
        userInfo.osallistuja = false;
      }
    }
    this.store.setUserInfo(userInfo);
  }

  /**
   * Käytetään tarkistamaan ja palauttamaan tiedot, jos käyttäjä on
   * kirjautunut, mutta ei näkymän kurssille.
   * @private
   * @returns  {(Promise<{nimi: string, sposti: string | null}
   *         | null>)}
   * @memberof AuthService
   */
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

  /**
   * Palauta true, jos on tieto, että viimeisimmällä saadulla tokenid
   * on datan luovutuksesta kieltäytyneiden joukossa.
   * @returns  {boolean}
   * @memberof AuthService
   */
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
     Palautetaan tarvittavat tiedot kirjautumista varten. */
   public async getLoginInfo(loginType: 'own', courseID: string | null):
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

  /**
   * Palauta rooli, jossa se on siinä muodossa on kuin tarkoitettu näytettäväksi
   * käyttöliittymässä (kieli, kirjainkoko).
   *
   * @private
   * @param {(Role | null)} asema
   * @return {*}  {string}
   * @memberof AuthService
   */
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

  // Jos ei olle kirjautuneita, ohjataan kirjautumiseen. Muuten jatketaan
  // virheen käsittelyä.
  private handleError(error: HttpErrorResponse): void {
    this.errorService.handleServerError(error);
  }

  /**
   * Ohjaa kirjautumiseen. Hakee tarvittavat tiedot kirjautumista varten.
   * Message:ksi voi laittaa viestin, jonka perusteella halutussa näkymässä
   * voidaan näyttää siellä määritelty ilmoitus.
   *
   * Käytetty ListingComponent.checkRouterData().
   *
   * @param {(string | null)} courseID
   * @param {{ message: 'account created' }} [notification]
   * @memberof AuthService
   */
  public async navigateToLogin(courseID: string | null,
    notification?: { message: string }) {
    if (courseID === null ) {
      throw Error('Ei kurssi ID:ä, ei voi voida lähettää loginia');
    }
    this.getLoginInfo('own', courseID).then((response: LoginInfo) => {
      if (response === undefined) {
        console.error('Ei saatu palvelimelta kirjautumis-URL:a, ei voida ohjata kirjautumiseen.');
        return;
      }
      const loginURL = response['login-url'];
      if (notification) {
        this.router.navigate([ loginURL ], { state: { notification: notification } })
      }
      this.router.navigateByUrl(loginURL);
    })
  }

  /**
   * Lähetä 2. authorization code flown:n autentikointiin liittyvä kutsu.
   *
   * @param {string} email
   * @param {string} password
   * @param {string} loginID
   * @returns  {Promise<LoginResult>}
   * @memberof AuthService
   */
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
  /**
   * Suorita uloskirjautuminen.
   *
   * @returns  {Promise<{ success: boolean }>}
   * @memberof AuthService
   */
  public async logout(): Promise<{ success: boolean }> {
    let response: any;
    let url = environment.apiBaseUrl + '/kirjauduulos';
    try {
      response = await firstValueFrom(this.http.post(url, {}));
    } catch {
    }
    this.store.setUserInfo(null);
    this.store.unsetPosition();
    this.store.setCourseName('');
    window.sessionStorage.clear();
    return response
  }

  /**
   * Poista tieto ollaanko kieltäydytty tietojen luovutuksesta.
   *
   * @memberof AuthService
   */
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
  }

  /**
   * Tallenna URL, johon kirjautumisen jälkeen uudelleenohjataan, ellei jo olla
   * login näkymässä.
   *
   * @memberof AuthService
   */
  public saveRedirectURL(): void {
    const currentRoute = window.location.pathname + window.location.search;
    // Kirjautumissivulle ei haluta ohjata.
    if (currentRoute.indexOf('/login') === -1) {
      if (window.localStorage.getItem('redirectUrl') == null) {
      window.localStorage.setItem('redirectUrl', currentRoute);
      console.log('tallennettiin redirect URL: ' + currentRoute);
      } else {
        console.log('Löydettiin redirect URL: ' + window.localStorage.getItem('redirectUrl') +
            ', ei tallenneta päälle.');
      }
    }
  }

  /**
   * Lähetä, onko käyttäjän tietojen luovutukseen annettu lupa.
   *
   * @param {(string | null)} tokenid
   * @param {boolean} allow
   * @returns  {Promise<ConsentResponse>}
   * @memberof AuthService
   */
  public async sendDataConsent(tokenid: string | null, allow: boolean):
      Promise<ConsentResponse> {
    const body = { 'lupa-id': tokenid };
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

  /**
   * Routen vaihtuessa päivitä käyttäjätiedot. Tarvitaan kurssi id URL:sta.
   *
   * @memberof AuthService
   */
  public startUpdatingUserinfo(): void {
    // Älä käytä route.paramMap. Ei toimi upotuksessa.
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd)
    ).subscribe(() => {
      const courseID = this.utils.getCourseIDfromURL();
      if (courseID) this.fetchUserInfo(courseID);
    });
  }

}
