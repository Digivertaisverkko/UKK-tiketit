import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })

/* Tallentaa ja palauttaa muistissa olevia muuttujia, joita tarvitaan komponentin
ja sen lapsien ulkopuolella. */

export class StoreService {

  // Voidaan välittää viestejä komponenttien välillä.
  private isLoading$: Subject<boolean> = new Subject();
  private messageEmitter$ = new Subject<string>();
  private positions: { [url: string]: number } = {};

  constructor() { }

  public getPosition(url: string): number {
    return this.positions[url] || 0;
  }

  public startLoading() {
    this.isLoading$.next(true);
  }

  public stopLoading() {
    this.isLoading$.next(false);
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
