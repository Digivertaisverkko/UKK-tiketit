import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs';

import { AuthService } from '@core/auth.service';
import { InvitedInfo } from '@course/course.models'; 
import { StoreService } from '@core/store.service';
import { stringsMatchValidator } from '@shared/directives/strings-match.directive';
import { CourseService } from '@course/course.service';
// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent implements OnInit{

  @Input() invitation: string = '';
  @Input() courseid: string = '';
  public form: FormGroup;
  public errorMessage: string = '';
  public invitedInfo: InvitedInfo | undefined;
  public isLoggedIn: boolean | null | undefined;

  constructor(private auth: AuthService,
              private courses: CourseService,
              private formBuilder: FormBuilder,
              private router: Router,
              private store: StoreService
              ) {
    this.form = this.buildForm()
  }

  ngOnInit(): void {
    this.getInvitedInfo(this.courseid, this.invitation);
    this.trackLoggedStatus();
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
      email: [{
        value: '',
        disabled: true
      }],
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
    }
    );
  }

  private getInvitedInfo(courseid: string, invitation: string) {
    this.courses.getInvitedInfo(courseid, invitation).then(res => {
      if (res.sposti != null) {
        console.log('sposti: ' + res.sposti);
        this.email.setValue(res.sposti);
      }
    }).catch(err => {
      console.error('Tietojen haku ei onnistunut.');
    })
  }

  public submit() {
    this.errorMessage = '';
    const email = this.form.controls['email'].value;
    const password = this.form.controls['password'].value;
    this.auth.createAccount(email, password, this.invitation).then(res => {
    if (res?.success === true) {
      if (this.isLoggedIn) {
        this.auth.logout(this.courseid);
      } else {
        this.auth.navigateToLogin(this.courseid);
      }
    } else {
      this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
    }
    }).catch (error => {
      this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
    });
  }

  private trackLoggedStatus(): void {
    this.store.onIsUserLoggedIn().pipe(
      takeWhile((res) => res !== undefined)
    ).subscribe(res => {
      console.log('logged: ' + res);
      this.isLoggedIn = res;
    });
  }

}
