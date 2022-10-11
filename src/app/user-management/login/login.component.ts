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

  public email: string;
  public password: string;
  public repassword: string;
  isPhonePortrait = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
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

    this.activatedRoute.queryParams.subscribe(params => {
      console.log('LoginComponent:');
      console.dir(params);
    })

  }

  login() {
    console.log('Not implemented yet.')
  }

  loginWithoutAuth() {
    this.router.navigateByUrl('/test/testing');
  }

}
