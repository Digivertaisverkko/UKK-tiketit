import { Component, OnInit } from '@angular/core';

// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent implements OnInit {

  public email: string;
  public username: string;
  public newPassword: string;
  public repassword: string;
  public minPasswordLength: number = 8;

  constructor() {
    this.email = '';
    this.username = '';
    this.newPassword  = '';
    this.repassword = '';
  }

  ngOnInit(): void {
  }

}
