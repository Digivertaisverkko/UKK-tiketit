import { ActivatedRoute, Router, ParamMap} from '@angular/router';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild }
    from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Subject, Subscription, switchMap, takeUntil, tap, throttleTime, timer }
    from 'rxjs';
import { Title } from '@angular/platform-browser';

import { AuthService, User } from 'src/app/core/auth.service';
import { Constants, getIsInIframe } from '../../shared/utils';
import { environment } from 'src/environments/environment';
import { RefreshDialogComponent } from '../../core/refresh-dialog/refresh-dialog.component';
import { StoreService } from 'src/app/core/store.service';
import { TicketService, Kurssini, UKK } from '../ticket.service';

enum IconFile {
  'Lahetetty' = 1, 'Kasittelyssa', 'Kysymys', "Kommentti", "Ratkaisu_64",
  "Arkistoitu"
}
export interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

export interface SortableTicket {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
  tilaID: number;
  tila: string;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})

export class ListingComponent implements OnInit, AfterViewInit, OnDestroy {

  public archivedCount: number = 0;
  public columnDefinitions: ColumnDefinition[];
  public columnDefinitionsFAQ: ColumnDefinition[];
  public courseID: string = '';
  public dataSource = new MatTableDataSource<SortableTicket>();
  public dataSourceArchived = new MatTableDataSource<SortableTicket>();
  public dataSourceFAQ = new MatTableDataSource<UKK>();
  public iconFile: typeof IconFile = IconFile;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isParticipant: boolean = false;
  public isPhonePortrait: boolean = false;
  public isPollingFAQ: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public noDataConsent: boolean = false;
  public numberOfFAQ: number = 0;
  public numberOfQuestions: number = 0;
  public showFilterQuestions: boolean = false;
  public showFilterFAQ: boolean = false;
  private fetchTicketsSub$: Subscription | null  = null;
  private fetchFAQsSub$: Subscription | null = null;
  private loggedIn$ = new Subscription;
  private position: number = 0;
  private readonly FAQ_POLLING_RATE_MIN = (environment.production == true ) ? 5 : 15;
  private readonly TICKET_POLLING_RATE_MIN = ( environment.production == true ) ? 1 : 15;
  private isPollingTickets: boolean = false;
  private unsubscribe$ = new Subject<void>();
  private url: string = '';

  // Merkkijonot
  public courseName: string = '';
  public errorMessage: string = '';
  public headline: string = '';
  public ticketsError;
  public ticketViewLink = '';
  public user: User = {} as User;

