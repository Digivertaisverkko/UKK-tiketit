import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';

import { AuthService, User } from './core/auth.service';
import { environment } from 'src/environments/environment';
import { getIsInIframe } from './shared/utils';
import { StoreService } from './core/store.service';
// import { TicketService } from './ticket/ticket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy  {
  public courseName: string = '';
  private courseID: string | null = null;
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  public isLoading: Observable<boolean> | null = null;
  // public isUserLoggedIn$: Observable<boolean>;
  public logButtonString: string = '';
  public user: User = {} as User;

  private isLogged: boolean = false;
  private unsubscribe$ = new Subject<void>();

  constructor (
    private authService: AuthService,
    private router: Router,
    private route : ActivatedRoute,
    private store : StoreService,
  ) {
    this.isLoading = this.store.trackLoading();
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

  public logInOut() {
    if (this.isLogged) {
      this.authService.saveRedirectURL();
      this.authService.logout(this.courseID);
    } else {
      this.authService.saveRedirectURL();
      this.authService.navigateToLogin(this.courseID);
    }
  }

  private trackLoginStatus() {
    this.authService.onIsUserLoggedIn()
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
