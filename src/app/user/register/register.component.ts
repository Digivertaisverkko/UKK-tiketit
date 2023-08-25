import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, takeWhile } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@core/services/auth.service';
import { InvitedInfo } from '@course/course.models';
import { StoreService } from '@core/services/store.service';
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

  @Input() courseid!: string;
  @Input() invitation: string = '';
  public courseName: string = '';
  public form: FormGroup;
  public errorMessage: string = '';
  public invitedInfo: InvitedInfo | undefined;
  public isLoggedIn$: Subscription | null = null;
  public isLoggedIn: boolean | null | undefined;

  constructor(private auth : AuthService,
              private courses: CourseService,
              private formBuilder: FormBuilder,
              private router: Router,
              private store : StoreService,
              private title: Title,
              ) {
    this.form = this.buildForm()
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl
  }

  get name(): FormControl {
    return this.form.get('name') as FormControl
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
      if (res === null) {
        throw Error('URL:in mukaisesta kutsusta ei löytynyt tietoja.')
      }
      if (res.id != null) {
        window.localStorage.removeItem('redirectUrl');
        if (this.isLoggedIn) this.auth.logout();
        this.invitedInfo = res;
        this.getCourseName(this.invitedInfo.kurssi);
      }
      if (res.sposti != null) {
        this.email.setValue(res.sposti);
      }
    }).catch(err => {
      this.errorMessage = $localize `:@@Kutsun tietojen haku epäonnistui:Antamallasi URL-osoitteella ei löytynyt kutsun tietoja. Tarkista, että osoite on oikea. Kutsu voi olla myös vanhentunut.`;
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
      name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ])
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ])
      ],
      repassword: [
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

  private getCourseName(courseid: string) {
    this.courses.getCourseName(courseid).then(response => {
      this.courseName = response ?? '';
      this.title.setTitle(this.store.getBaseTitle() + $localize `:@@Luo käyttäjätili kurssille:
          Luo käyttäjätili kurssille` + this.courseName);
    }).catch((response) => {
    });
  }

  public submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.errorMessage = '';
    const email = this.form.controls['email'].value;
    const name = this.form.controls['name'].value;
    const password = this.form.controls['password'].value;
    this.auth.createAccount(name, email, password, this.invitation).then(res => {
      if (res?.success === true) {
        console.log('luonti onnistui');
        return;
      } else {
        this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
        throw Error;
      }
    }).then(() => {
      return this.auth.getLoginInfo('own', this.courseid);
    }).then((res: LoginInfo) => {
      const loginID = res['login-id'];
      this.isLoggedIn$?.unsubscribe();
      return this.auth.login(email, password, loginID);
    }).then (res => {
      if (res?.success === true) {
        const route = 'course/' + this.courseid + '/list-tickets';
        const data = { message: 'account created' };
        this.router.navigate([route], { state: data });
      }
    })
    .catch (() => {
      this.errorMessage = $localize `:@@Tilin luominen ei onnistunut:Tilin luominen ei onnistunut.`;
    });
  }

  private trackLoggedStatus(): void {
    this.isLoggedIn$ = this.store.onIsUserLoggedIn().pipe(
      takeWhile(() => this.isLoggedIn === undefined, true)
    ).subscribe(res => {
      this.isLoggedIn = res;
      // Jos kutsun tietojen haku on onnistunut ja voidaan jatkaa.
      if (this.isLoggedIn === true && this.invitedInfo) {
        this.auth.logout();
      }
    });
  }

}
