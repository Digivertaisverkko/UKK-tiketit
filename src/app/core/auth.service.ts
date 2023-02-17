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
  // Sisältyy oAuth -tunnistautumiseen, mutta ei ole (vielä) käytössä.
  // private oAuthState: string = '';
  // private codeChallengeMethod: string = 'S256';
  // private responseType: string = 'code';

  private courseID: string | null = null;
  // private courseID$ = new BehaviorSubject <string>('');

  constructor(private errorService: ErrorService,
              private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute,
              @Inject( LOCALE_ID ) private localeDateFormat: string ) {
  }


  public initialize()
  {
    this.checkIfSessionIdInURL();
    this.checkIfSessionIDinStorage();
    this.updateUserInfo()
    // this.trackRouteParameters();
    // this.trackCourseID();
  }

  private checkIfSessionIDinStorage() {
    const savedSessionID = this.getSessionID();
    if (savedSessionID !== null) {
      // TODO Muuta myöhemmin, että asetetaan kirjautuneeksi vasta, kun saadaa palvelimelta hyväksytty vastaus?
      this.setLoggedIn();
    }
  }

  private updateUserInfo() {
    this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        let courseID = event.snapshot.paramMap.get('courseid');
        if (courseID !== undefined && courseID !== null) {
          console.log('updateUserInfo: saatiin kurssi ID ' + courseID + ' url:sta');
          this.setCourseID(courseID);
          if (this.getSessionID !== null) {
            console.log('updateUserInfo 1: haetaan käyttäjätiedot.');
            this.fetchUserInfo(courseID);
          }
        }
      }
      // } else if (event instanceof GuardsCheckStart) {
      // if (this.isUserLoggedIn$.value === true && this.courseID$.value !== null) {
      //   if (window.localStorage.getItem('SESSION_ID') !== undefined && this.courseID !== null) {
      //   console.log('-- updateUserInfo 2: haetaan käyttäjätiedot: kurssi id: ' + this.courseID);
      //   this.fetchUserInfo(this.courseID);
      // }
      // }
    });
  }
  
  // private trackCourseID() {
  //   this.courseID$.subscribe(courseID => {
  //     console.log('trackCourseID: saatiin kurssi ID: ' + courseID + '. Session id on ' + this.getSessionID());
  //     if (this.getSessionID() !== null && courseID.length > 0 ) {
  //       this.fetchUserInfo(courseID).then( response => {
  //         this.setLoggedIn();
  //       }).catch(error => {
  //         this.handleError(error);
  //       })
  //     }
  //   })
  // }

  private trackRouteParameters() {
    const route = window.location.pathname + window.location.search;
    console.log('auth service: route on '+ route);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      console.log(' auth service: trackRouteParameters: saatiin kurssi ID:' + courseID);
      if (courseID !== null) {
        this.setCourseID(courseID);
      }
    });
  }

  public setCourseID(courseID: string) {
    if (courseID !== this.courseID) {
      console.log('setCourseID: asetetaan kurssi id: ' + this.courseID);
      this.courseID = courseID;
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

  private trackLoginStatus() {
    this.onIsUserLoggedIn().subscribe(response => {
      const courseID = this.courseID;
      if (response == true) {
        if (courseID !== null) {
          console.log('trackLoginStatus: haetaan käyttäjätiedot.');
          this.fetchUserInfo(courseID).then(response => this.setLoggedIn());
        }
      }
    });
  }

  /* Alustetaan ohjelman tila huomioiden, että kirjautumiseen liittyvät tiedot voivat
    olla jo local storagessa. */
  public async initialize2(courseID: string, sessionIDfromURL?: string) {
    // if (window.localStorage.getItem('SESSION_ID') == null) return
    var sessionID: string;
    if (sessionIDfromURL === undefined) { 
      const savedSessionID = this.getSessionID();
      if (savedSessionID === null) {
        console.warn('authService.initialize: Virhe: ei session ID:ä.');
        return
      } else {
        sessionID = savedSessionID;
      }
    } else {
      sessionID = sessionIDfromURL;
    }
    this.setSessionID(sessionID);
    // session id voi olla vanhentunut, mutta asetetaan kirjautuneeksi,
    // jotta ei ohjauduta loginiin page refresh:lla.
    // this.setLoggedIn();
    this.fetchUserInfo(courseID);
  }

  // ----- uudet metodit päättyvät

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


  // Ei käytössä enää, koska kurssi ID:ä ei tallenneta local storageen.
    //   public async initializeOld() {
    //     if (window.localStorage.getItem('SESSION_ID') == null) return
    //     const savedCourseID: string | null = window.localStorage.getItem('COURSE_ID');
    //     if (savedCourseID !== null) {
    //           // session id voi olla vanhentunut, mutta asetetaan kirjautuneeksi,
    //     // jotta ei ohjauduta loginiin page refresh:lla.
    //     this.setLoggedIn();
    //     this.fetchUserInfo(savedCourseID);
    //   } else {
    //     console.log('authService.initialize: ei kurssi ID:ä!');
    //   }
    // }

  // Aseta aktiivinen kurssi ja päivitä lokaalit käyttäjätiedot, jos niitä ei ole haettu.
  // public setActiveCourse(courseID: string | null) {
    // Tallennetaan kurssi-ID sessioon, jos se on vaihtunut.
    // if (courseID !== null && this.activeCourse$.value.id !== courseID) {
    // if (courseID !== null) {
    //   window.localStorage.setItem('COURSE_ID', courseID);
      // Nimi ei vielä käytössä.
      // this.activeCourse$.next({ id: courseID, nimi: ''});
  //     if (this.user$.value.id === 0) this.getUserInfo();
  //   }
  // }

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
    if (sessionID === undefined || sessionID === null) {
      console.log('otettiin session ID local storagesta.');
      this.setNotLoggegIn();
    }
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
      response = await firstValueFrom(this.http.post<GenericResponse>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return (response?.success === true) ? true : false;
  }

  // Hae ja tallenna palvelimelta käyttöjätiedot paikallisesti käytettäviksi. Tarvitsee, että session id on asetettu.
  // Tästä luovutaan. Jatkossa yksi käyttäjäobjekti on vain auth.service:ssä.
  public async fetchUserInfo(courseID: string) {
    if (window.localStorage.getItem('SESSION_ID') == null) {
      console.warn('Virhe: fetchUserInfo(): ei session id:ä, ei voida hakea ja tallentaa tietoja.');
      this.setNotLoggegIn();
      return
    }
    if (courseID === null) {
      console.error('Virhe: fetchUserInfo(): Kurssi ID:ä, ei voida hakea tietoja.');
      return
    }
    try {
      // TODO: Pystyisikö await:sta luopumaan, jottei tulisi viivettä? Osataanko joka paikassa odottaa observablen arvoa?
      const userInfo = await this.getMyUserInfo(courseID);
      if (userInfo !== null && userInfo !== this.user$.value) {
        console.log('vanha userinfo: ' + JSON.stringify(this.user$.value));
        console.log('uusi userinfo: ' + JSON.stringify(userInfo));
        this.user$.next(userInfo);
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // Hae omat kurssikohtaiset tiedot.
  private async getMyUserInfo(courseID: string): Promise<User> {
    if (courseID === undefined || courseID === null || courseID === '') {
      throw new Error('authService.getMyUserInfo: Ei kurssi ID:ä: ' + courseID);
    }
    if (isNaN(Number(courseID))) {
      throw new Error('authService: Haussa olevat tiedot ovat väärässä muodossa.');
    }
    //const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/oikeudet';
    try {
      console.log('authService.getMyUserInfo: haetaan käyttäjätiedot');
      response = await firstValueFrom<User>(this.http.get<any>(url));
      if (response?.id !== undefined && response?.id !== null) {
        console.log('getMyUserInfo: asetettiin kirjautuminen.');
        this.setLoggedIn(); 
      }
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
      response = await firstValueFrom(this.http.post<{'login-url': string}>(url, null, httpOptions));
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
      response = await firstValueFrom(this.http.post<LoginResponse>(url, null, httpOptions));
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
      response = await firstValueFrom(this.http.get<AuthRequestResponse>(url, httpOptions));
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

  // Lähetä muotoiltuvirheilmoitus consoleen, puutu ylemmän tason virheisiin kuten jos ei olle kirjautuneita.
  // Lähetä virheilmoitus templateen napattavaksi backendin virheolion muodossa.

  // Suorita uloskirjautuminen.
  public async logOut(): Promise<any> {
    const sessionID = this.getSessionID();
    if (sessionID == undefined) {
      console.error('authService.logout: ei session ID:ä.');
      this.setNotLoggegIn();
      window.localStorage.clear();
    } else {
      //const httpOptions = this.getHttpOptions();
      let response: any;
      let url = environment.apiBaseUrl + '/kirjaudu-ulos';
      try {
        console.log('Lähetettäisiin logout-kutsu, mutta ei ole tukea sille vielä.');
        // response = await firstValueFrom(this.http.post<{'login-url': string}>(url, null, httpOptions));
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
