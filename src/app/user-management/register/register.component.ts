import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, takeWhile } from 'rxjs';

import { AuthService } from '@core/auth.service';
import { InvitedInfo } from '@course/course.models'; 
import { StoreService } from '@core/store.service';
import { stringsMatchValidator } from '@shared/directives/strings-match.directive';
import { CourseService } from '@course/course.service';
import { LoginInfo } from '@core/core.models';
// Shares same view with Login screen so they share same styleUrl.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy{

  @Input() invitation: string = '';
  @Input() courseid: string = '';
  public form: FormGroup;
  public errorMessage: string = '';
  public invitedInfo: InvitedInfo | undefined;
  public isLoggedIn$: Subscription | null = null;
  public isLoggedIn: boolean | null | undefined;

  constructor(private auth: AuthService,
              private courses: CourseService,
              private formBuilder: FormBuilder,
              private router: Router,
              private store: StoreService
              ) {
    this.form = this.buildForm()
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

  ngOnInit(): void {
    this.trackLoggedStatus();
    this.courses.getInvitedInfo(this.courseid, this.invitation).then(res => {
      console.log('saatiin vastaus: ' + JSON.stringify(res));
      if (res.id != null) {
        window.localStorage.removeItem('redirectUrl');
        if (this.isLoggedIn) this.auth.logout();
        this.invitedInfo = res;
      }
      if (res.sposti != null) {
        console.log('sposti: ' + res.sposti);
        this.email.setValue(res.sposti);
      }
    }).catch(err => {
      console.error('Tietojen haku ei onnistunut.');
    })
  }

  ngOnDestroy(): void {
    this.isLoggedIn$?.unsubscribe();
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

  public submit() {
    this.errorMessage = '';
    const email = this.form.controls['email'].value;
    const password = this.form.controls['password'].value;
    this.auth.createAccount(email, password, this.invitation).then(res => {
      if (res?.success === true) {
        return;
      } else {
        this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
        throw Error;
      }
    }).then(() => {
      return this.auth.getLoginInfo('own', this.courseid);
    }).then((res: LoginInfo) => {
      const loginID = res['login-id'];
      return this.auth.login(email, password, loginID);
    }).then (res => {
      if (res?.success === true) {
        const route = 'course/' + this.courseid + '/list-tickets';
        this.router.navigateByUrl(route);
      }
    })
    .catch (error => {
      this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
    });
  }

  private trackLoggedStatus(): void {
    this.isLoggedIn$ = this.store.onIsUserLoggedIn().subscribe(res => {
      console.log('logged: ' + res);
      this.isLoggedIn = res;
      if (res === true && this.invitedInfo) {
        this.auth.logout();
      }
    });
  }

}
