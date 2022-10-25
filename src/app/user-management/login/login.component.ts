import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
// import { environment } from 'src/environments/environment';
// import { ForwardRefHandling } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // title = environment.productName + "- Kirjautuminen";
  public email: string = '';
  public isEmailValid: boolean = false;
  public isPhonePortrait = false;
  private loginID: string = '';
  public password: string = '';
  public readonly passwordMinLength: number = 3;
  public serverErrorMessage: string = '';
  messageSubscription: Subscription;
  private authSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private responsive: BreakpointObserver,
    private router: Router
  ) {
    this.messageSubscription = this.authService
      .onErrorMessages()
      .subscribe((message) => {
        if (message) {
          console.log('Got message ' + message);
          this.serverErrorMessage = message;
        } else {
          // Poista viestit, jos saadaan tyhjä viesti.
          this.serverErrorMessage = '';
        }
      });
      this.authSubscription = this.authService.onIsUserLoggedIn().subscribe(isLoggedIn => {
        if (isLoggedIn === true) {
          this.router.navigateByUrl('/front');
        }
      })
  }

  ngOnInit(): void {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe((result) => {
      this.isPhonePortrait = false;
      if (result.matches) {
        this.isPhonePortrait = true;
      }
    });
    this.setLoginID();
  }

  public login(): void {
    this.isEmailValid = this.validateEmail(this.email);
    console.log('email validation: ' + this.isEmailValid);
    console.log(typeof this.isEmailValid);
    // Lisää ensin custom ErrorStateMatcher
    // if (this.isEmailValid === false) return;
    console.log('LoginComponent: login request info:');
    console.log('email ' + this.email);
    console.log('password ' + this.password);
    console.log('login id: ' + this.loginID);
    this.authService.sendLoginRequest(this.email, this.password, this.loginID);
  }

  public loginWithoutAuth(): void {
    this.authService.saveSessionStatus('123456789');
    this.authService.isUserLoggedIn$.next(true);
    this.router.navigateByUrl('/front');
  }

  private setLoginID() {
    console.log('--- ajetaan setLoginID ---');
    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        // console.log('LoginComponent:');
        // console.dir(params);
        if (params['loginid'] == '') {
          console.error('No loginID found in URL. Aborting authentication.');
        }
        this.loginID = params['loginid'];
        console.log('loginComponent: asetettiin loginID: ' + this.loginID);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

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
    this.messageSubscription.unsubscribe;
  }
}
