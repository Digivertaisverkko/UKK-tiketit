/* Voidaan tallentaa ja palauttaa muistissa olevia muuttujia, joita tarvitaan
globaalisti komponenttien ja sen lapsien tai vanhempien ulkopuolella. */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class StoreService {

  private isLoading$: Subject<boolean> = new Subject();
  // Voidaan välittää viestejä komponenttien välillä.
  private messageEmitter$ = new Subject<string>();
  private positions: { [url: string]: number } = {};

  constructor() { }

  public getPosition(url: string): number {
    return this.positions[url] || 0;
  }

  public startLoading() {
    /* Laittaa muutokseen seuraavaan macrotaskiin, jotta
      vältytään dev buildin virheeltä:
      Error:ExpressionChangedAfterItHasBeenCheckedError */
    setTimeout( () => this.isLoading$.next(true) );
  }

  public stopLoading() {
    setTimeout( () => this.isLoading$.next(false) );
  }

  public sendMessage(message: string): void {
    this.messageEmitter$.next(message);
  }

  public setPosition(url: string, position: number) {
    this.positions[url] = position;
  }

  public trackLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  public trackMessages(): Observable<string> {
    return this.messageEmitter$.asObservable();
  }

  public untrackMessages(): void {
    this.messageEmitter$.unsubscribe;
  }
}
