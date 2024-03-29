import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild }
    from '@angular/core';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject, Subscription, takeUntil, takeWhile, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@core/services/auth.service';
import { environment } from 'src/environments/environment';
import { RefreshDialogComponent } from '@shared/components/refresh-dialog/refresh-dialog.component';
import { StoreService } from '@core/services/store.service';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketService } from '../ticket.service';
import { UKK } from '../ticket.models';
import { User } from '@core/core.models';

interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

interface ErrorNotification {
  title: string,
  message: string,
  buttonText?: string
}

const customFilterPredicate = (data: UKK, filter: string) => {
  const filterValue = filter.toLowerCase();

  const kentatMatch = data.kentat?.some((item) => {
    const arvo = item.arvo ? item.arvo.toLowerCase() : '';
    const otsikko = item.otsikko ? item.otsikko.toLowerCase() : '';
    const ohje = item.ohje ? item.ohje.toLowerCase() : '';

    return (
      arvo.includes(filterValue) ||
      otsikko.includes(filterValue) ||
      ohje.includes(filterValue)
    );
  });

  const datePipe = new DatePipe('fi-FI');

  let mainDataMatch: boolean | undefined = (
    data.id.toString() === filterValue ||
    data.otsikko.toLowerCase().includes(filterValue) ||
    datePipe.transform(data.aikaleima, 'shortDate')?.includes(filterValue)
  );
  if (mainDataMatch === undefined) mainDataMatch = false;
  return kentatMatch || mainDataMatch

}
/**
 * Listausnäkymä, joka sisältää kurssin kaikki UKK:t. Tiketit, mukaan lukien
 * Ratkaistut, ovat tämän näkymän lapsikomponentissa TicketList.
 *
 * @export
 * @class ListingComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})

export class ListingComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public courseid: string = '';
  @ViewChild(TicketListComponent) ticketList!: TicketListComponent;
  public dataSource = new MatTableDataSource<UKK>();
  public error: ErrorNotification | null = null;
  public errorFromComponent: string | null = null;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isPhonePortrait: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public noDataConsent: boolean | null;
  public numberOfFAQ: number = 0;
  public screenSize: 'handset' | 'small' | 'other' = 'other';
  public strings: Map<string, string>;
  public successMessage: string | null = null;
  public user$: Observable<User | null | undefined>;

  private columnDefinitions: ColumnDefinition[];
  private fetchFAQsTimer$: Observable<number>;
  private isPolling: boolean = false;
  private isTicketsLoaded: boolean = false;
  private loggedIn$ = new Subscription;
  private readonly POLLING_RATE_MIN = ( environment.production == true ) ? 5 : 5;
  private scrollPosition: number = 0;
  private unsubscribe$ = new Subject<void>();
  private url: string = '';

  @ViewChild('sortFaq', { static: false }) sort = new MatSort();

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private responsive: BreakpointObserver,
    private store : StoreService,
    private ticket: TicketService,
    private title : Title
  ) {
    this.noDataConsent = this.authService.getDenyDataConsent();
    this.title.setTitle(this.store.getBaseTitle() + $localize `:@@Otsikko-Kysymykset:
        Kysymykset`);
    this.isInIframe = window.sessionStorage.getItem('inIframe') === 'true' ?
        true : false;
    this.user$ = this.store.trackUserInfo();
    this.columnDefinitions = [
      { def: 'otsikko', showMobile: true },
      { def: 'aikaleima', showMobile: true }
    ];
    this.strings = new Map([
      ['Ei osallistujana-msg', $localize`:@@Ei osallistujana-viesti: Et voi lisätä tai nähdä kurssilla esitettyjä henkilökohtaisia kysymyksiä.`],
      ['Et ole kirjautunut-title', $localize`:@@Et ole kirjautunut:Et ole kirjautunut`],
      ['Et osallistujana-title', $localize`:@@Ei osallistujana-otsikko:Et osallistu tälle kurssille.`],
      ['Kirjaudu', $localize`:@@Kirjaudu:Kirjaudu`],
      ['Luo tili', $localize`:@@Luo tili:Luo tili`]
    ]);
    const POLLING_RATE_MS = this.POLLING_RATE_MIN * this.store.getMsInMin();
    this.fetchFAQsTimer$ = timer(0, POLLING_RATE_MS).pipe(takeUntilDestroyed());
  }

  ngOnInit() {
    this.url = window.location.pathname;
    this.trackUserInfo();
    this.checkRouterData();
    this.startPollingFAQ(this.POLLING_RATE_MIN);
    this.trackScreenSize();
  }

  ngAfterViewInit(): void {
    this.trackMessages();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    this.loggedIn$.unsubscribe();
  }

  //hakutoiminto, jossa paginointi kommentoitu pois
  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
      this.dataSource.filter = filterValue;
  }

  private static customFilterPredicate(data: UKK, filter: string): boolean {
    return customFilterPredicate(data, filter);
  }

  public GoToLogin(): void {
    if (!this.courseid) return
    this.authService.navigateToLogin(this.courseid)
  }

  // Näytä mahdollisesti routen mukana tullut viesti tai virheilmoitus.
  private checkRouterData() {
    const message: string | null = window.history.state.message;
    if (message) {
      if (message === 'account created') {
        this.successMessage = $localize `:@@Tilin luonti onnistui:Uusi käyttäjätili luotiin tälle kurssille onnistuneesti` + '.';
      }
    }
    const errorMsg: string | null = window.history.state.error;
    this.errorFromComponent = errorMsg ?? null;
  }

  public errorClickEvent(button: string) {
    if (this.noDataConsent === true && this.isInIframe === true) {
      this.showConsentPopup();
    } else if (this.noDataConsent !== true && this.isInIframe === false) {
      this.authService.navigateToLogin(this.courseid);
    }
  }

  // refresh = Jos on saatu refresh-pyyntö muualta. Testaamista varten public.
  public fetchFAQ(courseID: string, refresh?: boolean) {
    this.ticket.getFAQlist(courseID).then(response => {
      if (this.isLoaded === false) this.isLoaded = true;
        if (response.length > 0) {
          this.numberOfFAQ = response.length;
          this.dataSource = new MatTableDataSource(response);
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = ListingComponent.customFilterPredicate;
        }
        return
      })
      .catch(error => {
        this.error = {
          title: $localize`:@@Virhe:Virhe`,
          message: $localize `:@@UKK-lista ei saatu haettua:
            Ei saatu haettua tälle kurssille lisättyjä usein kysyttyjä kysymyksiä` + '.',
          buttonText: ''
        }
        this.isLoaded = true;
      })
      .finally(() => {
        if (this.isPolling === false) {
          this.isPolling = true;
          if (this.isTicketsLoaded === true || this.numberOfFAQ > 0) {
            this.restorePosition();
          }
        }
      });
  }

  public getDisplayedColumnFAQ(): string[] {
    return this.columnDefinitions
      .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  public showConsentPopup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '30rem';
    this.dialog.open(RefreshDialogComponent, dialogConfig);
  }

  public newTicketMessage(event: 'loaded') {
    if (event === 'loaded') {
      this.isTicketsLoaded = true;
      if (this.isPolling === true) {
        // this.isLoaded = true;
        this.restorePosition();
      }
    }
  }

  private onScroll = () => {
    this.scrollPosition = window.scrollY;
    this.store.setPosition(this.url, this.scrollPosition);
  }

  private restorePosition(): void {
    this.scrollPosition = this.store.getPosition(this.url);
    if (this.scrollPosition && this.scrollPosition !== 0) {
      console.log('siirrytään aiempaan scroll-positioon');
      setTimeout(() => window.scrollTo(0, this.scrollPosition), 100);
    }
    window.addEventListener('scroll', this.onScroll);
  }

  // Kun esim. headerin logoa klikataan ja saadaan refresh-pyyntö.
  private trackMessages(): void {
    this.store.trackMessages()
    .pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(response => {
      if (response === 'go begin') {
        console.log('listing.trackMessages: saatiin refresh pyyntö.');
        this.isLoaded = false;
        setTimeout(() => this.isLoaded = true, 800);
        this.fetchFAQ(this.courseid, true);
      }
    });
  }

  // Aseta tarvittavat asettelun muutokset riippuen näkymän leveydestä.
  private trackScreenSize(): void {
    this.responsive.observe([Breakpoints.HandsetPortrait, Breakpoints.Small])
    .subscribe((state: BreakpointState) => {
      if (state.breakpoints[Breakpoints.HandsetPortrait]) {
        this.maxItemTitleLength = 85;
        this.isPhonePortrait = true;
        this.screenSize = "handset";
      } else if (state.breakpoints[Breakpoints.Small]) {
        this.isPhonePortrait = false;
        this.maxItemTitleLength = 90;
        this.screenSize = "small";
      } else {
        this.isPhonePortrait = false;
        this.maxItemTitleLength = 100;
        this.screenSize = "other";
      }
    });
  }

  private trackUserInfo() {
    let user: User | undefined | null = null;
    this.store.trackUserInfo().pipe(
      takeWhile((res) => user === undefined)
      ).subscribe(userinfo => {
        if (userinfo === undefined) return
        user = userinfo;
        if (userinfo === null) {
          this.isLoaded = true;
          this.setError('notLoggedIn');
        } else {
          this.error === null;
        }
    })
  }

  // Tallentaa URL:n kirjautumisen jälkeen tapahtuvaa uudelleenohjausta varten.
  public saveRedirectUrl(linkEnding?: string): void {
    const link = '/course/' + this.courseid + '/submit' + (linkEnding ?? '');

    if (this.store.getUserInfo === null) {
      console.log('tallennettu URL: ' + link);
      window.localStorage.setItem('redirectUrl', link);
    }
  }

  // Aseta virheviestejä.
  private setError(type: 'notParticipant' | 'notLoggedIn'): void {
    if (type === 'notParticipant') {
      this.error = {
        title: $localize`:@@Ei osallistujana-otsikko:Et osallistu tälle kurssille.`,
        message: $localize`:@@Ei osallistujana-viesti:Et voi kysyä kysymyksiä tällä kurssilla, etkä tarkastella muiden kysymiä kysymyksiä.`,
        buttonText: ''
      }
    } else if (type === 'notLoggedIn') {
      this.error = {
        title: $localize`:@@Et ole kirjautunut:Et ole kirjautunut` + '.',
        message: '',
        buttonText: ''
      }

      if (this.isInIframe && this.authService.getDenyDataConsent() !== true) {
        this.error.message = $localize `:@@Ei kirjautunut upotuksessa:Tämä voi johtua siitä, että käytät selainta, joka kieltää kolmannnen osapuolen evästeet. Voit kokeilla muuttaa selaimen asetuksia tai käyttää eri selainta, esim. Chrome.`;
      } else {
        this.error.message = $localize `:@@Ei osallistujana-viesti:Et voi lisätä tai nähdä kurssilla esitettyjä henkilökohtaisia kysymyksiä.`
      }

      if (this.authService.getDenyDataConsent() === true) {
        this.error.buttonText = $localize `:@@Luo tili:Luo tili`;
      } else if (this.isInIframe === false) {
        this.error.buttonText = $localize `:@@Kirjaudu:Kirjaudu`;
      }
    } else {
      console.error('Ei virheviestiä tyypille: ' + type);
    }
  }

  // Hae UKK:t tietyn ajan välein.
  private startPollingFAQ(POLLING_RATE_MIN: number): void {
    console.log(`Aloitetaan UKK pollaus joka ${POLLING_RATE_MIN} minuutti.`);
    let fetchStartTime: number | undefined;
    let elapsedTime: number | undefined;
    const POLLING_RATE_SEC = POLLING_RATE_MIN * 60;
    this.fetchFAQsTimer$.subscribe(() => {
      this.fetchFAQ(this.courseid!);
      if (fetchStartTime) {
        elapsedTime = Math.round((Date.now() - fetchStartTime) / 1000);
        console.log('UKK-pollauksen viime kutsusta kulunut aikaa ' +
            `${elapsedTime} sekuntia.`);
        if (elapsedTime !== POLLING_RATE_SEC) {
          console.log(`Olisi pitänyt kulua ${POLLING_RATE_SEC} sekuntia.`);
        }
      }
      fetchStartTime = Date.now();
    });
  }

}
