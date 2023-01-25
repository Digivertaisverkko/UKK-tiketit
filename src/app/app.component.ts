import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  private isLogged: boolean = false;
  // public isUserLoggedIn$: Observable<boolean>;
  public logButtonString: string = '';

  constructor(
      private authService: AuthService,
      private router: Router
  ) {
    // this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
  }

  ngOnInit(): void {
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

}
