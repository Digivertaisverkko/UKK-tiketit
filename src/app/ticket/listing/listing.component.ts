import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
// import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable, Subscription, interval, startWith, switchMap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { TicketService, Kurssini, UKK } from '../ticket.service';
import { AuthService, User } from 'src/app/core/auth.service';
import { getIsInIframe } from '../functions/isInIframe';
import { MatTab } from '@angular/material/tabs';

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
export class ListingComponent implements OnInit, OnDestroy {
  // dataSource = new MatTableDataSource<Sortable>();
  // dataSourceFAQ = {} as MatTableDataSource<FAQ>;
  // displayedColumns: string[] = [ 'otsikko', 'aikaleima', 'aloittajanNimi' ];
  // public isLoggedIn$: Observable<boolean>;

  public readonly pollingRateMin: number;
  public columnDefinitions: ColumnDefinition[];
  public columnDefinitionsFAQ: ColumnDefinition[];
  public dataSource = new MatTableDataSource<SortableTicket>();
  public dataSourceFAQ = new MatTableDataSource<UKK>();
  public FAQisLoaded: boolean = false;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isPhonePortrait: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public numberOfFAQ: number = 0;
  public numberOfQuestions: number = 0;
  public ticketMessageSub: Subscription;
  private courseID: string | null = '';

  // Merkkijonot

  public courseName: string = '';
  public errorMessage: string = '';
  public headline: string = '';
  public readonly me: string =  $localize`:@@Minä:Minä`;
  public readonly ticketViewLink: string = environment.apiBaseUrl + '/ticket-view/';
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
    this.pollingRateMin = (environment.production == true ) ? 1 : 15;
    this.isInIframe = getIsInIframe();
    this.ticketMessageSub = this.ticket.onMessages().subscribe(message =>
      this.errorMessage = message ?? '');

    // this.isLoggedIn$ = this.authService.onIsUserLoggedIn();

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
    this.route.queryParams.subscribe(params => {
      var courseIDcandinate: string = params['courseID'];
      if (courseIDcandinate === undefined) {
        this.errorMessage = $localize `:@@puuttuu kurssiID:Kurssin tunnistetietoa ei löytynyt. Tarkista URL-osoitteen oikeinkirjoitus.` + '.';
        this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.ticket.setActiveCourse(courseIDcandinate);
      this.showCourseName(courseIDcandinate);

      if (params['sessionID'] !== undefined) {
        const route = window.location.pathname + window.location.search;
        console.log('URL on: ' + route);
        console.log('huomattu session id url:ssa, tallennetaan ja käytetään sitä.');
        this.authService.setSessionID(params['sessionID']);
      }

      this.showFAQ(courseIDcandinate);
      // Voi olla 1. näkymä, jolloin on kurssi ID tiedossa.
      // this.authService.saveUserInfo(courseIDcandinate);
      // this.trackLoginState(courseIDcandinate);
      if (this.authService.getIsUserLoggedIn() === true || this.authService.getSessionID() !== null) {
        // Kirjautumisen jälkeen jos käyttäjätietoja ei ole haettu, koska kurssi ID:ä ei silloin tiedossa.
        if (this.authService.getUserName.length === 0) {
          this.authService.fetchUserInfo(courseIDcandinate);
        }
        this.updateLoggedInView(courseIDcandinate);
      }
      this.isLoaded = true;
    });
  }

  public submitTicket () {
    if (this.authService.getIsUserLoggedIn() === false) {
      window.localStorage.setItem('REDIRECT_URL', 'submit');
    }
    this.router.navigateByUrl('submit');
  }

  public submitFaq () {
    if (this.authService.getIsUserLoggedIn() === false) {
      window.localStorage.setItem('REDIRECT_URL', 'submit-faq');
    }
    this.router.navigateByUrl('submit-faq');
  }

  private trackLoginState(courseIDcandinate: string) {
    this.authService.onIsUserLoggedIn().subscribe(response => {
      this.isLoaded = true;
      if (response) this.updateLoggedInView(courseIDcandinate);
    });
  }

  private updateLoggedInView(courseIDcandinate: string) {
    this.ticket.getMyCourses().then(response => {
      if (response[0].kurssi !== undefined) {
        const myCourses: Kurssini[] = response;
        // console.log('kurssit: ' + JSON.stringify(myCourses) + ' urli numero: ' + courseIDcandinate);
        // Onko käyttäjä URL parametrilla saadulla kurssilla.
        // Ei tarvitse olla enää osallistujana.
        if (!myCourses.some(course => course.kurssi == Number(courseIDcandinate))) {
          this.authService.setIsParticipant(false);
          this.errorMessage = $localize`:@@Et ole kurssilla:Et ole osallistujana tällä kurssilla` + '.';
        } else {
          this.authService.setIsParticipant(true);
          this.courseID = courseIDcandinate;
          // Jotta header ja submit-view tietää tämän, kun käyttäjä klikkaa otsikkoa, koska on tikettilistan URL:ssa.
          this.ticket.setActiveCourse(this.courseID);
        }
      }
    }).then(() => this.pollQuestions()
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

  private pollQuestions() {
    interval(this.pollingRateMin * 60 * 1000)
      .pipe(
        startWith(0),
        switchMap(() => this.ticket.getOnQuestions(Number(this.courseID)))
      ).subscribe(
        response => {
          if (response.length > 0) {
            let tableData: SortableTicket[] = response.map(({ tila, id, otsikko, aikaleima, aloittaja }) => ({
              tilaID: tila,
              tila: this.ticket.getTicketState(tila),
              id: id,
              otsikko: otsikko,
              aikaleima: aikaleima,
              aloittajanNimi: aloittaja.nimi
            }));
            // Arkistoituja kysymyksiä ei näytetä.
            tableData = tableData.filter(ticket => ticket.tilaID !== 6)
            if (tableData !== null) this.dataSource = new MatTableDataSource(tableData);
            this.numberOfQuestions = tableData.length;
            this.dataSource.sort = this.sortQuestions;
            // console.log('----- näytetään: ' + this.dataSource.data.values.length);
            // console.log('------ data source : ' + this.dataSource.data.length);
            // this.dataSource.paginator = this.paginator;
          }
        }
      )
  }

  private showCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => {
      this.courseName = '';
    })
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

  private showFAQ(courseID: string) {
    this.ticket
      .getFAQ(Number(courseID))
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
          // this.dataSourceFAQ = new MatTableDataSource(
          let tableData = response.map(({ id, otsikko, aikaleima, tyyppi, tila }) => ({
              id: id,
              otsikko: otsikko,
              aikaleima: aikaleima,
              tyyppi: tyyppi,
              tila: tila
            }));

          tableData = tableData.filter(faq => faq.tila !== 6)  
          
          this.dataSourceFAQ = new MatTableDataSource(tableData);

          this.dataSourceFAQ.sort = this.sortFaq;
          // this.dataSourceFAQ.paginator = this.paginatorFaq;
        }
      })
      .catch(error => this.handleError(error))
      .finally(() => this.FAQisLoaded = true);
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

  ngOnDestroy(): void {
    this.ticketMessageSub.unsubscribe();
  }
}
