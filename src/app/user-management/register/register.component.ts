import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {

  public email: string;
  public newPassword: string;
  public repassword: string;
  public minPasswordLength: number = 8;
  public messageSub: Subscription;

  constructor(private auth: AuthService,
    private _snackBar: MatSnackBar)
  {
    this.email = '';
    this.newPassword  = '';
    this.repassword = '';
    this.messageSub = this.auth.onErrorMessages().subscribe(message => {
      this._snackBar.open(message, 'OK')
    })
  }

  register() {
    this.auth.addUser(this.email, this.newPassword).then(isSuccesful => {
      if (isSuccesful) {
        // ohjaa login tabiin.
      }
    });
  }

}
