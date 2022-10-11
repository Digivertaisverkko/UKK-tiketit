import { Component, OnInit } from '@angular/core';

import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';

import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = '';
  public password: string = '';
  isPhonePortrait = false;
  private loginID: string = '';
  private isEmailValid: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private responsive: BreakpointObserver,
    private authService: AuthService,
  ) {
  }

  ngOnInit(): void {
  
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.isPhonePortrait = false; 
      if (result.matches) {
        this.isPhonePortrait = true;
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      console.log('LoginComponent:');
      console.dir(params);

      try {
        if (params['loginid'].length > 0) {
          this.loginID = params['loginid'];
          console.log('loginComponent: set loginID: ' + this.loginID);
        }
      } catch (error: any) {
        console.error(error);
        console.error('No loginID found in URL. Aborting authentication.');
      }
      
    })

  }

  getIsEmailValid(): boolean {
    console.log(this.isEmailValid);
    return this.isEmailValid;
  }

  validateEmail() {
    return String(this.email)
      .toLowerCase()
      .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  }

  login() {
    console.log(' email ' + this.email);
    console.log('password ' + this.password);
    console.log(' login id: ' + this.loginID);
  }

  loginWithoutAuth() {
    this.router.navigateByUrl('/test/testing');
  }

}
