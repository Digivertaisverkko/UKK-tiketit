import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ResolveEnd, GuardsCheckStart, Router, Route  } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, User } from '../auth.service';
import { TicketService } from 'src/app/ticket/ticket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // public isUserLoggedIn$: Observable<boolean>;
  // Async pipeä varten.
  public isLoggedIn: boolean = false;
  public disableLanguageSelection: boolean = false;
  public readonly maxUserLength = 40;
  public user: User = {} as User;
  public userRole: string = '';
  get language(): string {
    return this._language;
  }

  set language(value: string) {
    if (value !== this._language) {
      localStorage.setItem('language', value);
      window.location.reload();
    }
  }
  private _language!: string;

  // private route: ActivatedRoute,

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService)
    {
    // this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
    this.authService.onIsUserLoggedIn().subscribe(response => {
      this.isLoggedIn = response;
      // console.log('header: asetettiin kirjautumisen tila: ' + this.isLoggedIn);
    })
    this._language = localStorage.getItem('language') ?? 'fi-FI';
    // this.sliderChecked = (window.sessionStorage.getItem('IN-IFRAME') == 'true') ? true : false;
  }

  ngOnInit(): void {
    this.trackUserInfo();
    this.router.events.subscribe(event => {
      // console.log(JSON.stringify(event));
      if (event instanceof GuardsCheckStart) {
        // Testataan, ollaanko kirjautuneina.
        this.authService.getSessionID();
        let courseID: string | null = this.authService.getActiveCourse();
        // console.log(`*** header: loggedin: ${this.isLoggedIn} kurssi-id: ${courseID} `);
        if (this.isLoggedIn === true && courseID !== null && courseID.length > 0) {

          this.authService.fetchUserInfo(courseID);
        }
      }
    });
  }

  // (route.startsWith('/login') == false) {

  trackUserInfo() {
    this.authService.trackUserInfo().subscribe(response => {
        // console.log('header: saatiin user info: ' + response);
        this.user = response;
        // let newUserName: string = response?.nimi ?? '';
        // console.log('käyttäjänimi:  '+ newUserName);
        // if (newUserName.length > 0) {
        //   newUserName = newUserName.charAt(0).toUpperCase() + newUserName.slice(1);
        //   if (newUserName !== this.userName) this.userName = newUserName;
        // } else {
        //   this.userName = '';
        // }
        this.setUserRole(this.user.asema);
    })
  }

  updateMenu() {
    const url = new URL(window.location.href);
    this.disableLanguageSelection =  (url.searchParams.get('lang') !== null) ? true : false;
  }

  setUserRole(asema: string): void {
    let role: string = '';
      switch (asema) {
        case 'opiskelija': {
          role = $localize`:@@Opiskelija:Opiskelija`; break;
        }
        case 'opettaja': {
          role = $localize`:@@Opettaja:Opettaja`; break;
        }
        case 'admin': {
          role = $localize`:@@Admin:Admin`; break;
        }
        default: {
          role = '';
        }
      }
      this.userRole = role;
  }


  // public changeLanguage(language: 'en-US' | 'fi-FI') {
  //   this.language = language;
  // }

  public toggleLanguage() {
    // console.log(' --- kieli: ' + this.language);
    this.language = (this._language === 'fi-FI') ? 'en-US' : 'fi-FI';
  }

  public goToFrontPage() {
    // const currentRoute = window.location.pathname + window.location.search;
      const courseID = this.ticketService.getActiveCourse();
      if (courseID !== null) this.router.navigateByUrl('/list-tickets?courseID=' + courseID);
  }

  public login(): void{
    this.authService.handleNotLoggedIn();
  }

  public logOut() {
    this.authService.logOut();
    this.authService.sendAskLoginRequest('own').then((response: any) => {
      // console.log(' headerComponent: saatiin vastaus: ' + JSON.stringify(response));
        this.router.navigateByUrl(response);
    }).catch (error => {})
  }

}
