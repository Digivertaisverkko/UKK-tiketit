import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { TicketService } from 'src/app/ticket/ticket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isUserLoggedIn$: Observable<boolean>;
  public isUserLoggedIn: boolean = false;
  public disableLanguageSelection: boolean = false;
  public readonly maxUserLength = 40;
  public userRole: string = '';
  public userName: string = '';
  public userEmail: string = '';
  public hideLogging: boolean = true;
  public sliderChecked: boolean;

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
    this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
    this._language = localStorage.getItem('language') ?? 'fi-FI';
    this.sliderChecked = (window.sessionStorage.getItem('IN-IFRAME') == 'true') ? true : false;
  }

  ngOnInit(): void {

    // this.updateUserRole();
    // this.updateUserName();
    // this.updateUserEmail();
    // this.router.events.subscribe(() => {
      this.trackUserInfo();
    // });
  }

  // (route.startsWith('/login') == false) {

  trackUserInfo() {
    this.authService.trackUserInfo().subscribe(response => {
      if (response !== null) {

        let newUserName: string = response.nimi;
        if (newUserName.length > 0) {
          newUserName = newUserName.charAt(0).toUpperCase() + newUserName.slice(1);
          if (newUserName !== this.userName) {
            this.userName = newUserName;
          }
        } else {
          this.userName = '';
        }

        // TODO: tarkastus, onko muuttunut.
        if (response.sposti.length > 0) {
          this.userEmail = response.sposti;
        } else {
          this.userEmail = '';
        }
        this.setUserRole(response.asema);
      }
    })
  }

  updateMenu() {
    const url = new URL(window.location.href);
    if (url.searchParams.get('lang') !== null) {
      this.disableLanguageSelection = true;
      console.log(' kieli disabloitu');
    } else {
      this.disableLanguageSelection = false;
      console.log(' kieli enabloitu');
    };
  }

  setUserRole(asema: string): void {
    let role: string = '';
      switch (asema) {
        case 'opiskelija': {
          role = $localize`:@@Opiskelija:Opiskelija`;
          break;
        }
        case 'opettaja': {
          role = $localize`:@@Opettaja:Opettaja`;
          break;
        }
        case 'admin': {
          role = $localize`:@@Admin:Järjestelmävalvoja`;
          break;
        }
        default: {
          this.userRole = '';
        }
      }
        this.userRole = role.charAt(0).toUpperCase() + role.slice(1);
  }

  // updateUserName() {
  //   this.authService.onGetUserName().subscribe(response => {
  //       if (response.length > 0 ) {
  //         this.userName = response.charAt(0).toUpperCase() + response.slice(1);
  //       } else {
  //         this.userName = '';
  //       }
  //   })
  // }

  // updateUserEmail() {
  //   this.authService.onGetUserEmail().subscribe(response => {
  //       if (response.length > 0 ) {
  //         this.userEmail = response;
  //       } else {
  //         this.userEmail = '';
  //       }
  //   })
  // }

  // updateUserRole() {
  //   this.authService.onGetUserRole().subscribe(response => {
  //     let role: string = '';
  //     switch (response) {
  //       case 'opiskelija': {
  //         role = $localize`:@@Opiskelija:Opiskelija`;
  //         break;
  //       }
  //       case 'opettaja': {
  //         role = $localize`:@@Opettaja:Opettaja`;
  //         break;
  //       }
  //       case 'admin': {
  //         role = $localize`:@@Admin:Järjestelmävalvoja`;
  //         break;
  //       }
  //       default: {
  //         this.userRole = '';
  //       }
  //     }
  //       this.userRole = role.charAt(0).toUpperCase() + role.slice(1);
  //   })
  // }

  // public changeLanguage(language: 'en-US' | 'fi-FI') {
  //   this.language = language;
  // }


  public toggleLanguage() {
    console.log(' --- kieli: ' + this.language);
    this.language = (this._language === 'fi-FI') ? 'en-US' : 'fi-FI';
  }


  public goToFrontPage() {
    if (this.authService.getIsUserLoggedIn() == true) {
      const courseID = this.ticketService.getActiveCourse();
      this.router.navigateByUrl('/list-tickets?courseID=' + courseID);
    }
  }

  public login(): void{
    this.authService.handleNotLoggedIn();
  }

  public logOut() {
    this.authService.logOut();
    this.authService.sendAskLoginRequest('own').then((response: any) => {
      console.log(' headerComponent: saatiin vastaus: ' + JSON.stringify(response));
        this.router.navigateByUrl(response);
    }).catch (error => {
      console.error('headerComponent: Virhe uloskirjautuessa: ' + error);
    })
  }

}