  @ViewChild('sortQuestions', {static: false}) sortQuestions = new MatSort();
  @ViewChild('sortArchived', {static: false}) sortArchived = new MatSort();
  @ViewChild('sortFaq', {static: false}) sortFaq = new MatSort();
  // @ViewChild('paginatorQuestions') paginator: MatPaginator | null = null;
  // @ViewChild('paginatorFaq') paginatorFaq: MatPaginator | null = null;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private responsive: BreakpointObserver,
    private route : ActivatedRoute,
    private router: Router,
    private store : StoreService,
    private ticket: TicketService,
    private title : Title
  ) {
    this.title.setTitle(Constants.baseTitle + $localize `:@@Otsikko-Kysymykset:
        Kysymykset`);
    this.isInIframe = getIsInIframe();

    this.columnDefinitions = [
      { def: 'tila', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'aloittajanNimi', showMobile: false },
      { def: 'aikaleima', showMobile: true }
    ];

    this.columnDefinitionsFAQ = [
      { def: 'otsikko', showMobile: true },
      { def: 'aikaleima', showMobile: false }
    ];

    this.ticketsError = { title: '', message: '', buttonText: '' }
  }

  ngOnInit() {
    this.url = window.location.pathname;
    this.trackCourseID();
    this.noDataConsent = this.getDataConsent();
    if (this.noDataConsent) console.log('Kieltäydytty tietojen annosta.');
    this.authService.trackUserInfo().subscribe(response => {
      this.user = response;
      this.headline = this.setTicketListHeadline();
    });
    this.trackLoggedStatus();
    this.trackScreenSize();
  }

  ngAfterViewInit(): void {
    this.trackMessages();
  }

  ngOnDestroy(): void {
    console.warn('listaus: ngOnDestroy ajettu.');
    window.removeEventListener('scroll', this.onScroll);
    this.stopPolling();
  }

  //hakutoiminto, jossa paginointi kommentoitu pois
  public applyFilter(event: Event, isTicket: boolean) {
    let filterValue = (event.target as HTMLInputElement).value;
    filterValue = filterValue.trim().toLowerCase();
    if (isTicket) {
      this.dataSource.filter = filterValue;
    } else {
      this.dataSourceFAQ.filter = filterValue;
    }
      /*if (this.dataSourceFAQ.paginator) {
        this.dataSourceFAQ.paginator.firstPage();
      }*/
  }

  // Hae arkistoidut tiketit.
  public fetchArchivedTickets() {
    this.ticket.getTicketList(this.courseID, { option: 'archived' })
      .then(response => {
        if (!response) return
        if (response.length > 0) {
          this.dataSourceArchived = new MatTableDataSource(response);
          this.archivedCount = response.length;
          this.dataSourceArchived.sort = this.sortArchived;
        }
    }).catch(error => this.handleError(error));
  }

  // Hae tiketit kerran.
  private fetchTickets(courseID: string) {
      this.ticket.getTicketList(courseID).then(response => {
        if (!response) return
        if (response.length > 0) {
          this.dataSource = new MatTableDataSource(response);
          this.numberOfQuestions = response.length;
          // Taulukko pitää olla tässä vaiheessa templatessa näkyvillä,
          // jotta sorting toimii.
          this.dataSource.sort = this.sortQuestions;
        }
        return
        // this.dataSource.paginator = this.paginator;
      }).catch(error => {
        this.handleError(error)
      }).finally(() => {
        if (this.isPollingTickets === false) {
          this.isPollingTickets = true;
          if (this.isPollingFAQ === true) {
            this.isLoaded = true;
            this.restorePosition();
          }
        }
      })
  }

  // refresh = Jos on saatu refresh-pyyntö muualta.
  private fetchFAQ(courseID: string, refresh?: boolean) {
    this.ticket.getFAQ(courseID).then(response => {
        if (response.length > 0) {
          this.numberOfFAQ = response.length;
          this.dataSourceFAQ = new MatTableDataSource(response);
          this.dataSourceFAQ.sort = this.sortFaq;
          // this.dataSourceFAQ.paginator = this.paginatorFaq;
        }
        return
      })
      .catch(error => this.handleError(error))
      .finally(() => {
        if (this.isPollingFAQ === false) {
          this.isPollingFAQ = true;
          if (this.isPollingTickets === true || this.isParticipant === false) {
            this.isLoaded = true;
            this.restorePosition();
          }
        }
        // if (refresh !== true) this.isLoaded = true;
      });
  }

  public getDisplayedColumnFAQ(): string[] {
    return this.columnDefinitionsFAQ
      .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  public getDisplayedColumn(): string[] {
    return this.columnDefinitions
      .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  private getDataConsent(): boolean {
    return (localStorage.getItem('NO_DATA_CONSENT') === "true") ? true : false
  }

  public giveConsent() {
    localStorage.removeItem('NO_DATA_CONSENT');
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '30rem';
    const refreshDialog = this.dialog.open(RefreshDialogComponent, dialogConfig);
    refreshDialog.afterClosed().subscribe(res => {
      if (res === 'cancel') {
        localStorage.setItem('NO_DATA_CONSENT', 'true');
      }
    })
  }

  // TODO: lisää virheilmoitusten käsittelyjä.
  private handleError(error: any) {
    if (error?.tunnus == 1000 ) {

    }
  }

  public hideArchived() {
    this.dataSourceArchived = new MatTableDataSource();
    this.archivedCount = 0;
  }

  private onScroll = () => {
    this.position = window.scrollY;
    this.store.setPosition(this.url, this.position);
  }


  public openInNewTab(): void {
    window.open(window.location.href, '_blank');
  }

  // Aseta virheviestejä.
  private setError(type: string): void {
    if (type === 'notParticipant') {
      this.ticketsError = {
        title: $localize`:@@Ei osallistujana-otsikko:Et osallistu tälle kurssille.`,
        message: $localize`:@@Ei osallistujana-viesti:
            Et voi kysyä kysymyksiä tällä kurssilla, etkä tarkastella muiden kysymiä kysymyksiä.`,
        buttonText: ''
      }
    } else if  (type === 'notLoggedIn') {
      this.ticketsError = {
        title: $localize`:@@Et ole kirjautunut:Et ole kirjautunut` + '.',
        message: $localize`:@@Ei osallistujana-viesti:
            Et voi lisätä tai nähdä kurssilla esitettyjä henkilökohtaisia kysymyksiä.`,
        buttonText: (this.noDataConsent === true) ? $localize `:@@Luo tili:Luo tili`: ''
      }
    } else {
      console.error('Ei virheviestiä tyypille: ' + type);
    }
  }

  public ticketErrorClickEvent(button: string) {
      this.giveConsent();
  }

  private trackLoggedStatus(): void {
    this.loggedIn$ = this.authService.onIsUserLoggedIn().subscribe(response => {
      if (response === true) {
        this.setEmptyTicketError();
        this.updateLoggedInView(this.courseID);
      } else if (response === false ) {
        this.setError('notLoggedIn');
      }
    });
  }

  // Kun esim. headerin logoa klikataan ja saadaan refresh-pyyntö.
  private trackMessages(): void {
    this.store.trackMessages().subscribe(response => {
      if (response === 'refresh') {
        console.log('trackMessages: saatiin refresh pyyntö.');
        this.isLoaded = false;
        setTimeout(() => this.isLoaded = true, 800);
        this.fetchTickets(this.courseID);
        this.fetchFAQ(this.courseID, true);
      }
    });
  }

  private trackScreenSize(): void {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.maxItemTitleLength = 35;
        this.isPhonePortrait = true;
      } else {
        this.isPhonePortrait = false;
        this.maxItemTitleLength = 100;
      }
    });
  }

  private showCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

  public setTicketListHeadline(): string {
    switch (this.user.asema) {
      case 'opettaja':
        return $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
        break;
      case 'admin':
        return $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
        break;
      case 'opiskelija':
        return $localize`:@@Omat kysymykset:Omat kysymykset`;
        break;
      default:
        return $localize`:@@Esitetyt kysymykset:Esitetyt kysymykset`
    }
  }

  // Tallentaa URL:n kirjautumisen jälkeen tapahtuvaa uudelleenohjausta varten.
  public saveRedirectUrl(linkEnding?: string): void {
    this.stopPolling();
    const link = '/course/' + this.courseID + '/submit' + (linkEnding ?? '');
    if (this.authService.getIsUserLoggedIn() === false) {
      console.log('tallennettu URL: ' + link);
      window.localStorage.setItem('REDIRECT_URL', link);
    }
  }

  private setEmptyTicketError(): void {
    this.ticketsError = { title: '', message: '', buttonText: ''}
  }

  // Seurataan kurssi ID:ä URL:sta.
  private trackCourseID(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        this.errorMessage = $localize `:@@puuttuu kurssiID:
            Kurssin tunnistetietoa  ei löytynyt. Tarkista URL-osoitteen oikeinkirjoitus.`;
        this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.courseID = courseID;
      this.showCourseName(courseID);
      this.startPollingFAQ();
    })
  }

  private startPollingFAQ(): void {
    this.fetchFAQsSub$?.unsubscribe();
    console.warn('Aloitetaan UKK pollaus.');
    const pollRate = this.FAQ_POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN;
    this.fetchFAQsSub$ = timer(0, pollRate)
        .pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(() => this.fetchFAQ(this.courseID));
}

  private startPollingTickets() {
    this.fetchTicketsSub$?.unsubscribe();
    console.warn('Aloitetaan tikettien pollaus.');
    const pollRate = this.TICKET_POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN;

    // throttleTime(pollTime),
    this.fetchTicketsSub$ = timer(0, pollRate)
        .pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => this.fetchTickets(this.courseID));
    this.loggedIn$.unsubscribe();
  }

  public stopPolling(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.fetchFAQsSub$) this.fetchFAQsSub$.unsubscribe();
    if (this.fetchTicketsSub$) this.fetchTicketsSub$.unsubscribe();
  }

  private restorePosition(): void {
    this.position = this.store.getPosition(this.url);
    if (this.position && this.position !== 0) {
      console.log('skrollataan positioon: ' + this.position);
      setTimeout(() => window.scrollTo(0, this.position), 100);
    }
    window.addEventListener('scroll', this.onScroll);
  }

  private updateLoggedInView(courseIDcandinate: string) {
    this.ticket.getMyCourses().then(response => {
      console.log('Päivitetään logged in view');
      if (response[0].kurssi !== undefined) {
        const myCourses: Kurssini[] = response;
        // Onko käyttäjä osallistujana URL parametrilla saadulla kurssilla.
        if (!myCourses.some(course => course.kurssi == Number(courseIDcandinate))) {
          this.isParticipant = false;
          this.authService.setIsParticipant(false);
          this.setError('notParticipant');
        } else {
          this.isParticipant = true;
          this.authService.setIsParticipant(true);
          this.courseID = courseIDcandinate;
          if (this.isPollingTickets) {
            this.loggedIn$.unsubscribe();
          } else {
            this.startPollingTickets();
          }
        }
      }
    }).catch(error => this.handleError(error));
    // .finally(this.isLoaded = true) ei toiminut.
  }

}
