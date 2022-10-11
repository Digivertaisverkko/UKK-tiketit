import { Component, OnInit } from '@angular/core';

import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string;
  public password: string;
  public repassword: string;
  isPhonePortrait = false;

  constructor(
    public router: Router,
    private responsive: BreakpointObserver,
    private authService: AuthService
  ) {
    this.email = '';
    this.password  = '';
    this.repassword = '';
  }

  ngOnInit(): void {
  
    this.responsive.observe(Breakpoints.HandsetPortrait)
    .subscribe(result => {
      this.isPhonePortrait = false; 
      if (result.matches) {
        this.isPhonePortrait = true;
      }
    });

  }

  login() {
    console.log('Not implemented yet.')
  }

  loginWithoutAuth() {
    this.router.navigateByUrl('/test/testing');
  }

}
