import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthInfo, Role, User } from '../core.models';

/**
 * Näkymän otsikko.
 *
 * @interface Headline
 */
interface Headline {
  text?: string;
  appHeadline?: boolean;
  noCourseTitle?: boolean;
  showInIframe?: boolean;
}

/**
 *
 * Tallennetaan ja palautetaan muistissa olevia globaaleja muuttujia ja vakioita,
 * eli ohjelman state. Tämä rakennetaan uudestaan näkymiä vaihdettassa eikä
 * tallenneta sessioiden välilä. Komponenttien ja niiden lapsien tai vanhempien
 * välinen tiedonvaihto käydään suoraan niiden välillä @Input ja @Output -
 * dekoraattoreilla. Tällä servicellä taas välitetään tieto minkä tahansa
 * komponenttien tai serviceiden välillä. Tämä on myös ainut service, jossa tätä
 * statea pidetään. Tämän lisäksi sessioiden yli säilyvää statea säilytetään
 * local storagessa.
 *
 * @export
 * @class StoreService
 */
@Injectable({ providedIn: 'root' })

export class StoreService {
  // Kaikki jäsenmuuttujat tulisi olla privaatteja.
  private authInfo: AuthInfo | null = null;
  private constants = {
    baseTitle: 'Tukki - ',
    MAX_FILE_SIZE_MB: 100,
    MILLISECONDS_IN_MIN: 60000,
    thisYear: new Date().getFullYear()
  }
  private courseName: string | null = null;
  private headline: Headline | null = null;
  private isLoading$: Subject<boolean> = new Subject();
  private isLoggedIn$ = new BehaviorSubject<boolean | null>(null);
  private messageEmitter$ = new Subject<string>();
  private positions: { [url: string]: number } = {};
  private user$ = new BehaviorSubject<User | null | undefined>(undefined);

  constructor() {

  }

  /* get -alkuiset palauttavat sen hetkisen arvon. Huomioi, että
    esimerkiksi käyttäjätietoja ei sivun latautumisen alussa ole
    välttämättä ehditty vielä hakea, vaan arvo on tällöin null. */

  /**
   * Sovelluksen selainotsikoiden perusosa.
   *
   * @return {*}  {string}
   * @memberof StoreService
   */
  public getBaseTitle(): string {
    return this.constants.baseTitle;
  }

  /**
   * Aktiivisen kurssin nimi.
   *
   * @return {*}  {(string | null)}
   * @memberof StoreService
   */
  public getCourseName(): string | null {
    return this.courseName ?? '';
  }

  /**
   * Näkymän otsikko.
   *
   * @return {*}  {(Headline | null)}
   * @memberof StoreService
   */
  public getHeadline(): Headline | null {
    return this.headline;
  }

  /**
   * Onko käyttäjä kirjautunut.
   *
   * @return {*}  {(Boolean | null)}
   * @memberof StoreService
   */
  public getIsLoggedIn(): Boolean | null {
    return this.isLoggedIn$.value;
  }

  /**
   * Maksimi liitetiedostojen koko megatavuina.
   *
   * @return {*}  {number}
   * @memberof StoreService
   */
  public getMAX_FILE_SIZE_MB(): number {
    return this.constants.MAX_FILE_SIZE_MB;
  }

  /**
   * Millisekuntien määrä minuutissa.
   *
   * @return {*}  {number}
   * @memberof StoreService
   */
  public getMsInMin(): number {
    return this.constants.MILLISECONDS_IN_MIN;
  }

  /**
   * Nykyinen vuosi.
   *
   * @return {*}  {number}
   * @memberof StoreService
   */
  public getThisYear(): number {
    return this.constants.thisYear;
  }

  /**
   * Käyttäjän rooli kurssilla, johon ollaan kirjautuneena.
   *
   * @return {*}  {(Role | null)}
   * @memberof StoreService
   */
  public getUserRole(): Role | null {
    return this.user$.value?.asema ?? null;
  }

  /**
   * Käyttäjän tiedot.
   *
   * undefined  Tietoja ei olla vielä haettu.
   * null       Käyttäjä ei ole kirjautunut. Voi olla kirjautuneena
   *            eri kurssille.
   *
   * @return {*}  {(User | null)}
   * @memberof StoreService
   */
  public getUserInfo(): User | null | undefined {
    const user = this.user$.value;
    return user;
  }

  /**
   * Palauta käyttäjän nimi.
   *
   * @return {*}  {(string | null)}
   * @memberof StoreService
   */
  public getUserName(): string | null {
    return this.user$.value?.nimi ?? null;
  }

