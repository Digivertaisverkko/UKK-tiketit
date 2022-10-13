import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = '';
  public isEmailValid: boolean = false;
  public isPhonePortrait = false;
  private loginID: string = '';
  public password: string = '';
  public serviceErrorMessages: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private responsive: BreakpointObserver,
    private router: Router,
  ) {
  }

  // release -branch

  ngOnInit(): void {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.isPhonePortrait = false; 
      if (result.matches) {
        this.isPhonePortrait = true;
      }
    });
    this.setLoginID();
  }

  private setLoginID() {
    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        console.log('LoginComponent:');
        console.dir(params);
        if (params['loginid'] == '') {
          console.error('No loginID found in URL. Aborting authentication.');
        };
        this.loginID = params['loginid'];
        console.log('loginComponent: set loginID: ' + this.loginID);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  public login(): void {
    console.log('LoginComponent: login request info:');
    console.log('email ' + this.email);
    console.log('password ' + this.password);
    console.log('login id: ' + this.loginID);
    let isEmailValid = this.validateEmail(this.email);
    console.log('email validation: ' + isEmailValid);
    this.authService.sendLoginRequest(this.email, this.password, this.loginID).then(response => {
      console.log('loginComponent: Got login response: ');
      console.dir(response);
    });
    
  }

  public loginWithoutAuth(): void {
    this.router.navigateByUrl('/test/testing');
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
    return ( validationString == null ) ? false : true;
  }

}
