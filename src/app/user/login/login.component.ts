import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
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
  @Input() courseid: string | null = null;
  @Input() loginid: string | null = null;
  public email: string = '';
  public errorMessage: string = '';
  private loginID: string = '';
  public password: string = '';

  constructor(private auth: AuthService,
              private router: Router,
              private store: StoreService,
              private title: Title)
  {}

  ngOnInit(): void {
    if (!this.loginid && !getIsInIframe()) {
      this.auth.navigateToLogin(this.courseid);
    }
    this.title.setTitle(this.store.getBaseTitle() +
        $localize `:@@Sisäänkirjautuminen:Sisäänkirjautuminen`);
    this.store.setUserInfo(null);
    if (this.courseid === null) {
      console.error('Ei kurssi ID:ä URL:ssa, käytetään oletuksena 1:stä.');
    }
  }

  // Jos tullaan näkymistä tänne, virheilmoituksia voidaa näyttää, jos nämä
  // asetetaan aiemmin.
  ngAfterViewInit(): void {
    this.store.setNotLoggegIn();
    this.store.setParticipant(null);
  }

  public login(): void {
    if (!this.loginid) return
    // this.isEmailValid = this.validateEmail(this.email);
    // Lisää ensin custom ErrorStateMatcher
    // console.log('login id: ' + this.loginID);
    this.auth.login(this.email, this.password, this.loginid)
      .then(response => {
        if (response?.success == true) {
          var redirectUrl: string;
          if (response.redirectUrl == undefined) {
            // TODO: Yritä session storagesta etsiä tallennettua?
            redirectUrl = 'course/' + this.courseid +  '/list-tickets';
          } else {
            redirectUrl = response.redirectUrl;
          }
          this.router.navigateByUrl(redirectUrl);
        }
      })
      .catch(error => this.handleError(error));
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

}
