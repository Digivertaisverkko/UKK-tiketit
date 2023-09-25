import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthInfo, Role, User } from '../core.models';

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
  private courseName: string | null = null;
  private headline: Headline | null = null;
  private isLoading$: Subject<boolean> = new Subject();
  private isLoggedIn$ = new BehaviorSubject<boolean | null>(null);
  private isParticipant$ = new BehaviorSubject<boolean | null>(null);
  private constants;
  // Voidaan välittää viestejä komponenttien välillä.
  private messageEmitter$ = new Subject<string>();
  // Vierityksen kohta eri näkymäissä. Tällä hetkellä käytössä listaus -näkymässä.
  private positions: { [url: string]: number } = {};
  private user$ = new BehaviorSubject<User | null>(null);

  constructor() {
    this.constants = {
      baseTitle: 'Tukki - ',
      MAX_FILE_SIZE_MB: 100,
      MILLISECONDS_IN_MIN: 60000,
      thisYear: new Date().getFullYear()
    }
  }

  /* get -alkuiset palauttavat sen hetkisen arvon. Huomioi, että
    esimerkiksi käyttäjätietoja ei sivun latautumisen alussa ole
    välttämättä ehditty vielä hakea, vaan arvo on null. */

  public getBaseTitle(): string {
    return this.constants.baseTitle;
  }

  public getCourseName(): string | null {
    return this.courseName ?? '';
  }

  public getHeadline(): Headline | null {
    return this.headline;
  }

  public getIsLoggedIn(): Boolean | null {
    return this.isLoggedIn$.value;
  }

  public getMAX_FILE_SIZE_MB(): number {
    return this.constants.MAX_FILE_SIZE_MB;
  }

  public getMsInMin(): number {
    return this.constants.MILLISECONDS_IN_MIN;
  }

  public getThisYear(): number {
    return this.constants.thisYear;
  }

  public getUserRole(): Role | null {
    return this.user$.value?.asema ?? null;
  }

  public getUserInfo(): User | null {
    const user: User | null = this.user$.value;
    return user;
  }

  public getUserName(): string | null {
    return this.user$.value?.nimi ?? null;
  }

  public setHeadline(headline: Headline): void {
    this.headline = headline;
  }

  public setUserInfo(newUserInfo: User | null): void {
    if (this.user$.value !== newUserInfo) {
      this.user$.next(newUserInfo);
    }
  }

  public trackUserInfo(): Observable<User | null> {
    return this.user$.asObservable();
  }

  // Aiheutti errorin.
  public unTrackUserInfo(): void {
    this.user$.unsubscribe();
  }

  public getAuthInfo(): AuthInfo | null {
    return this.authInfo;
  }

  public getPosition(url: string): number {
    return this.positions[url] || 0;
  }

  public startLoading(): void {
    /* Laittaa muutoksen seuraavaan change detectionin macrotaskiin,
      jotta vältytään dev buildissa virheeltä:
      Error:ExpressionChangedAfterItHasBeenCheckedError */
    setTimeout( () => this.isLoading$.next(true) );
  }

  public stopLoading(): void {
    setTimeout( () => this.isLoading$.next(false) );
  }

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

  // Aseta tila kirjautuneeksi.
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

  public setParticipant(newIsParticipant: boolean | null): void {
    if (newIsParticipant !== this.isParticipant$.value) {
      this.isParticipant$.next(newIsParticipant);
    }
  }

  public setPosition(url: string, position: number) {
    this.positions[url] = position;
  }

  public onIsUserLoggedIn(): Observable<any> {
    return this.isLoggedIn$.asObservable();
  }

  public trackIfParticipant(): Observable<boolean | null> {
    return this.isParticipant$.asObservable();
  }

  public trackLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  public trackLoggedIn(): Observable<boolean | null> {
    return this.isLoggedIn$.asObservable();
  }

  public trackMessages(): Observable<string> {
    return this.messageEmitter$.asObservable();
  }

  public unsetPosition(): void {
    this.positions = {};
  }

  public untrackMessages(): void {
    this.messageEmitter$.unsubscribe;
  }
}
