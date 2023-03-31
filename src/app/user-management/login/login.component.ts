import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { Constants } from '../../shared/utils';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  public courseID: string | null = this.route.snapshot.paramMap.get('courseid');
  public email: string = '';
  public errorMessage: string = '';
  public isEmailValid: boolean = false;
  public isLoginRemembered: boolean = false;
  public lang: string | null = localStorage.getItem('language');
  public password: string = '';
  private loginID: string = '';
  public readonly passwordMinLength: number = 8;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private titleServ: Title
  ) {
  }

  ngOnInit(): void {
    this.titleServ.setTitle(Constants.baseTitle +
        $localize `:@@Sisäänkirjautuminen:Sisäänkirjautuminen`);
    this.setLoginID();
    if (this.courseID === null) {
      console.warn('Ei kurssi ID:ä URL:ssa, käytetään oletuksena 1:stä.');
      this.courseID = '1';
    } else {
    console.warn('saatiin course id: ' + this.courseID);
    }
  }

  public login(): void {
    this.isEmailValid = this.validateEmail(this.email);
    // Lisää ensin custom ErrorStateMatcher
    // console.log('login id: ' + this.loginID);
    this.authService.sendLoginRequest(this.email, this.password, this.loginID)
      .then(response => {
        if (response?.success == true) {
          var redirectUrl: string;
          if (response.redirectUrl == undefined) {
            // redirectUrl = '/kurssi/' + this.courseID + '/list-tickets?courseID=' + this.courseID;
            // TODO: Yritä session storagesta etsiä tallennettua?
            // redirectUrl = '/list-tickets?courseID=' + this.courseID;
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
        this.errorMessage = $localize`:@@Kirjautumispalveluun ei saatu yhteyttä:Kirjautumispalveluun ei saatu yhteyttä` + '.'
        break;
      case 1002:
        this.errorMessage = $localize`:@@Väärä käyttäjätunnus tai salasana:Virheellinen käyttäjätunnus tai salasana` + '.'
        break;
      case 1003:
        this.errorMessage = $localize`:@@Ei oikeuksia:Ei ole tarvittavia käyttäjäoikeuksia` + '.';
        break;
      default:
        this.errorMessage = $localize`:@@Kirjautuminen ei onnistunut:Kirjautuminen ei onnistunut` + '.';
    }
  }

  private setLoginID() {
    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['loginid'] !== undefined) {
          this.loginID = params['loginid'];
          //console.log('loginComponent: asetettiin loginID: ' + this.loginID);
        }
      },
      error: () => {}
    });
  }

  // TODO: ota käyttöön, kun tunnukset ovat emaileja.
  private getIsEmailValid(): boolean {
    console.log(this.isEmailValid);
    return this.isEmailValid;
  }

  private validateEmail(email: string): boolean {
    let validationString = new String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    return validationString == null ? false : true;
  }
}
