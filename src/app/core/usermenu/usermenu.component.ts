import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit }
    from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { getIsInIframe } from '@shared/utils';
import { User } from '@core/core.models';
import { StoreService } from '../store.service';
import { getCourseIDfromURL } from '@shared/utils';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.scss'],
})

export class UsermenuComponent implements OnInit {
  public disableLangSelect: boolean = false;
  public isDevBuild: boolean = false;
  public isInIframe: boolean;
  public isLoggedIn$: Observable<Boolean | null>;
  public isParticipant$: Observable<Boolean | null>;
  public user$: Observable<User | null>;

  private _language!: string;

  constructor (
    private authService: AuthService,
    private change: ChangeDetectorRef,
    private router: Router,
    private store: StoreService
    ) {
    this._language = localStorage.getItem('language') ?? 'fi-FI';
    this.isInIframe = getIsInIframe();
    this.isLoggedIn$ = this.store.trackLoggedIn();
    this.isParticipant$ = this.store.trackIfParticipant();
    this.user$ = this.store.trackUserInfo();
    // this.isDevBuild = !environment.production;
  }

  ngOnInit() {
    console.log('menu onOnit');
  }

  public goTo(view: 'profile' | 'settings') {
    // Ei routen seuraaminen toimi ja initiin ei voi laittaa, kun voi silloin
    // olla null.
    const courseID = getCourseIDfromURL();
    if (!courseID) {
      console.error('Kurssi id on null, ei voida jatkaa. ' + typeof courseID);
      return
    }
    this.router.navigateByUrl('/course/' + courseID + '/' + view);
  }

  public toggleLanguage() {
    this.language = this._language === 'fi-FI' ? 'en-US' : 'fi-FI';
  }

  updateMenu() {
    const url = new URL(window.location.href);
    this.disableLangSelect = (url.searchParams.get('lang') !== null) ? true : false;
  }

  get language(): string {
    return this._language;
  }

  set language(value: string) {
    if (value !== this._language) {
      localStorage.setItem('language', value);
      window.location.reload();
    }
  }

  public setHeader(isHeaderOn: boolean): void {
    window.sessionStorage.setItem('IN-IFRAME', isHeaderOn.toString());
    window.location.reload();
  }

  public login(): void {
    const courseID = getCourseIDfromURL();
    if (courseID === null) {
      throw new Error('header.component.ts.login: ei kurssi ID:ä.');
    }
    this.authService.saveRedirectURL();
    this.authService.navigateToLogin(courseID);
  }

  public logout() {
    const courseID = getCourseIDfromURL();
    this.authService.logout(courseID);
  }

  public openInNewTab(): void {
    window.open(window.location.href, '_blank');
  }

}
