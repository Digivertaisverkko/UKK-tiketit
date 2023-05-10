import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit }
    from '@angular/core';
import { ActivatedRoute, Router, ActivationEnd  } from '@angular/router';
import { StoreService } from '../store.service';
import { AuthService } from '../auth.service';
import { User, Role } from 'src/app/core/core.models';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent implements OnInit {
  // Async pipeä varten.
  // public isUserLoggedIn$: Observable<boolean>;
  public courseID: string | null = this.route.snapshot.paramMap.get('courseid');
  public disableLangSelect: boolean = false;
  public readonly maxUserLength = 40;
  public user: User | null = null;
  public userRole: string = '';

  private _language!: string;

  constructor (
    private change: ChangeDetectorRef,
    private route : ActivatedRoute,
    private router: Router,
    private store : StoreService
    ) {
    this._language = localStorage.getItem('language') ?? 'fi-FI';
  }

  ngOnInit(): void {
    this.trackCourseID();
    this.trackUserInfo();
  }

  public logoClicked() {
    this.store.sendMessage('go begin');
  }

  private trackCourseID() {
    this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        let courseID = event.snapshot.paramMap.get('courseid');
        if (courseID !== this.courseID) {
          this.courseID = courseID;
        }
      }
    });
  }

  trackUserInfo() {
    this.store.trackUserInfo().subscribe(response => {
        this.user = response;
        this.userRole = this.getRoleString(this.user?.asema ?? null);
        this.change.detectChanges();
    })
  }

  getRoleString(asema: Role | null): string {
    let role: string;
      switch (asema) {
        case 'opiskelija':
          role = $localize`:@@Opiskelija:Opiskelija`; break;
        case 'opettaja':
          role = $localize`:@@Opettaja:Opettaja`; break;
        case 'admin':
          role = $localize`:@@Admin:Admin`; break;
        default:
          role = '';
      }
      return role;
  }

 /*

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

  */

}
