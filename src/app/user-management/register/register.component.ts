
import { AuthService } from '@core/auth.service';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';

// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {

  public form: FormGroup;
  public serverMessage: string = '';

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder
              )
  {
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
      validators: [
        this.matchPassword(this.password, this.repassword)
      ]
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

  public registerUser() {
    const email = this.form.controls['email'].value;
    const password = this.form.controls['password'].value;
    this.auth.addUser(email, password).then(isSuccesful => {
    }).catch (error => {

    });
  }

}