  /**
   * Aseta näkymän otsikko.
   *
   * @param {Headline} headline
   * @memberof StoreService
   */
  public setHeadline(headline: Headline): void {
    this.headline = headline;
  }

  public setUserInfo(newUserInfo: User | null): void {
    if (this.user$.value !== newUserInfo) {
      this.user$.next(newUserInfo);
    }
  }

  /**
   * Seuraa käyttäjätietoja observablena.
   *
   * @return {*}  {(Observable<User | null>)}
   * @memberof StoreService
   */
  public trackUserInfo(): Observable<User | null | undefined> {
    return this.user$.asObservable();
  }

  // Aiheutti errorin.
  public unTrackUserInfo(): void {
    this.user$.unsubscribe();
  }

  /**
   * Hae käyttäjän kirjautumistiedot.
   *
   * @return {*}  {(AuthInfo | null)}
   * @memberof StoreService
   */
  public getAuthInfo(): AuthInfo | null {
    return this.authInfo;
  }

  /**
   * Hae vierityksen kohta.
   *
   * @param {string} url
   * @return {*}  {number}
   * @memberof StoreService
   */
  public getPosition(url: string): number {
    return this.positions[url] || 0;
  }

  /**
   *  Aseta tieto näkymän lataamisesta progress barin varten seuraavaan change
   * detectionin macrotaskiin.
   *
   * @memberof StoreService
   */
  // Näin vältytään virheeltä ExpressionChangedAfterItHasBeenCheckedError.
  public startLoading(): void {
    setTimeout( () => this.isLoading$.next(true) );
  }

  /**
   * Aseta tieto näkymän lataamisen lopettamisesta progress barin varten.
   *
   * @memberof StoreService
   */
  public stopLoading(): void {
    setTimeout( () => this.isLoading$.next(false) );
  }

  /**
   * Lähetä viesti komponenttien välillä, joilla ei ole parent-child -
   * suhdetta.
   *
   * @param {string} message
   * @memberof StoreService
   */
  public sendMessage(message: string): void {
    this.messageEmitter$.next(message);
  }

  public setAuthInfo(authInfo: AuthInfo): void {
    this.authInfo = authInfo;
  }

  public setCourseName(courseName: string): void {
    if (this.courseName !== courseName) {
      this.courseName = courseName;
    }
  }

  /**
   * Aseta, että käyttäjä on kirjautunut.
   *
   * @memberof StoreService
   */
  public setLoggedIn(): void {
    if (this.isLoggedIn$.value !== true) {
      // this.setSessionID('loggedin');
      this.isLoggedIn$.next(true);
      console.log('authService: asetettiin kirjautuminen.');
    }
  }

  // Aseta tila kirjautumattomaksi.
  public setNotLoggegIn(): void {
    console.log('Asetetaan: ei kirjautunut.');
    if (this.isLoggedIn$.value !== false) {
      this.isLoggedIn$.next(false);
    }
    if (this.user$ !== null) this.user$.next(null);
  }

  /**
   * Aseta näkymän vierityksen kohta.
   *
   * @param {string} url
   * @param {number} position
   * @memberof StoreService
   */
  public setPosition(url: string, position: number) {
    this.positions[url] = position;
  }

  public onIsUserLoggedIn(): Observable<any> {
    return this.isLoggedIn$.asObservable();
  }

  /**
   * Seuraa näkymän lataamisen tilaa. Tämä on käytössä progress barin
   * näyttämiseen.
   *
   * @return {*}  {Observable<boolean>}
   * @memberof StoreService
   */
  public trackLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  /**
   * Seuraa kirjautumisen tilaa.
   *
   * @return {*}  {(Observable<boolean | null>)}
   * @memberof StoreService
   */
  public trackLoggedIn(): Observable<boolean | null> {
    return this.isLoggedIn$.asObservable();
  }

  /**
   * Seuraa viestejä komponenttien välillä.
   *
   * @return {*}  {Observable<string>}
   * @memberof StoreService
   */
  public trackMessages(): Observable<string> {
    return this.messageEmitter$.asObservable();
  }

  /**
   *  Poista vierityksen kohta.
   *
   * @memberof StoreService
   */
  public unsetPosition(): void {
    this.positions = {};
  }

  /**
   * Lopeta komponenttien välisten viestien seuraaminen.
   *
   * @memberof StoreService
   */
  public untrackMessages(): void {
    this.messageEmitter$.unsubscribe;
  }
}
