import { ActivatedRoute, Router, ParamMap} from '@angular/router';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Subscription, timer } from 'rxjs';

import { environment } from 'src/environments/environment';
import { TicketService, Kurssini, UKK } from '../ticket.service';
import { StoreService } from 'src/app/core/store.service';
import { AuthService, User } from 'src/app/core/auth.service';
import { Constants, getIsInIframe } from '../../shared/utils';
import { Title } from '@angular/platform-browser';

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
  // displayedColumns: string[] = [ 'otsikko', 'aikaleima', 'aloittajanNimi' ];

  public archivedCount: number = 0;
  public columnDefinitions: ColumnDefinition[];
  public columnDefinitionsFAQ: ColumnDefinition[];
  public courseID: string = '';
  public dataSource = new MatTableDataSource<SortableTicket>();
  public dataSourceArchived = new MatTableDataSource<SortableTicket>();
  public dataSourceFAQ = new MatTableDataSource<UKK>();
  public FAQisLoaded: boolean = false;
  public iconFile: typeof IconFile = IconFile;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isParticipant: boolean = false;
  public isPhonePortrait: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public numberOfFAQ: number = 0;
  public numberOfQuestions: number = 0;
  private fetchTicketsSub: Subscription | null = null;
  private fetchFAQsSub: Subscription | null = null;
  private readonly FAQ_POLLING_RATE_MIN = (environment.production == true ) ? 5 : 15;
  private readonly TICKET_POLLING_RATE_MIN = ( environment.production == true ) ? 1 : 15;

  // Merkkijonot
  public courseName: string = '';
  public errorMessage: string = '';
  public headline: string = '';
  public notParticipant;
  public ticketViewLink = '';
  public user: User = {} as User;

  @ViewChild('sortQuestions', {static: false}) sortQuestions = new MatSort();
  @ViewChild('sortArchived', {static: false}) sortArchived = new MatSort();
  @ViewChild('sortFaq', {static: false}) sortFaq = new MatSort();
  // @ViewChild('paginatorQuestions') paginator: MatPaginator | null = null;
  // @ViewChild('paginatorFaq') paginatorFaq: MatPaginator | null = null;

  constructor(
    private authService: AuthService,
    private responsive: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private store: StoreService,
    private ticket: TicketService,
    private title: Title
  ) {
    this.title.setTitle(Constants.baseTitle +
        $localize `:@@Otsikko-Kysymykset:Kysymykset`);
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

    this.notParticipant = {
      title: $localize`:@@Ei osallistujana-otsikko:Et osallistu tälle kurssille.`,
      message: $localize`:@@Ei osallistujana-viesti:Et voi kysyä kysymyksiä
          tällä kurssilla, etkä tarkastella muiden kysymiä kysymyksiä.`
    }
  }

  ngOnInit() {
    this.trackRouteParameters();
    this.authService.trackUserInfo().subscribe(response => {
      this.user = response;
      this.setTicketListHeadline();
    });
    this.trackScreenSize();
    this.authService.onIsUserLoggedIn().subscribe(response => {
      if (response) this.updateLoggedInView(this.courseID);
    });
  }

  ngAfterViewInit(): void {
    this.trackMessages();
  }

  ngOnDestroy(): void {
    this.fetchFAQsSub?.unsubscribe();
    this.fetchTicketsSub?.unsubscribe();
    this.store.untrackMessages();
  }

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        this.errorMessage = $localize `:@@puuttuu kurssiID:Kurssin tunnistetietoa
            ei löytynyt. Tarkista URL-osoitteen oikeinkirjoitus.`;
        this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.courseID = courseID;
      console.log('lista: otettiin kurssi ID URL:sta');
      this.showCourseName(courseID);
      this.fetchFAQsSub = timer(0, this.FAQ_POLLING_RATE_MIN *
          Constants.MILLISECONDS_IN_MIN)
          .subscribe(() => this.fetchFAQ(this.courseID));
    });
  }

  public openInNewTab() {
    window.open(window.location.href, '_blank');
  }

  // Kun esim. headerin logoa klikataan ja saadaan refresh-pyyntö.
  private trackMessages() {
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

  private updateLoggedInView(courseIDcandinate: string) {
    this.ticket.getMyCourses().then(response => {
      if (response[0].kurssi !== undefined) {
        const myCourses: Kurssini[] = response;
        // Onko käyttäjä osallistujana URL parametrilla saadulla kurssilla.
        if (!myCourses.some(course => course.kurssi == Number(courseIDcandinate))) {
          this.isParticipant = false;
          this.authService.setIsParticipant(false);
        } else {
          this.isParticipant = true;
          this.authService.setIsParticipant(true);
          this.courseID = courseIDcandinate;
          this.fetchTicketsSub = timer(0, this.TICKET_POLLING_RATE_MIN *
              Constants.MILLISECONDS_IN_MIN)
              .subscribe(() => this.fetchTickets(this.courseID));
        }
      }
    }).catch(error => this.handleError(error));
    // .finally(this.isLoaded = true) ei toiminut.
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

  public fetchArchivedTickets() {
    this.ticket.getTicketList(this.courseID, { option: 'archived' }).then(response => {
      if (response.length > 0) {
        this.dataSourceArchived = new MatTableDataSource(response);
        this.archivedCount = response.length;
        this.dataSourceArchived.sort = this.sortArchived;
      }
    }).catch(error => this.handleError(error));
  }

  private fetchTickets(courseID: string) {
    this.ticket.getTicketList(courseID).then(response => {
        if (response.length > 0) {
          this.dataSource = new MatTableDataSource(response);
          this.numberOfQuestions = response.length;
          this.dataSource.sort = this.sortQuestions;
        }
        // this.dataSource.paginator = this.paginator;
    }).catch(error => this.handleError(error));
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
      })
      .catch(error => this.handleError(error))
      .finally(() => {
        this.FAQisLoaded = true;
        if (refresh !== true) this.isLoaded = true;
      });
  }

  public hideArchived() {
    this.dataSourceArchived = new MatTableDataSource();
    this.archivedCount = 0;
  }

  private showCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

  public setTicketListHeadline() {
    // let userRole = this.authService.getUserRole();
    switch (this.user.asema) {
      case 'opettaja':
        this.headline = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla
            esitetyt kysymykset`;
        break;
      case 'admin':
        this.headline = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla
            esitetyt kysymykset`;
        break;
      case 'opiskelija':
        this.headline = $localize`:@@Omat kysymykset:Omat kysymykset`;
        break;
      default:
        this.headline = $localize`:@@Esitetyt kysymykset:Esitetyt kysymykset`
    }
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

  // Tallentaa URL:n kirjautumisen jälkeen tapahtuvaa uudelleenohjausta varten.
  public saveRedirectUrl(linkEnding?: string): void {
    const link = '/course/' + this.courseID + '/submit' + (linkEnding ?? '');
    if (this.authService.getIsUserLoggedIn() === false) {
      console.log('tallennettu URL: ' + link);
      window.localStorage.setItem('REDIRECT_URL', link);
    }
  }

  // TODO: lisää virheilmoitusten käsittelyjä.
  private handleError(error: any) {
    if (error?.tunnus == 1000 ) {
      this.errorMessage = $localize`:@@Et ole kirjautunut:Et ole kirjautunut` + '.'
    }
  }

  //hakutoiminto, jossa paginointi kommentoitu pois
  public applyFilter(event: Event, isTicket: boolean ){
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

}
