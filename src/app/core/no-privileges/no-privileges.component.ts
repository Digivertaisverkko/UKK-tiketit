import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  template: `

  <div class="top-buttons-wrapper" *ngIf="courseID">
      <app-to-beginning-button></app-to-beginning-button>
    </div>

    <h1 class="main-header">
      <span i18n="@@Tästä ei pääse">Tästä ei pääse</span>
    </h1>

    <div class="button-wrapper" *ngIf="!isLoggedIn">
      <div class="spacer"></div>
    </div>
    <p i18n="@@Ei oikeuksia-näkymä">Sinulla ei ole joko oikeuksia tämän
      näkemiseen, tai etsimääsi tietoa ei ole olemassa.
    </p>

    <button align="end"
          (click)="goToLogin()"
          i18n="@@Kirjaudu sisään"
          mat-raised-button color="primary"
          *ngIf="!isLoggedIn"
      >
        Kirjaudu sisään
      </button>

  `,
  styleUrls: ['./no-privileges.component.scss']
})

export class NoPrivilegesComponent implements OnInit {
  public courseID: string | null = null;
  public isLoggedIn: Boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) {
      this.isLoggedIn = this.authService.getIsUserLoggedIn();
      console.log(this.courseID);
  }

  ngOnInit(): void {
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.trackRouteParameters();
  }

  public async goToLogin() {
    const loginUrl = await this.authService.sendAskLoginRequest('own');
    this.router.navigateByUrl(loginUrl);
  }

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      console.log(courseID);
      this.courseID = courseID;
    });
  }
}
