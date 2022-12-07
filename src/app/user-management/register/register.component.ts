import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Output, EventEmitter} from '@angular/core';

// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {

  @Output() event = new EventEmitter<boolean>();

  public email: string;
  public newPassword: string;
  public repassword: string;
  public minPasswordLength: number = 8;
  public messageSub: Subscription;
  public serverMessage: string = '';

  constructor(private auth: AuthService,
    private _snackBar: MatSnackBar)
  {
    this.email = '';
    this.newPassword  = '';
    this.repassword = '';
    this.messageSub = this.auth.onErrorMessages().subscribe(message => {
      if (message) {
        this.serverMessage = message;
      } else {
        // Poista viestit, jos saadaan tyhjä viesti.
        this.serverMessage = '';
      }
    })
  }

  changeActiveTab() {
    this.event.emit(true);
  }

  register() {
    this.auth.addUser(this.email, this.newPassword).then(isSuccesful => {
      if (isSuccesful) {
        this.clearScreen();
        this.event.emit(true);
      }
    }).catch (error => {
      console.error(error.message);
    });
  }

  private clearScreen() {
    this.email = '';
    this.newPassword  = '';
    this.repassword = '';
    this.auth.clearMessages();
  }

}
