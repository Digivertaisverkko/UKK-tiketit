import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit }
    from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { getIsInIframe } from '@shared/utils';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/core/core.models';
import { StoreService } from '../store.service';
import { getCourseIDfromURL } from '@shared/utils';


@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UsermenuComponent implements OnInit {
  public courseID: string | null = null;
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
    this.courseID = getCourseIDfromURL();
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
    if (this.courseID === null) {
      throw new Error('header.component.ts.login: ei kurssi ID:ä.');
    }
    this.authService.saveRedirectURL();
    this.authService.navigateToLogin(this.courseID);
  }

  public logout() {
    this.authService.logout(this.courseID);
  }

  public openInNewTab(): void {
    window.open(window.location.href, '_blank');
  }

}
