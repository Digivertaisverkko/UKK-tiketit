import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from './core/auth.service';
import { environment } from 'src/environments/environment';
import { StoreService } from './core/store.service';
import { Observable } from 'rxjs';
// import { TicketService } from './ticket/ticket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  public courseName: string = '';
  private courseID: string | null = null;
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  public isLoading: Observable<boolean>;
  // public isUserLoggedIn$: Observable<boolean>;
  public logButtonString: string = '';

  private isLogged: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreService,
  ) {
    this.isLoading = this.store.trackLoading();
  }

  ngOnInit(): void {
    // this.trackLoading();
    if (environment.production === true) {
      console.log('Production build');
    }
    this.authService.initialize();
    //  this.trackForCourseID();

    // Upotuksen testaamisen uncomment alla oleva ja
    // kommentoi sen alla oleva rivi.
    // this.isInIframe = true;
    this.isInIframe = this.testIframe();
    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    console.log('Iframe upotuksen tila: ' + this.isInIframe.toString());
    this.trackLoginStatus();
    // this.trackCourseID();
  }


  private trackLoginStatus() {
    this.authService.onIsUserLoggedIn().subscribe(response => {
      if (response) {
        this.isLogged = true;
        this.logButtonString = $localize`:@@Kirjaudu ulos:Kirjaudu ulos`;
      } else if (!response) {
        this.isLogged = false;
        this.logButtonString = $localize`:@@Kirjaudu sisään:Kirjaudu sisään`;
      }
    });
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

  private testIframe () {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

}
