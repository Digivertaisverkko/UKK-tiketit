import {  AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { ActivatedRoute, Router, ParamMap} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  private courseID: string | null = null;
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
  }

  ngOnInit(): void {
    this.authService.initialize();
    // this.trackForCourseID();
    // this.courseID = this.route.snapshot.paramMap.get('courseid');
    // console.log('app.component: saatiin kurssi id ' + this.courseID);
    //  this.trackForCourseID();
    this.isInIframe = this.testIframe();
    console.log('app.component OnInit ajetaan: courseID snapshotilla: ' + this.courseID);
    // Ei toimi vielä.
    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    console.log('Iframe upotuksen tila: ' + this.isInIframe.toString());
    // this.authService.initialize();
    // if (this.courseID !== null) {
    //   this.authService.setCourseID(this.courseID);
    // }
    this.trackLoginStatus();
  }

  private trackForCourseID() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      // console.log('------ app.component: kurssi ID muuttunut:' + courseID);
      // console.dir(paramMap);
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
