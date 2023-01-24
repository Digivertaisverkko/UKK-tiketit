import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  private isLogged: boolean = false;
  // public isUserLoggedIn$: Observable<boolean>;
  public logButtonString: string = ''
  private routeSubscription: Subscription | null = null;

  constructor(
      private authService: AuthService,
      private router: Router,
      private route: ActivatedRoute,
  ) {
    // this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['lang'] !== undefined ) {
        var language: string;
        if (params['lang'] == 'en') {
          language = 'en-US';
        } else {
          language = 'fi-FI';
        }
        const setLanguage = localStorage.getItem('language');
        if (setLanguage == undefined) {
          localStorage.setItem('language', language);
          window.location.reload();
        }
      }
    });
    this.isInIframe = this.testIframe();
    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    console.log(' iframe upotuksen tila: ' + this.isInIframe.toString());
    this.authService.initialize();
    this.authService.onIsUserLoggedIn().subscribe(response => {
      if (response == true) {
        this.isLogged = true;
        this.logButtonString = $localize`:@@Kirjaudu ulos:Kirjaudu ulos`;
      } else if (response == false) {
        this.isLogged = false;
        this.logButtonString = $localize`:@@Kirjaudu sisään:Kirjaudu sisään`;
      }
    });
  }

  public logInOut() {
    if (this.isLogged == true ) {
      this.authService.logOut();
      this.authService.sendAskLoginRequest('own').then((response: any) => {
          this.router.navigateByUrl(response);
      }).catch ( () => {})
    } else {
      this.authService.handleNotLoggedIn();
    }
  }

  private testIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

}
