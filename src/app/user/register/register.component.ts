
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@core/services/auth.service';
import { CourseService } from '@course/course.service';
import { InvitedInfo } from '@course/course.models';
import { LoginInfo } from '@core/core.models';
import { PrivacyModalComponent } from '@core/footer/privacy-modal/privacy-modal.component';
import { StoreService } from '@core/services/store.service';
import { User } from '@core/core.models';
import { stringsMatchValidator } from '@shared/directives/strings-match.directive';

/**
 * Näkymä, jossa uusi käyttäjä pystyy luomaan käyttäjätilin. Käyttäjä on saanut
 * osoitteen tähän näkymään sähköpostilla. Jo olemassa olevan käyttäjätilin
 * liittäminen kurssilel tapahtuu join -komponentilla.
 *
 * @export
 * @class RegisterComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */

// ! Käyttää login-komponentin tyylitiedostoa.
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})

export class RegisterComponent implements OnInit {

  @Input() courseid!: string;
  @Input() invitation: string = '';
  public courseName: string = '';
  public form: FormGroup;
  public errorMessage: string = '';
  public invitedInfo: InvitedInfo | undefined;
  public user: User | null | undefined;
  /* Jos kutsusta ei saada tarvittavia tietoja eli rekisteröiminen ei ole
  mahdollista, käytetään error-tilaa. Silloin ei näytetä lomaketta. */
  public state: 'editing' | 'error' = 'editing';

  constructor(private auth : AuthService,
              private courses: CourseService,
              public dialog: MatDialog,
              private formBuilder: FormBuilder,
              private store : StoreService,
              private title: Title,
              public router: Router,
              ) {
    this.form = this.buildForm()
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl
  }

  get isAcceptingDataConsent(): FormControl {
    return this.form.get('isAcceptingDataConsent') as FormControl
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
    this.trackUserInfo();

    /**
     * Hae kutsun tiedot. Jos saadaan haettua ja ollaan kirjauduttu,
     * kirjaudutaan ulos.
     */
    this.courses.getInvitedInfo(this.courseid, this.invitation).then(res => {
      if (res === null || res?.id === null) {
        throw Error('URL:in mukaisesta kutsusta ei löytynyt tietoja.')
      }
      window.localStorage.removeItem('redirectUrl');
      if (this.user != null) this.auth.logout();
      // if (this.isLoggedIn) this.auth.logout();
      this.invitedInfo = res;
      if (res.sposti != null) {
        this.email.setValue(res.sposti);
      }
      return this.courses.getCourseName(this.courseid)
    }).then(response => {
      this.courseName = response ?? '';
      this.title.setTitle(this.store.getBaseTitle() + $localize `:@@Luo käyttäjätili kurssille:
          Luo käyttäjätili kurssille` + ' ' + this.courseName);
    }).catch(err => {
      this.state = 'error';
      this.errorMessage = $localize `:@@Kutsun tietojen haku epäonnistui:Antamallasi URL-osoitteella ei löytynyt kutsun tietoja. Tarkista, että osoite on oikea. Kutsu voi olla myös vanhentunut.`;
    })
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
      ],
      isAcceptingDataConsent: [
        null,
        Validators.compose([
          Validators.requiredTrue
        ])
      ]
    }, {
      validators: [ stringsMatchValidator('password', 'repassword') ]
    }
    );
  }

  public openPrivacyModal(event: Event) {
    event.stopPropagation();
    this.dialog.open(PrivacyModalComponent);
  }

  public privacyLinkPressed(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Space') {
      this.dialog.open(PrivacyModalComponent);
    }
  }

  public submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      console.error('Form is invalid.');
      return
    }
    this.errorMessage = '';
    const email = this.form.controls['email'].value;
    const name = this.form.controls['name'].value;
    const password = this.form.controls['password'].value;
    this.auth.createAccount(name, email, password, this.invitation).then(res => {
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
      // this.isLoggedIn$?.unsubscribe();
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

  /**
   * Hae käyttäjätiedot. Jos käyttäjä on kirjautunut ja kutsutiedot on
   * saatu haettua, kirjaudu ulos.
   */
  private trackUserInfo() {
    this.store.trackUserInfo().pipe(
      takeWhile(() => this.user === undefined)
      ).subscribe(res => {
      if (res !== undefined) {
        this.user = res;
      }
      if (res === null || res === undefined) return
      if (this.invitedInfo) {
        this.auth.logout();
      }
    });
  }

}
