import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  template: `

    <div *ngIf="courseID" class="top-buttons-wrapper">
      <app-to-beginning-button></app-to-beginning-button>
    </div>

    <h1 class="main-header"><span>404</span></h1>

    <h2 i18n="@@404-otsikko" class="sub-header">Sivua ei löytynyt</h2>

    <div class="button-wrapper" *ngIf="!isLoggedIn">
      <div class="spacer"></div>
      <button align="end"
      mat-raised-button color="primary" id="submitButton"
      (click)="goToLogin()"
      i18n="@@Kirjaudu sisään">
      Kirjaudu sisään
        </button>
    </div>
    <p i18n="@@404">Hait sivua, jota ei ole koskaan ollut olemassa,
      ei enää ole olemassa tai sitten meidän palvelin sekoilee omiaan.</p>
    <p i18n="@@404-2">Todennäköisesti ensimmäinen.</p>
    `,
    styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  public isLoggedIn: Boolean = false;
  public courseID: string | null = null;

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

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      console.log(courseID);
      this.courseID = courseID;
    });
  }

  public async goToLogin() {
    const loginUrl = await this.authService.sendAskLoginRequest('own', this.courseID);
    this.router.navigateByUrl(loginUrl);
  }

}
