import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { StoreService } from '../services/store.service';

@Component({
  template: `

  <div class="top-buttons-wrapper" *ngIf="courseID">
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

export class NoPrivilegesComponent implements OnInit {
  public courseID: string | null = null;
  public isLoggedIn: Boolean | null = null;

  constructor(
    private route: ActivatedRoute,
    private store: StoreService,
    private title: Title
    ) {
      this.title.setTitle(this.store.getBaseTitle() + $localize
            `:@@Tästä ei pääse:Tästä ei pääse`);
      this.isLoggedIn = this.store.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.trackRouteParameters();
  }

  // public async goToLogin() {
  //   const loginUrl = await this.authService.sendAskLoginRequest('own', this.courseID);
  //   this.router.navigateByUrl(loginUrl);
  // }

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      console.log(courseID);
      this.courseID = courseID;
    });
  }
}
