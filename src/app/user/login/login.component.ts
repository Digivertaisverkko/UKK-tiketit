import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { getIsInIframe } from '@shared/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit, AfterViewInit {
  @Input() courseid: string | undefined;
  @Input() loginid: string | undefined;

  public errorMessage: string = '';
  public form: FormGroup = this.buildForm();

  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder,
              private router: Router,
              private store: StoreService,
              private title: Title)
  {}

  ngOnInit(): void {
    if (!this.loginid && !getIsInIframe() && this.courseid) {
      // Hakee loginid:n.
      this.auth.navigateToLogin(this.courseid);
    }
    this.title.setTitle(this.store.getBaseTitle() +
        $localize `:@@Sisäänkirjautuminen:Sisäänkirjautuminen`);
    this.store.setUserInfo(null);
  }

  // Jos tullaan näkymistä tänne, virheilmoituksia voidaa näyttää, jos nämä
  // asetetaan aiemmin.
  ngAfterViewInit(): void {
    this.store.setNotLoggegIn();
    this.store.setParticipant(null);
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      email: [
        '',
        Validators.compose([
          //Validators.email, TODO: kun loginit on emaileja, niin uncomment
          Validators.required
        ])
      ],
      password: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
    });
  }

  private handleError (error: any) {
    switch (error?.tunnus) {
      case 1001:
        this.errorMessage = $localize`:@@Kirjautumispalveluun ei saatu yhteyttä:
            Kirjautumispalveluun ei saatu yhteyttä` + '.'
        break;
      case 1002:
        this.errorMessage = $localize`:@@Väärä käyttäjätunnus tai salasana:
            Virheellinen käyttäjätunnus tai salasana` + '.'
        break;
      case 1003:
        this.errorMessage = $localize`:@@Ei oikeuksia:
            Ei ole tarvittavia käyttäjäoikeuksia` + '.';
        break;
      default:
        this.errorMessage = $localize`:@@Kirjautuminen ei onnistunut:
            Kirjautuminen ei onnistunut` + '.';
    }
  }

  public login(): void {
    if (!this.loginid) throw new Error('Login ID puuttuu URL:sta.');
    if (this.form.invalid) return;

    // disabloidaan lomake odotellessa
    this.form.disable();

    const email = this.form.controls['email'].value;
    const password = this.form.controls['password'].value;

    this.auth.login(email, password, this.loginid)
    .then(response => {
      if (response?.success === true) {
        let redirectUrl: string;
        if (response.redirectUrl === undefined) {
          // TODO: Yritä session storagesta etsiä tallennettua?
          redirectUrl = 'course/' + this.courseid +  '/list-tickets';
        } else {
          redirectUrl = response.redirectUrl;
        }
        this.router.navigateByUrl(redirectUrl);
      }
    })
    .catch(error => {
      this.handleError(error);
    });

    this.form.enable();
  }

}
