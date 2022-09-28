import { Component, OnInit } from '@angular/core';

import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string;
  public password: string;
  public repassword: string;
  public loginMethod: string;
  isPhonePortrait = false;

  constructor(
    public router: Router,
    private responsive: BreakpointObserver
  ) {
    this.email = '';
    this.password  = '';
    this.repassword = '';
    this.loginMethod = '';
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
    this.loginMethod = 'own';
    this.router.navigateByUrl('/test/testing');
  }

}
