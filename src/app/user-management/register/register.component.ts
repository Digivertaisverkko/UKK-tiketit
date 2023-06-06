
import { AuthService } from '@core/auth.service';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';

// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {

  public form: FormGroup = this.buildForm();
  public newPassword: string;
  public repassword: string;
  public minPasswordLength: number = 8;
  public serverMessage: string = '';

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder
              )
  {
    this.newPassword  = '';
    this.repassword = '';
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ])]
    })
  }

  public registerUser() {
    const email = this.form.controls['email'].value;
    this.auth.addUser(email, this.newPassword).then(isSuccesful => {
    }).catch (error => {

    });
  }

}
