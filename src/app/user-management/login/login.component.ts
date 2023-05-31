import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth.service';
import { Constants, isValidEmail } from '@shared/utils';
import { StoreService } from '@core/store.service';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit, AfterViewInit {
  public courseID: string | null = this.route.snapshot.paramMap.get('courseid');
  public email: string = '';
  public errorMessage: string = '';
  public isEmailValid: boolean = false;
  public isLoginRemembered: boolean = false;
  public lang: string | null = localStorage.getItem('language');
  public password: string = '';
  private loginID: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private store: StoreService,
    private titleServ: Title
  ) {
  }

  // release -branch

  ngOnInit(): void {
    this.titleServ.setTitle(Constants.baseTitle +
        $localize `:@@Sisäänkirjautuminen:Sisäänkirjautuminen`);
    this.setLoginID();
    this.store.setUserInfo(null);
    if (this.courseID === null) {
      console.error('Ei kurssi ID:ä URL:ssa, käytetään oletuksena 1:stä.');
    }
  }

  // Jos tullaan näkymistä tänne, virheilmoituksia voidaa näyttää, jos
  // nämä asetetaan aiemmin.
  ngAfterViewInit(): void {
    this.store.setNotLoggegIn();
    this.store.setParticipant(null);
  }

  public login(): void {
    // this.isEmailValid = this.validateEmail(this.email);
    // Lisää ensin custom ErrorStateMatcher
    // console.log('login id: ' + this.loginID);
    this.authService.sendLoginRequest(this.email, this.password, this.loginID)
      .then(response => {
        if (response?.success == true) {
          var redirectUrl: string;
          if (response.redirectUrl == undefined) {
            // TODO: Yritä session storagesta etsiä tallennettua?
            redirectUrl = 'course/' + this.courseID +  '/list-tickets';
          } else {
            redirectUrl = response.redirectUrl;
          }
          this.router.navigateByUrl(redirectUrl);
        }
      })
      .catch(error => this.handleError(error));
  }

  private handleError (error: any) {
    switch (error?.tunnus) {
      case 1001:
        this.errorMessage = $localize`:@@Kirjautumispalveluun ei saatu yhteyttä:
            Kirjautumispalveluun ei saatu yhteyttä` + '.'
        break;
      case 1002:
        this.errorMessage = $localize`:@@Väärä käyttäjätunnus tai salasana:
            Virheellinen käyttäjätunnus tai salasana` + '.'
        break;
      case 1003:
        this.errorMessage = $localize`:@@Ei oikeuksia:
            Ei ole tarvittavia käyttäjäoikeuksia` + '.';
        break;
      default:
        this.errorMessage = $localize`:@@Kirjautuminen ei onnistunut:
            Kirjautuminen ei onnistunut` + '.';
    }
  }

  private setLoginID() {
    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['loginid'] !== undefined) {
          this.loginID = params['loginid'];
        }
      }, error: () => {}
    });
  }

  // TODO: ota käyttöön, kun tunnukset ovat emaileja.
  // private getIsEmailValid(email: string): boolean {
  //   return isValidEmail(email);
  // }


}
