import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
// import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable, Subscription, interval, startWith, switchMap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { TicketService, Kurssini, UKK, TiketinPerustiedot } from '../ticket.service';
import { AuthService } from 'src/app/core/auth.service';

export interface Sortable {
  tilaID: number;
  tila: string;
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
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

  public readonly pollingRateMin = 15;
  public columnDefinitions: ColumnDefinition[];
  public columnDefinitionsFAQ: ColumnDefinition[];
  public courseName: string = '';
  public dataSource = new MatTableDataSource<Sortable>();
  public dataSourceFAQ = new MatTableDataSource<UKK>();
  public errorMessage: string = '';
  public FAQisLoaded: boolean = false;
  public header: string = '';
  public isCourseIDvalid: boolean = false;
  public isInIframe: boolean = true;
  public isLoaded: boolean = false;
  public isPhonePortrait: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public me: string =  $localize`:@@Minä:Minä`;
  public numberOfFAQ: number = 0;
  public numberOfQuestions: number = 0;
  public showNoFAQ: boolean = true;
  public showNoQuestions: boolean = true;
  public ticketMessageSub: Subscription;
  public ticketViewLink: string = environment.apiBaseUrl + '/ticket-view/';
  public username: string | null = '';
  public userRole: 'opettaja' | 'opiskelija' | 'admin' | '' = '';
  private courseID: string | null = '';

  @ViewChild('sortQuestions', {static: false}) sortQuestions = new MatSort();
  @ViewChild('sortFaq', {static: false}) sortFaq = new MatSort();

  // @ViewChild('paginatorQuestions') paginator: MatPaginator | null = null;
  // @ViewChild('paginatorFaq') paginatorFaq: MatPaginator | null = null;

  //displayedColumns: string[] = ['id', 'nimi', 'ulkotunnus']
  //data = new MatTableDataSource(kurssit);

  // private _liveAnnouncer: LiveAnnouncer,

