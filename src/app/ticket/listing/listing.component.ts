import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
// import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { timer } from 'rxjs';

import { environment } from 'src/environments/environment';
import { TicketService, Kurssini, UKK } from '../ticket.service';
import { AuthService, User } from 'src/app/core/auth.service';
import { getIsInIframe } from '../functions/isInIframe';

export interface SortableTicket {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
  tilaID: number;
  tila: string;
}
export interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent implements OnInit, AfterViewInit, OnDestroy {
  // dataSource = new MatTableDataSource<Sortable>();
  // dataSourceFAQ = {} as MatTableDataSource<FAQ>;
  // displayedColumns: string[] = [ 'otsikko', 'aikaleima', 'aloittajanNimi' ];
  // public isLoggedIn$: Observable<boolean>;

  public columnDefinitions: ColumnDefinition[];
  public columnDefinitionsFAQ: ColumnDefinition[];
  public dataSource = new MatTableDataSource<SortableTicket>();
  public dataSourceFAQ = new MatTableDataSource<UKK>();
  public FAQisLoaded: boolean = false;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isParticipant: boolean = false;
  public isPhonePortrait: boolean = false;
  public localeDateFormat: string;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public numberOfFAQ: number = 0;
  public numberOfQuestions: number = 0;
  public courseID: string = '';
  // Ticket info polling rate in minutes.
  private readonly POLLING_RATE_MIN = (environment.production == true ) ? 1 : 15;

  // Merkkijonot
  public courseName: string = '';
  public errorMessage: string = '';
  public headline: string = '';
  public me: string =  $localize`:@@Minä:Minä`;
  public ticketViewLink = '';
  public user: User = {} as User;

  @ViewChild('sortQuestions', {static: false}) sortQuestions = new MatSort();
  @ViewChild('sortFaq', {static: false}) sortFaq = new MatSort();
  // @ViewChild('paginatorQuestions') paginator: MatPaginator | null = null;
  // @ViewChild('paginatorFaq') paginatorFaq: MatPaginator | null = null;

  // private _liveAnnouncer: LiveAnnouncer,

  constructor(
    private responsive: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private ticket: TicketService,
    private authService: AuthService
  ) {
    this.localeDateFormat = this.authService.getDateFormat();
    this.isInIframe = getIsInIframe();

    this.columnDefinitions = [
      { def: 'tila', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'aloittajanNimi', showMobile: false },
      { def: 'aikaleima', showMobile: true }
    ];

    this.columnDefinitionsFAQ = [
      { def: 'otsikko', showMobile: true },
      { def: 'aikaleima', showMobile: false },
      { def: 'tyyppi', showMobile: true }
    ];

  }

  ngOnInit() {
    // Jos haki tavallisella metodilla, ehti hakea ennen kuin se ehdittiin loginissa hakea.
    this.authService.trackUserInfo().subscribe(response => {
      this.user = response;
      this.setTicketListHeadline();
    });
    this.trackScreenSize();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        this.errorMessage = $localize `:@@puuttuu kurssiID:Kurssin tunnistetietoa ei löytynyt. Tarkista URL-osoitteen oikeinkirjoitus.`;
        this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.courseID = courseID;
      this.showCourseName(courseID);
      var sessionID = paramMap.get('sessionID');
      if (sessionID !== null) {
        const route = window.location.pathname + window.location.search;
        console.log('URL on: ' + route);
        console.log('huomattu session id url:ssa, tallennetaan ja käytetään sitä.');
        this.authService.setSessionID(sessionID);
      }
      this.showFAQ(courseID);
      // Voi olla 1. näkymä, jolloin on kurssi ID tiedossa.
      // this.authService.saveUserInfo(courseIDcandinate);
      // this.trackLoginState(courseIDcandinate);
      if (this.authService.getIsUserLoggedIn() === true || this.authService.getSessionID() !== null) {
        // Kirjautumisen jälkeen jos käyttäjätietoja ei ole haettu, koska kurssi ID:ä ei silloin tiedossa.
        if (this.authService.getUserName.length === 0) {
          this.authService.fetchUserInfo(courseID);
        }
        // this.updateLoggedInView(courseID);
      }
    });
  }

  ngAfterViewInit(): void {
    // Kun esim. headerin logoa klikataan.
    this.ticket.trackRefresh().subscribe(response => {
      if (response) {
        this.isLoaded = false;
        setTimeout(() => this.isLoaded = true, 800);
        this.fetchQuestions(this.courseID);
        this.showFAQ(this.courseID, true);
      }
    });
    this.authService.onIsUserLoggedIn().subscribe(response => {
      if (response) this.updateLoggedInView(this.courseID);
    });
  }

  ngOnDestroy(): void {
    this.ticket.untrackRefresh();
  }

  public submit(linkEnding?: string) {
    const link = '/course/' + this.courseID + '/submit' + (linkEnding ?? '');
    if (this.authService.getIsUserLoggedIn() === false) {
      window.localStorage.setItem('REDIRECT_URL', link);
    }
    this.router.navigateByUrl(link);
  }

  // public submitTicket () {
  //   const link = '/course/' + this.courseID + 'submit';
  //   if (this.authService.getIsUserLoggedIn() === false) {
  //     window.localStorage.setItem('REDIRECT_URL', link);
  //   }
  //   this.router.navigateByUrl(link);
  // }

  public submitFaq () {
    if (this.authService.getIsUserLoggedIn() === false) {
      window.localStorage.setItem('REDIRECT_URL', 'submit-faq');
    }
    this.router.navigateByUrl('/course/' + this.courseID + '/submit-faq');
  }

  private updateLoggedInView(courseIDcandinate: string) {
    this.ticket.getMyCourses().then(response => {
      if (response[0].kurssi !== undefined) {
        const myCourses: Kurssini[] = response;
        // console.log('kurssit: ' + JSON.stringify(myCourses) + ' urli numero: ' + courseIDcandinate);
        // Onko käyttäjä URL parametrilla saadulla kurssilla.
        // Ei tarvitse olla enää osallistujana.
        if (!myCourses.some(course => course.kurssi == Number(courseIDcandinate))) {
          this.isParticipant = false;
          this.authService.setIsParticipant(false);
          this.errorMessage = $localize`:@@Et ole kurssilla:Et ole osallistujana tällä kurssilla` + '.';
        } else {
          this.isParticipant = true;
          this.authService.setIsParticipant(true);
          this.courseID = courseIDcandinate;
        }
      }
    }).then(() => {
      const MILLISECONDS_IN_MIN = 60000;
      timer(0, this.POLLING_RATE_MIN * MILLISECONDS_IN_MIN).subscribe( () => this.fetchQuestions(this.courseID) );
    }
    ).catch(error => this.handleError(error));
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

  private fetchQuestions(courseID: string) {
    this.ticket.getTicketList(courseID).then(response => {
      if (response.length > 0) {
        let tableData: SortableTicket[] = response.map(({ tila, id, otsikko, aikaleima, aloittaja }) => (
          {
            tilaID: tila,
            tila: this.ticket.getTicketState(tila),
            id: id,
            otsikko: otsikko,
            aikaleima: aikaleima,
            aloittajanNimi: aloittaja.nimi
          }
        ));
        // Arkistoituja kysymyksiä ei näytetä.
        tableData = tableData.filter(ticket => ticket.tilaID !== 6)
        if (tableData !== null) this.dataSource = new MatTableDataSource(tableData);
        this.numberOfQuestions = tableData.length;
        this.dataSource.sort = this.sortQuestions;
        // this.dataSource.paginator = this.paginator;
      }
    }).catch(error => {
      this.handleError(error);
    });
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
        this.headline = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`; break;
      case 'admin':
        this.headline = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`; break;
      case 'opiskelija':
        this.headline = $localize`:@@Omat kysymykset:Omat kysymykset`; break;
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

  private showFAQ(courseID: string, refresh?: boolean) {
    this.ticket
      .getFAQ(courseID)
      .then(response => {
        if (response.length > 0) {
          this.numberOfFAQ = response.length;
          // let tableData = (
          //   response.map(({ id, otsikko, aikaleima, tyyppi }) => ({
          //     id: id,
          //     otsikko: otsikko,
          //     aikaleima: aikaleima,
          //     tyyppi: tyyppi
          //   }))
          // );
          // tableData = tableData.filter(ukk => ukk.tilaID !== 6);
          // this.dataSourceFAQ = new MatTableDataSource(tableData);
          // Tarvittaessa voi muokata, mitä tietoja halutaan näyttää.
          let tableData = response.map(({ id, otsikko, aikaleima, tyyppi, tila }) => ({
              id: id,
              otsikko: otsikko,
              aikaleima: aikaleima,
              tyyppi: tyyppi,
              tila: tila
            }));

          tableData = tableData.filter(faq => faq.tila !== 6);
          this.dataSourceFAQ = new MatTableDataSource(tableData);
          this.dataSourceFAQ.sort = this.sortFaq;
          // this.dataSourceFAQ.paginator = this.paginatorFaq;
        }
      })
      .catch(error => {
          this.handleError(error)
        })
      .finally(() => {
        this.FAQisLoaded = true;
        if (refresh !== true) this.isLoaded = true;
      });
  }

  // TODO: lisää virheilmoitusten käsittelyjä.
  private handleError(error: any) {
    if (error?.tunnus == 1000 ) {
      this.errorMessage = $localize`:@@Et ole kirjautunut:Et ole kirjautunut` + '.'
    }
  }

  // announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
  //   if (sortState.direction) {
  //     this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
  //   } else {
  //     this._liveAnnouncer.announce('Sorting cleared');
  //   }
  // }

  //hakutoiminto, jossa paginointi kommentoitu pois
  applyFilter(event: Event, isTicket: boolean ){
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

  // ngOnDestroy(): void {
  // }
}
