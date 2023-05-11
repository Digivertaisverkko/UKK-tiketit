import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';

import { AuthService } from './core/auth.service';
import { environment } from 'src/environments/environment';
import { StoreService } from './core/store.service';
import { User } from './core/core.models';
// import { TicketService } from './ticket/ticket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy  {
  public courseName: string = '';
  public courseID: string | null = null;
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  public isLogged: boolean = false;
  public isLoading: Observable<boolean> | null = null;
  // public isUserLoggedIn$: Observable<boolean>;
  public logButtonString: string = '';
  private unsubscribe$ = new Subject<void>();
  public user$: Observable<User | null>;

  constructor (
    private authService: AuthService,
    private store : StoreService,
  ) {
    this.isLoading = this.store.trackLoading();
    this.user$ = this.store.trackUserInfo();
  }

  ngOnInit(): void {
    if (environment.production === true) {
      console.log('Production build');
    }
    this.authService.initialize();
    // Upotuksen testaamisen uncomment alla oleva ja
    // kommentoi sen alla oleva rivi.
    // this.isInIframe = true;
    this.isInIframe = this.getIsInIframe();
    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    console.log('Iframe upotuksen tila: ' + this.isInIframe.toString());
    this.trackLoginStatus();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getIsInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  private trackLoginStatus() {
    this.store.onIsUserLoggedIn()
      .pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(response => {
      if (response) {
        this.isLogged = true;
        this.logButtonString = $localize`:@@Kirjaudu ulos:Kirjaudu ulos`;
      } else if (!response) {
        this.isLogged = false;
        this.logButtonString = $localize`:@@Kirjaudu sisään:Kirjaudu sisään`;
      }
    });
  }

}