  constructor(
    private responsive: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private ticket: TicketService,
    private authService: AuthService
  ) {
    this.ticketMessageSub = this.ticket.onMessages().subscribe(message => {
      if (message) {
        this.errorMessage = message;
      } else {
        // Poista viestit, jos saadaan tyhjä viesti.
        this.errorMessage = '';
      }
    });

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
      if (response !== null) {
        if (response.nimi !== undefined ) {
          this.username = response.nimi;
        }
        if (response.asema !== undefined ) {
          this.userRole = response.asema;
        }
      }
    });
    // this.username = this.authService.getUserName();
    // this.userRole = this.authService.getUserRole();
    this.getIfInIframe();
    this.trackScreenSize();
    this.route.queryParams.subscribe(params => {
      var courseIDcandinate: string = params['courseID'];
      if (courseIDcandinate === undefined) {
        this.errorMessage = $localize `:@@puuttuu kurssiID:Kurssin tunnistetietoa ei löytynyt. Tarkista URL-osoitteen oikeinkirjoitus.` + '.';
        this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      if (params['sessionID'] !== undefined) {
        const route = window.location.pathname + window.location.search;
        console.log(' URL on: ' + route);
        console.log('huomattu session id url:ssa, tallennetaan ja käytetään sitä.');
        this.authService.setSessionID(params['sessionID']);
      }
      this.showFAQ(courseIDcandinate);
      this.ticket.setActiveCourse(courseIDcandinate);
      // Voi olla 1. näkymä, jolloin on kurssi ID tiedossa.
      // this.authService.saveUserInfo(courseIDcandinate);
      // this.trackLoginState(courseIDcandinate);
      if (this.authService.getIsUserLoggedIn() == true || this.authService.getSessionID() !== null) {
        // Kirjautumisen jälkeen jos käyttäjätietoja ei ole haettu, koska kurssi ID:ä ei silloin tiedossa.
        if (this.authService.getUserName2.length == 0) {
          this.authService.saveUserInfo(courseIDcandinate);
        }
        this.updateLoggedInView(courseIDcandinate);
      }
      this.setTicketListHeader();
      this.isLoaded = true;
    });
  }

  public submitTicket () {
    if (this.authService.getIsUserLoggedIn() == false) {
      window.localStorage.setItem('REDIRECT_URL', 'submit');
      // console.log('Tallennettiin redirect URL: /submit/ ');
    }
    this.router.navigateByUrl('submit');
  }

  public submitFaq () {
    if (this.authService.getIsUserLoggedIn() == false) {
      window.localStorage.setItem('REDIRECT_URL', 'submit-faq');
      // console.log('Tallennettiin redirect URL: /submit-faq/');
    }
    this.router.navigateByUrl('submit-faq');
  }

  private trackLoginState(courseIDcandinate: string) {
    this.authService.onIsUserLoggedIn().subscribe(response => {
      // console.log('lista : saatiin kirjautumistieto: ' + response);
      this.isLoaded = true;
      if (response == true) {
        this.updateLoggedInView(courseIDcandinate);
      }
    });
  }

  private updateLoggedInView(courseIDcandinate: string) {
    this.ticket.getMyCourses().then(response => {
      if (response[0].kurssi !== undefined) {
        const myCourses: Kurssini[] = response;
        // console.log('kurssit: ' + JSON.stringify(myCourses) + ' urli numero: ' + courseIDcandinate);
        // Onko käyttäjä URL parametrilla saadulla kurssilla.
        if (!myCourses.some(course => course.kurssi == Number(courseIDcandinate))) {
          this.errorMessage = $localize`:@@Et ole kurssilla:Et ole osallistujana tällä kurssilla` + '.';
        } else {
          this.courseID = courseIDcandinate;
          // Jotta header ja submit-view tietää tämän, kun käyttäjä klikkaa otsikkoa, koska on tikettilistan URL:ssa.
          this.isCourseIDvalid = true;
          this.ticket.setActiveCourse(this.courseID);
          if (this.courseID !== null) {
            this.showCourseName(this.courseID);
          }
        }
      }
    }).then(() => {
      this.pollQuestions();
    }).catch(error => {
      console.log('listing.component: saatiin error: ');
      console.dir(error);
      this.handleError(error);
    }).finally(() => {
      // Elä laita this.isLoaded = true; tähän.
      //
    })
  }

  private getIfInIframe() {
    const isInIframe = window.sessionStorage.getItem('IN-IFRAME');
    if (isInIframe == 'false') {
      this.isInIframe = false;
    } else {
      this.isInIframe = true;
    }
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
    // FIXME: 15min välein ATM ettei koodatessa turhaa pollata.

    interval(this.pollingRateMin * 60 * 1000)
      .pipe(
        startWith(0),
        switchMap(() => this.ticket.getOnQuestions(Number(this.courseID)))
      ).subscribe(
        response => {
          console.log('question polled');
          if (response.length > 0) {
            let tableData: Sortable[] = response.map(({ tila, id, otsikko, aikaleima, aloittaja }) => ({
              tilaID: tila,
              tila: this.ticket.getTicketState(tila),
              id: id,
              otsikko: otsikko,
              aikaleima: aikaleima,
              aloittajanNimi: aloittaja.nimi
            }));
            // Arkistoituja kysymyksiä ei näytetä.
            tableData = tableData.filter(ticket => ticket.tilaID !== 6)
            // console.log('Tabledata alla:'); console.log(JSON.stringify(tableData));
            if (tableData !== null) {
              this.dataSource = new MatTableDataSource(tableData);
            }
            // console.log('MatTableDataSource alla:'); console.dir(this.dataSource);
            this.numberOfQuestions = tableData.length;
            // console.log('Saatiin vastaus (alla):'); console.dir(SortableData);
            this.dataSource.sort = this.sortQuestions;
            // this.dataSource.paginator = this.paginator;
            if (this.numberOfQuestions === 0) {
              this.showNoQuestions = true;
            } else {
              this.showNoQuestions = false;
            }
          }
        }
      )
  }

  private showCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then( courseName => {
      if (courseName.length > 0 ) {
        this.courseName = courseName;
      }
    }).catch( () => {
      this.courseName = '';
    })
  }

  public setTicketListHeader() {
    let userRole = this.authService.getUserRole();
    switch (userRole) {
      case 'opettaja':
        this.header = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`; break;
      case 'admin':
        this.header = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`; break;
      case 'opiskelija':
        this.header = $localize`:@@Omat kysymykset:Omat kysymykset`; break;
      default:
        // Jos ei olla kirjautuneina.
        this.header = $localize`:@@Esitetyt kysymykset:Esitetyt kysymykset`
    }
  }

  public getDisplayedColumnFAQ(): string[] {
    return this.columnDefinitionsFAQ
      .filter((cd) => !this.isPhonePortrait || cd.showMobile)
      .map((cd) => cd.def);
  }

  public getDisplayedColumn(): string[] {
    return this.columnDefinitions
      .filter((cd) => !this.isPhonePortrait || cd.showMobile)
      .map((cd) => cd.def);
  }

  private showFAQ(courseID: string) {
    this.ticket
      .getFAQ(Number(courseID))
      .then(response => {
        if (response.length > 0) {
          this.numberOfFAQ = response.length;
          if (this.numberOfFAQ === 0) {
            this.showNoFAQ = true;
          } else {
            this.showNoFAQ = false;
          }
          this.dataSourceFAQ = new MatTableDataSource(
            response.map(({ id, otsikko, aikaleima, tyyppi }) => ({
              id: id,
              otsikko: otsikko,
              aikaleima: aikaleima,
              tyyppi: tyyppi
            }))
          );
          // console.log('Saatiin vastaus (alla):');
          // console.dir(SortableData);
          this.dataSourceFAQ.sort = this.sortFaq;
          // this.dataSourceFAQ.paginator = this.paginatorFaq;
        }
      })
      .catch(error => {
        this.handleError(error);
      })
      .finally(() => {
        this.FAQisLoaded = true;
      });
  }

  // TODO: lisää virheilmoitusten käsittelyjä.
  private handleError(error: any) {
    if (error.tunnus !== undefined ) {
      if (error.tunnus == 1000 ) {
        this.errorMessage = $localize`:@@Et ole kirjautunut:Et ole kirjautunut` + '.'
      }
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
  applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFAQ.filter = filterValue.trim().toLowerCase();
      /*if (this.dataSourceFAQ.paginator) {
        this.dataSourceFAQ.paginator.firstPage();
      }*/
  }

  ngOnDestroy(): void {
    this.ticketMessageSub.unsubscribe();
  }
}
