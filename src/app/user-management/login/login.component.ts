import { Component, OnInit } from '@angular/core';

import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isPhonePortrait = false;

  constructor(
    public router: Router,
    private responsive: BreakpointObserver
  ) { }

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
    this.router.navigateByUrl('/test/testing');
  }

}
