import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, filter, takeUntil } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { environment } from 'src/environments/environment';
import { StoreService } from './core/services/store.service';
import { User } from './core/core.models';
import { UtilsService } from '@core/services/utils.service';

/**
 * Sovelluksen juurikomponentti. Näyttää reititystä vastaavan näkymä. Sisältää
 * upotuksessa käytetyn header-elementin, joka sisältää login,
 *
 * Muut näkymässä käytetyt komponentit, kuten upotuksen
 * ulkopuolinen "header" sekä "footer" ovat tämän käyttämää core-moduulia.
 *
 * @export
 * @class AppComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy  {
  public courseid: string | null = '';
  public courseName: string = '';
  public disableLangSelect: boolean = false;
  public isPhonePortrait = false;
  public isInIframe: boolean = false;
  public isLoading: Observable<boolean> | null = null;
  public logButtonString: string = '';
  public user$: Observable<User | null | undefined>;
  private _language!: string;
  private unsubscribe$ = new Subject<void>();

  constructor (
    private authService: AuthService,
    private route : ActivatedRoute,
    private router: Router,
    private store : StoreService,
    private utils : UtilsService
    ) {
    this.isLoading = this.store.trackLoading();
    this.user$ = this.store.trackUserInfo();
  }

  ngOnInit(): void {
    if (environment.production === true) {
      console.log('Production build');
    }
    this.authService.initialize();
    this._language = localStorage.getItem('language') ?? 'fi-FI';

    this.isInIframe = this.getIsInIframe();

    // Huom. ! Upotuksessa olevan headerin testaaminen.
    // Poista tältä riviltä kommentointi:
    // this.isInIframe = true;

    window.sessionStorage.setItem('IN-IFRAME', this.isInIframe.toString());
    console.log('Iframe upotuksen tila: ' + this.isInIframe.toString());
    this.trackCourseID();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get language(): string {
    return this._language;
  }

  /**
   * Vaihda uusi kieli. Vaatii aina sovelluksen uudelleenkäynnistyksen.
   *
   * @memberof AppComponent
   */
  set language(value: string) {
    if (value !== this._language) {
      localStorage.setItem('language', value);
      window.location.reload();
    }
  }

  /**
   * Tarkista ollaanko upotuksessa eli Iframessa.
   *
   * @private
   * @return {*}  {boolean}
   * @memberof AppComponent
   */
  // Testiympäristössä antaa myös true.
  private getIsInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  /**
   * Mene profiili- tai kirjautumisnäkymään.
   *
   * @param {('profile' | 'settings')} view
   * @memberof AppComponent
   */
  public goTo(view: 'profile' | 'settings') {
    const courseID = this.utils.getCourseIDfromURL();
    const route = '/course/' + courseID + '/' + view;
    this.router.navigateByUrl(route);
  }

  /**
   * Lähettää viestin, jota beginning-button -komponentti kuuntelee.
   *
   * @memberof AppComponent
   */
  public logoClicked() {
    this.store.sendMessage('go begin');
  }

  /**
   * Avaa sovellus uudessa välilehdessä. Sovelluksen tila pysyy samana.
   *
   * @memberof AppComponent
   */
  public openInNewTab(): void {
    window.open(window.location.href, '_blank');
  }

  /**
   * Vaihda kieltä, kts. set language.
   *
   * @memberof AppComponent
   */
  public toggleLanguage() {
    this.language = this._language === 'fi-FI' ? 'en-US' : 'fi-FI';
  }

  // Älä käytä route.paramMap. Ei toimi upotuksessa.
  private trackCourseID(): void {
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
    ).subscribe(() => {
      this.courseid = this.utils.getCourseIDfromURL();
    });
  }

}
