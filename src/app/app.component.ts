import {  AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { ActivatedRoute, Router, ParamMap} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  private courseID: string | null;
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  // public isUserLoggedIn$: Observable<boolean>;
  public logButtonString: string = '';
  private isLogged: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.courseID = this.route.snapshot.paramMap.get('courseid');
  }

  ngOnInit(): void {
    this.isInIframe = this.testIframe();
    console.log('app.component: courseID: ' + this.courseID);
    // Ei toimi vielä.
    // this.trackForCourseID();
    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    console.log('Iframe upotuksen tila: ' + this.isInIframe.toString());
    this.checkForSessionID();
    this.authService.initialize();
    // if (this.courseID !== null) {
    //   this.authService.setCourseID(this.courseID);
    // }
    this.trackLoginStatus();
  }

  private checkForSessionID() {
    // Angular Routella parametrien haku ei onnistunut.
    const urlParams = new URLSearchParams(window.location.search);
    const sessionID = urlParams.get('sessionID');
    if (sessionID !== undefined && sessionID !== null) {
      console.log('Saatiin session ID URL:sta.');
      this.authService.setSessionID(sessionID);
    }
  }

  // Uusi
  private trackForCourseID() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      console.log('app.component: trackForCourseID: saatiin kurssi ID: ' + courseID);
      if (courseID !== null) {
        this.authService.setCourseID(courseID);
      }
    });
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

  // trackQueryParameters() {
  //   this.route.queryParams.subscribe(params => {
  //     if (params['sessionID'] !== null && params['sessionID'] !== undefined) {
  //       let sessionID = params['sessionID'];
  //       console.log('Parametrit: ' + params['sessionID']);
  //       console.log('huomattu session id url:ssa, tallennetaan ja käytetään sitä.');
  //       this.authService.setSessionID(sessionID);
  //     }
  //   });
  // }

  public logInOut() {
    if (this.isLogged) {
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
