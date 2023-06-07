import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators }
from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '@core/auth.service';
import { stringsMatchValidator } from '@shared/directives/strings-match.directive';
// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {

  @Input() invitation: string = '';
  @Input() courseid: string = '';
  public form: FormGroup;
  public errorMessage: string = '';

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder,
              private router: Router
              ) {
    this.form = this.buildForm();
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl
  }

  get repassword(): FormControl {
    return this.form.get('repassword') as FormControl
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ])],
      password:  [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ])
      ],
      repassword:  [
        '',
        Validators.compose([
          Validators.required
        ])
      ]
    }, {
      validators: [ stringsMatchValidator('password', 'repassword') ]
    });
  }

  public matchPassword(passwordCtrl: AbstractControl, repasswordCtrl: AbstractControl):
      { [key: string]: boolean } | null {
    const password = passwordCtrl.value;
    const repassword = repasswordCtrl.value;
    if (password && repassword && password !== repassword) {
      return { mismatch: true };
    }
    return null;
  }

  public submit() {
    this.errorMessage = '';
    const email = this.form.controls['email'].value;
    const password = this.form.controls['password'].value;
    this.auth.createAccount(email, password, this.invitation).then(res => {
    if (res?.success === true) {
      this.auth.navigateToLogin(this.courseid);
    } else {
      this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
    }
    }).catch (error => {
      this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
    });
  }

}
