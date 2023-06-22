import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Title } from '@angular/platform-browser';
import { StoreService } from '../services/store.service';


@Component({
  template: `

    <div *ngIf="courseid" class="top-buttons-wrapper">
      <app-beginning-button></app-beginning-button>
    </div>

    <!-- <h1 class="main-header"><span>404</span></h1> -->

    <app-headline [noCourseTitle]="true" [showInIframe]="true">
      404
    </app-headline>

    <h2 i18n="@@404-otsikko" class="theme-subheading">
      Sivua ei löytynyt
    </h2>

    <div class="button-wrapper" *ngIf="!isLoggedIn">
      <div class="spacer"></div>

    <!--
      <button align="end"
              (click)="goToLogin()"
              id="submitButton"
              i18n="@@Kirjaudu sisään"
              mat-raised-button color="primary"
              >
        Kirjaudu sisään
      </button>
    -->

    </div>
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
        `:@@@@404-otsikko:Sivua ei löytynyt`);
      this.isLoggedIn = this.store.getIsLoggedIn();
  }

  public async goToLogin() {
    if (!this.courseid) return
    const res = await this.authService.getLoginInfo('own', this.courseid);
    const loginUrl = res['login-url'];
    this.router.navigateByUrl(loginUrl);
  }

}
