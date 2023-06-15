/* Voidaan tallentaa ja palauttaa muistissa olevia muuttujia ja vakioita, joita
tarvitaan globaalisti useamman kuin yhden komponentin ja sen lapsien tai vanhempien
ulkopuolella. Tämä tulisi olla ainut service, jossa näin tehdään. */

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Role, User } from '../core.models';

@Injectable({ providedIn: 'root' })

export class StoreService {

  // Kaikki jäsenmuuttujat tulisi olla privaatteja.
  private courseName: string | null = null;
  private isLoading$: Subject<boolean> = new Subject();
  private isLoggedIn$ = new BehaviorSubject<boolean | null>(null);
  private isParticipant$ = new BehaviorSubject<boolean | null>(null);
  // Voidaan välittää viestejä komponenttien välillä.
  private constants;
  private messageEmitter$ = new Subject<string>();
  private positions: { [url: string]: number } = {};
  private user$ = new BehaviorSubject<User | null>(null);

  constructor() {
    this.constants = {
      baseTitle: 'UKK Tiketit - ',
      MILLISECONDS_IN_MIN: 60000,
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

  public getIsLoggedIn(): Boolean | null {
    return this.isLoggedIn$.value;
  }

  public getMsInMin(): number {
    return this.constants.MILLISECONDS_IN_MIN;
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
