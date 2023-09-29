import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }
    from '@angular/core';
import { Observable } from 'rxjs';
import { Router  } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { StoreService } from '../services/store.service';
import { User } from '@core/core.models';

/**
 * Upotuksen ulkopuolella näytettävä "header" -elementti. Sisältää logon,
 * mahdollisesti kirjautuneen käyttäjän nimen, roolin sekä valikon.
 * Valikosta voi vaihtaa kielen, kirjautua sisään/ulos, kirjautuessa avata
 * profiili-näkymän ja jos käyttäjä on kirjautuneena opettajana kurssilla voi
 * hän avata asetukset -näkymän.  Logon klikkaamalla reititetään kurssin
 * tikettilista -näkymään. Upotuksessa app -komponentti näyttää vastaavan
 * upotukseen soveltuvan elementin tämän sijaan.
 *
 * @export
 * @class HeaderComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  // public courseID: string | null = this.utils.getCourseIDfromURL();
  @Input() courseid: string | null = null;
  public disableLangSelect: boolean = false;
  public readonly maxUserLength = 40;
  // Osassa template syntakseja on vähemmän vaikeasti luettava, kun observablen
  // sijaan käyttää tätä.
  public user: User | null | undefined;
  public user$: Observable<User | null | undefined>;
  public userRole: string = '';
  public handsetPB$: Observable<BreakpointState>;
  private _language!: string;

  constructor (
    private auth: AuthService,
    private change: ChangeDetectorRef,
    private responsive: BreakpointObserver,
    private router: Router,
    private store : StoreService
    ) {
    this.handsetPB$ = this.responsive.observe(Breakpoints.HandsetPortrait);
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
      if (this.courseid) {
        this.auth.navigateToLogin(this.courseid);
      } else {
        console.error("file: header.component.ts:100 ~ HeaderComponent ~ this.auth.logout ~ Ei kurssi id:ä, ei voida kirjautua.")
      }
    })
  }

  public logoClicked() {
    // beginningButton komponentti kuuntelee tätä ja vaihtaa routea.
    this.store.sendMessage('go begin');
  }

  public toggleLanguage() {
    this.language = this._language === 'fi-FI' ? 'en-US' : 'fi-FI';
  }

  trackUserInfo() {
    this.store.trackUserInfo().subscribe(response => {
        this.user = response;
        this.change.detectChanges();
    })
  }

}
