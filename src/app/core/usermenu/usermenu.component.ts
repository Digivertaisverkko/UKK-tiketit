import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }
    from '@angular/core';
import { AuthService } from '../auth.service';
import { getIsInIframe } from '../../shared/utils';
import { User } from 'src/app/core/core.models';


@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.scss'],
})

// changeDetection: ChangeDetectionStrategy.OnPush

export class UsermenuComponent {

  @Input() courseID: string | null = null;
  @Input() user: User | null = null;
  @Input() isLoggedIn: boolean = false;
  // public courseID: string | null = this.route.snapshot.paramMap.get('courseid');
  public disableLangSelect: boolean = false;
  public isInIframe: boolean;
  private _language!: string;

  constructor (
    private authService: AuthService,
    private change: ChangeDetectorRef,
    ) {
    this._language = localStorage.getItem('language') ?? 'fi-FI';
    this.isInIframe = getIsInIframe();
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
