import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ResolveEnd, GuardsCheckStart, Router, ParamMap, ActivationEnd  } from '@angular/router';
import { TicketService } from 'src/app/ticket/ticket.service';
import { AuthService, User } from '../auth.service';

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
  public courseID: string | null = this.route.snapshot.paramMap.get('courseid');

  private _language!: string;

  constructor (
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService)
    {
    this._language = localStorage.getItem('language') ?? 'fi-FI';
    // this.sliderChecked = (window.sessionStorage.getItem('IN-IFRAME') == 'true') ? true : false;
  }

  ngOnInit(): void {
    this.trackCourseID();
    this.trackUserInfo();
    this.authService.onIsUserLoggedIn().subscribe(response => this.isLoggedIn = response);
  }

  private trackCourseID() {
    this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        let courseID = event.snapshot.paramMap.get('courseid');
        if (courseID !== this.courseID) {
          console.log('updateUserInfo: saatiin kurssi ID ' +  courseID  +' url:sta');
          this.courseID = courseID;
        }
      }
    });
  }

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
        case 'opiskelija':
          role = $localize`:@@Opiskelija:Opiskelija`; break;
        case 'opettaja':
          role = $localize`:@@Opettaja:Opettaja`; break;
        case 'admin':
          role = $localize`:@@Admin:Admin`; break;
        default:
          role = '';
      }
      this.userRole = role;
  }

  // public changeLanguage(language: 'en-US' | 'fi-FI') {
  //   this.language = language;
  // }

  public toggleLanguage() {
    this.language = (this._language === 'fi-FI') ? 'en-US' : 'fi-FI';
  }

  get language(): string {
    return this._language;
  }

  set language(value: string) {
    if (value !== this._language) {
      localStorage.setItem('language', value);
      window.location.reload();
    }
  }

  public goToFrontPage() {
    if (this.courseID !== null) {
      const currentRoute = window.location.pathname;
      if (currentRoute.includes('/list-tickets')) {
        this.ticketService.sendRefresh();
      } else {
        this.router.navigateByUrl('course/' + this.courseID +  '/list-tickets');
      }
    } else {
      console.error('Ei kurssi ID:ä.');
    }
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
