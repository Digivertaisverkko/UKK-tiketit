import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
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
  public isUserLoggedIn: Boolean = false;
  public isPhonePortrait = false;
  public productName: string = environment.productName;
  public maxUserLength = 10;
  public userRole: string = '';
  public userName: string = '';
  public userEmail: string = '';

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

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private responsive: BreakpointObserver,
    private router: Router,
    private ticketService: TicketService)
    {
    this.isUserLoggedIn$ = this.authService.onIsUserLoggedIn();
    this._language = localStorage.getItem('language') ?? 'fi-FI';
  }

  ngOnInit(): void {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.isPhonePortrait = false;
      if (result.matches) {
        this.isPhonePortrait = true;
      }
    });
    this.updateUserRole();
    this.updateUserName();
    this.updateUserEmail();
  }

  updateUserName() {
    this.authService.onGetUserName().subscribe(response => {
        if (response.length > 0 ) {
          this.userName = response.charAt(0).toUpperCase() + response.slice(1) + ',';
        } else {
          this.userName = '';
        }
    })
  }

  updateUserEmail() {
    this.authService.onGetUserEmail().subscribe(response => {
        if (response.length > 0 ) {
          this.userEmail = response + ', ';
        } else {
          this.userEmail = '';
        }
    })
  }

  updateUserRole() {
    this.authService.onGetUserRole().subscribe(response => {
      let role: string = '';
      switch (response) {
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
      }
        this.userRole = role.charAt(0).toUpperCase() + role.slice(1);
    })
  }

  public changeLanguage(language: 'en-US' | 'fi-FI') {
    this.language = language;
  }


  public goToFrontPage() {
    if (this.authService.getIsUserLoggedIn() == true) {
      const courseID = this.ticketService.getActiveCourse();
      this.router.navigateByUrl('/list-tickets?courseID=' + courseID);
    }
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
