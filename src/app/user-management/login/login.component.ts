import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { Subscription } from 'rxjs';
// import { environment } from 'src/environments/environment';
// import { ForwardRefHandling } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public courseID: number = 1;
  public email: string = '';
  public isEmailValid: boolean = false;
  private loginID: string = '';
  public password: string = '';
  public readonly passwordMinLength: number = 8;
  public serverErrorMessage: string = '';
  messageSubscription: Subscription;
  public tabIndex: number = 0;
  public isLoginRemembered: boolean = false;


  public lang: string | null = localStorage.getItem('language');

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.messageSubscription = this.authService
      .onErrorMessages()
      .subscribe((message) => {
        if (message) {
          this.serverErrorMessage = message;
        } else {
          // Poista viestit, jos saadaan tyhjä viesti.
          this.serverErrorMessage = '';
        }
      });

      // this.authService.onIsUserLoggedIn().subscribe(isLoggedIn => {
      //   if (isLoggedIn === true) {
      //     if
      //     this.router.navigateByUrl('/list-tickets?courseID=' + this.courseID);
      //   }
      // })
  }

  ngOnInit(): void {
    this.setLoginID();
  }

  // Uuden tilin luonnin jälkeen.
  public makeTabActive(event: any) {
    this.tabIndex = 0;
  }

  public login(): void {
    this.isEmailValid = this.validateEmail(this.email);
    console.log('email validation: ' + this.isEmailValid);
    console.log(typeof this.isEmailValid);
    // Lisää ensin custom ErrorStateMatcher
    // if (this.isEmailValid === false) return;
    // console.log('LoginComponent: login request info:');
    // console.log('email ' + this.email);
    // console.log('password ' + this.password);
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
      .catch( error => {
    console.error(error.message)});
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

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }
}
