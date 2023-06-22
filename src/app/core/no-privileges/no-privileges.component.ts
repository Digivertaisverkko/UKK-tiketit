import { Component, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StoreService } from '../services/store.service';

@Component({
  template: `

  <div class="top-buttons-wrapper" *ngIf="courseid">
      <app-beginning-button></app-beginning-button>
    </div>

    <app-headline [noCourseTitle]="true" i18n="@@Tästä ei pääse">
      Tästä ei pääse
    </app-headline>

    <div class="button-wrapper" *ngIf="!isLoggedIn">
      <div class="spacer"></div>
    </div>
    <p i18n="@@Ei oikeuksia-näkymä">Sinulla ei ole joko oikeuksia tämän
      näkemiseen, tai etsimääsi tietoa ei ole olemassa.
    </p>

    <!-- <button align="end"
            (click)="goToLogin()"
            color="primary"
            i18n="@@Kirjaudu sisään"
            mat-raised-button
            *ngIf="!isLoggedIn"
            >
        Kirjaudu sisään
    </button> -->

  `,
  styleUrls: ['./no-privileges.component.scss']
})

export class NoPrivilegesComponent {
  @Input() courseid: string | undefined;
  public isLoggedIn: Boolean | null = null;

  constructor(
    private store: StoreService,
    private title: Title
    ) {
      this.title.setTitle(this.store.getBaseTitle() + $localize
            `:@@Tästä ei pääse:Tästä ei pääse`);
      this.isLoggedIn = this.store.getIsLoggedIn();
  }

  // public async goToLogin() {
  //   const loginUrl = await this.authService.sendAskLoginRequest('own', this.courseID);
  //   this.router.navigateByUrl(loginUrl);
  // }

}
