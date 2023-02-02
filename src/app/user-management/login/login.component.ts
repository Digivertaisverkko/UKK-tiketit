import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
// import { environment } from 'src/environments/environment';
// import { ForwardRefHandling } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public courseID: number = 1;
  public email: string = '';
  public isEmailValid: boolean = false;
  private loginID: string = '';
  public password: string = '';
  public readonly passwordMinLength: number = 8;
  public errorMessage: string = '';
  public isLoginRemembered: boolean = false;
  public lang: string | null = localStorage.getItem('language');

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.setLoginID();
  }

  public login(): void {
    this.isEmailValid = this.validateEmail(this.email);
    // Lisää ensin custom ErrorStateMatcher
    console.log('login id: ' + this.loginID);
    this.authService.sendLoginRequest(this.email, this.password, this.loginID)
      .then(response => {
        if (response.success == true) {
          var redirectUrl: string;
          if (response.redirectUrl == undefined) {
            redirectUrl = '/list-tickets?courseID=' + this.courseID;
          } else {
            redirectUrl = response.redirectUrl;
          }
          this.router.navigateByUrl(redirectUrl);
        }
      })
      .catch(error => {
        switch (error?.tunnus) {
          case 1001:
            this.errorMessage = $localize`:@@Kirjautumispalveluun ei saatu yhteyttä:Kirjautumispalveluun ei saatu yhteyttä` + '.'; break;
          case 1002:
            this.errorMessage = $localize`:@@Väärä käyttäjätunnus tai salasana:Virheellinen käyttäjätunnus tai salasana` + '.'; break;
          case 1003:
            this.errorMessage = $localize`:@@Ei oikeuksia:Ei ole tarvittavia käyttäjäoikeuksia` + '.'; break;
          default:
            this.errorMessage = $localize`:@@Kirjautuminen ei onnistunut:Kirjautuminen ei onnistunut` + '.'; break;
        }
      });
  }

  private setLoginID() {
    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        if (params['loginid'] !== undefined) {
          this.loginID = params['loginid'];
          //console.log('loginComponent: asetettiin loginID: ' + this.loginID);
        }
      },
      error: (error) => {
        console.error(error);
      }
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
