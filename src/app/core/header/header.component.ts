import { ActivatedRoute, Router, ActivationEnd  } from '@angular/router';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }
    from '@angular/core';
import { Observable } from 'rxjs';
import { StoreService } from '../services/store.service';
import { User } from '@core/core.models';
import { AuthService } from '@core/services/auth.service';
import { isInIframe } from '@shared/utils';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  // Async pipeä varten.
  // public courseID: string | null = this.utils.getCourseIDfromURL();
  @Input() courseid: string | null = null;
  public disableLangSelect: boolean = false;
  public isLoggedIn$: Observable<Boolean | null>;
  public isParticipant$: Observable<Boolean | null>;
  public readonly maxUserLength = 40;
  public user: User | null = null;
  public user$: Observable<User | null>;
  public userRole: string = '';
  public handsetPB$: Observable<BreakpointState>;
  private _language!: string;

  constructor (
    private auth: AuthService,
    private route : ActivatedRoute,
    private change: ChangeDetectorRef,
    private responsive: BreakpointObserver,
    private router: Router,
    private store : StoreService
    ) {
    // this.courseID = this.utils.getCourseIDfromURL();
    this.handsetPB$ = this.responsive.observe(Breakpoints.HandsetPortrait);
    this.isLoggedIn$ = this.store.trackLoggedIn();
    this.isParticipant$ = this.store.trackIfParticipant();
    this._language = localStorage.getItem('language') ?? 'fi-FI';
    this.user$ = this.store.trackUserInfo();
  }

  ngOnInit(): void {
    this.trackUserInfo();
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

  public goTo(view: 'profile' | 'settings') {
    // Ei routen seuraaminen toimi ja initiin ei voi laittaa, kun voi silloin
    // olla null.
    // const courseid = this.utils.getCourseIDfromURL();
    if (this.courseid === null) {
      console.error('Kurssi id on null, ei voida jatkaa. ');
      return
    }
    this.router.navigateByUrl('/course/' + this.courseid + '/' + view);
  }

  public login(): void {
    if (this.courseid === null) {
      throw new Error('header.component.ts.login: ei kurssi ID:ä.');
    }
    const currentRoute = window.location.pathname + window.location.search;
    if (currentRoute.indexOf('/register') !== -1 &&
        currentRoute.indexOf('/login') !== -1) {
      this.auth.saveRedirectURL();
    }
    this.auth.navigateToLogin(this.courseid);
  }

  public logout() {
    this.auth.logout().then(res => {
      if (this.courseid) this.auth.navigateToLogin(this.courseid);
    })
  }

  public logoClicked() {
    // beginningButton komponentti kuuntelee tätä ja vaihtaa routea.
    this.store.sendMessage('go begin');
  }

  public toggleLanguage() {
    this.language = this._language === 'fi-FI' ? 'en-US' : 'fi-FI';
  }

  /*
  private trackCourseID() {
    this.router.events.subscribe(event => {
      console.dir(event);
      if (event instanceof ActivationEnd) {
        let courseID = event.snapshot.paramMap.get('courseid');
        if (courseID !== this.courseID) {
          this.courseID = courseID;
        }
      }
    });
  } */

  trackUserInfo() {
    this.store.trackUserInfo().subscribe(response => {
        this.user = response;
        this.change.detectChanges();
    })
  }

}
