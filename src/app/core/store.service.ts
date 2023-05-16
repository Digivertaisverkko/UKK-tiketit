/* Voidaan tallentaa ja palauttaa muistissa olevia muuttujia, joita tarvitaan
globaalisti useamman kuin yhden komponentin ja sen lapsien tai vanhempien
ulkopuolella. Tämä tulisi olla ainut service, jossa näin tehdään. */

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Role, User } from './core.models';

@Injectable({ providedIn: 'root' })

export class StoreService {

  // Kaikki jäsenmuuttujat tulisi olla privaatteja.
  private isLoading$: Subject<boolean> = new Subject();
  private isLoggedIn$ = new BehaviorSubject<boolean | null>(null);
  private isParticipant$ = new BehaviorSubject<boolean | null>(null);
  // Voidaan välittää viestejä komponenttien välillä.
  private messageEmitter$ = new Subject<string>();
  private positions: { [url: string]: number } = {};
  private user$ = new BehaviorSubject<User | null>(null) ;

  constructor() { }

  /* get -alkuiset palauttavat sen hetkisen arvon. Huomioi, että
    esimerkiksi käyttäjätietoja ei sivun latautumisen alussa ole
    välttämättä ehditty vielä hakea, vaan arvo on null. */

  public getIsLoggedIn(): Boolean | null {
    return this.isLoggedIn$.value;
  }

  public getUserRole(): Role | null {
    return this.user$.value?.asema ?? null;
  }

  public getUserInfo(): User | null {
    const user: User | null = this.user$.value;
    return user;
  }

  public getUserName(): string | null {
    // return this.userName$.value;
    // const user: User  = this.user$.value;
    // return user.nimi;
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

  public startLoading() {
    /* Laittaa muutoksen seuraavaan change detectionin macrotaskiin,
      jotta vältytään dev buildissa virheeltä:
      Error:ExpressionChangedAfterItHasBeenCheckedError */
    setTimeout( () => this.isLoading$.next(true) );
  }

  public stopLoading() {
    setTimeout( () => this.isLoading$.next(false) );
  }

  public sendMessage(message: string): void {
    this.messageEmitter$.next(message);
  }

  // Aseta tila kirjautuneeksi.
  public setLoggedIn() {
    if (this.isLoggedIn$.value !== true) {
      // this.setSessionID('loggedin');
      this.isLoggedIn$.next(true);
      console.log('authService: asetettiin kirjautuminen.');
    } else {
    }
  }

  // Aseta tila kirjautumattomaksi.
  public setNotLoggegIn() {
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

  public trackIfParticipant(): Observable<Boolean | null> {
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

  public untrackMessages(): void {
    this.messageEmitter$.unsubscribe;
  }
}
