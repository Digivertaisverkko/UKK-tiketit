import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })

// Käsittelee muistissa olevia muuttujia, joita tarvitaan komponentin ja sen lapsien ulkopuolella.

export class StoreService {

  // Voidaan välittää viestejä komponenttien välillä.
  private messageEmitter$ = new Subject<string>();
  private positions: { [url: string]: number } = {};

  constructor() { }

  public getPosition(url: string): number {
    return this.positions[url] || 0;
  }

  public trackMessages(): Observable<string> {
    return this.messageEmitter$.asObservable();
  }

  public sendMessage(message: string): void {
    this.messageEmitter$.next(message);
  }

  public setPosition(url: string, position: number) {
    this.positions[url] = position;
  }

  public untrackMessages(): void {
    this.messageEmitter$.unsubscribe;
  }
}
