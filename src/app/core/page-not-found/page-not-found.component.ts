import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthService } from '../services/auth.service';
import { StoreService } from '../services/store.service';

/**
 * "Sivua ei löytynyt" / 404 - virhenäkymä. Näytetään, kun URL:lle ei löydy
 *  näytettävää näkymää. Näytetään Alkuun -nappi, jos URL:ssa on kurssin id.
 *
 * @export
 * @class PageNotFoundComponent
 */
@Component({
  template: `

    <div *ngIf="courseid" class="top-buttons-wrapper">
      <app-beginning-button></app-beginning-button>
    </div>

    <app-headline [noCourseTitle]="true" [showInIframe]="true">
      404
    </app-headline>

    <h2 i18n="@@404-otsikko" class="theme-subheading">
      Sivua ei löytynyt
    </h2>

    <p i18n="@@404">Hait sivua, jota ei ole koskaan ollut olemassa,
      ei enää ole olemassa tai sitten meidän palvelin sekoilee omiaan.
    </p>
    <p i18n="@@404-2">Todennäköisesti ensimmäinen.</p>
    `,

    styleUrls: ['./page-not-found.component.scss']
})

export class PageNotFoundComponent {
  public isLoggedIn: Boolean | null = null;
  @Input() courseid: string | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private store : StoreService,
    private title : Title
    ) {
    this.title.setTitle(this.store.getBaseTitle() + $localize
        `:@404-otsikko:Sivua ei löytynyt`);
      this.isLoggedIn = this.store.getIsLoggedIn();
  }

  public async goToLogin() {
    if (!this.courseid) return
    const res = await this.authService.getLoginInfo('own', this.courseid);
    const loginUrl = res['login-url'];
    this.router.navigateByUrl(loginUrl);
  }

}
