import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
import { TicketService, FAQ } from '../ticket.service';
import { AuthService } from 'src/app/core/auth.service';

//   id: number;

export interface Sortable {
  tila: string;
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
}

// const emptyData: Array<Sortable> = [
//   { id: 0, otsikko: '', aikaleima: '', aloittajanNimi: ''}
// ]

export interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent implements OnInit {
  private courseID: string | null = '';
  // dataSource:any = [];
  dataSource = new MatTableDataSource<Sortable>();
  dataSourceFAQ = new MatTableDataSource<FAQ>();
  // dataSourceFAQ = {} as MatTableDataSource<FAQ>;
  // dataSource = new MatTableDataSource<Sortable>();
  // displayedColumns: string[] = [ 'otsikko', 'aikaleima', 'aloittajanNimi' ];
  public columnDefinitions: ColumnDefinition[];
  public columnDefinitionsFAQ: ColumnDefinition[];
  public courseName: string = '';
  public username: string | null;;
  ticketViewLink: string = environment.apiBaseUrl + '/ticket-view/';
  public isPhonePortrait: boolean = false;
  public showNoQuestions: boolean = true;
  public showNoFAQ: boolean = true;
  public FAQisLoaded: boolean = false;
  public isLoaded: boolean = false;
  public header: string = '';
  public maxItemTitleLength = 100;
  public me: string =  $localize`:@@Minä:Minä`;
  private routeSubscription: Subscription | null = null;
  public numberOfFAQ: number = 0;
  public numberOfQuestions: number = 0;
  public ticketMessageSub: Subscription;
  public ticketServiceMessage: string = '';

  @ViewChild('sortQuestions', {static: false}) sortQuestions = new MatSort();
  @ViewChild('sortFaq', {static: false}) sortFaq = new MatSort();

  @ViewChild('paginatorQuestions') paginator: MatPaginator | null = null;
  @ViewChild('paginatorFaq') paginatorFaq: MatPaginator | null = null;

  //displayedColumns: string[] = ['id', 'nimi', 'ulkotunnus']
  //data = new MatTableDataSource(kurssit);

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private responsive: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private ticket: TicketService,
    private authService: AuthService
  ) {
    this.ticketMessageSub = this.ticket.onMessages().subscribe((message) => {
      if (message) {
        this.ticketServiceMessage = message;
      } else {
        // Poista viestit, jos saadaan tyhjä viesti.
        this.ticketServiceMessage = '';
      }
    });

    this.username = this.authService.getUserName();

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
    // if (this.route.snapshot.paramMap.get('courseID') !== null) {};
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe((result) => {
      this.isPhonePortrait = false;
      this.maxItemTitleLength = 100;
      if (result.matches) {
        this.maxItemTitleLength = 35;
        this.isPhonePortrait = true;
      }
    });
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      if (params['courseID'] !== undefined) {
        this.courseID = params['courseID'];
        // Jotta header ja submit-view tietää tämän, kun käyttäjä klikkaa otsikkoa, koska on tikettilistan URL:ssa.
        this.ticket.setActiveCourse(this.courseID);
        if (this.courseID !== null) {
          this.showCourseName(this.courseID);
          this.showHeader(this.courseID);
        }
      } else {
        try {
          const courseID = this.ticket.getActiveCourse();
          this.courseID = courseID;
          this.router.navigateByUrl('/list-tickets/' + courseID);
        } catch {
          // TODO: Kun on kurssin valintanäkymä, niin ohjaa siihen.
          this.router.navigateByUrl('/login');
        }
      }
      // console.log('löydettiin kurssi id: ' + this.courseID)
    });
    this.showFAQ();
    this.showQuestions();
    // this.showLocalQuestions();
  }

  private showLocalQuestions() {
    this.dataSource = new MatTableDataSource(
      [{"tila":"Arkistoitu","id":1,"otsikko":"Kotitehtävä ei käänny","aikaleima":"2022-11-09T11:27:47.191Z","aloittajanNimi":"Joni Rajala"},{"tila":"Arkistoitu","id":2,"otsikko":"Miten char* ja char eroaa toisistaan?","aikaleima":"2022-11-14T11:27:47.239Z","aloittajanNimi":"Joni Rajala"},{"tila":"Luettu","id":3,"otsikko":"”Index out of bounds”?","aikaleima":"2022-11-15T11:27:47.285Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Kommentoitu","id":4,"otsikko":"Ohjelma tulostaa numeroita kirjainten sijasta!","aikaleima":"2022-11-16T11:27:47.330Z","aloittajanNimi":"Joni Rajala"},{"tila":"Ratkaistu","id":5,"otsikko":"Tehtävänannossa ollut linkki ei vie mihinkään","aikaleima":"2022-11-17T11:27:47.375Z","aloittajanNimi":"Joni Rajala"},{"tila":"Kommentoitu","id":6,"otsikko":"”} Expected”?","aikaleima":"2022-11-18T11:27:47.422Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Kommentoitu","id":7,"otsikko":"Tiketin otsikko","aikaleima":"2022-11-25T08:36:17.664Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Luettu","id":8,"otsikko":"Tiketin otsikko","aikaleima":"2022-11-25T08:36:17.864Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Lisätietoa pyydetty","id":9,"otsikko":"Kysymyksen otsikko","aikaleima":"2022-11-25T10:38:30.667Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Ratkaistu","id":10,"otsikko":"toinen kysymys","aikaleima":"2022-11-25T10:39:05.981Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Lähetetty","id":11,"otsikko":"title","aikaleima":"2022-11-25T10:39:22.568Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Lähetetty","id":12,"otsikko":"kysymys","aikaleima":"2022-11-25T10:41:19.455Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Luettu","id":13,"otsikko":"Kävin ohjelmoinnin jälkeen omatoimisesti dynossa ja lukemat olivat enemmän / vähemmän kuin piti?!","aikaleima":"2022-11-29T08:35:10.763Z","aloittajanNimi":"Henri Kaustinen"}]
    )
    this.numberOfQuestions = this.dataSource.data.length;
    this.showNoQuestions = false;
    this.isLoaded = true;

  }

  getLocalData() {
    return [{"tila":"Arkistoitu","id":1,"otsikko":"Kotitehtävä ei käänny","aikaleima":"2022-11-09T11:27:47.191Z","aloittajanNimi":"Joni Rajala"},{"tila":"Arkistoitu","id":2,"otsikko":"Miten char* ja char eroaa toisistaan?","aikaleima":"2022-11-14T11:27:47.239Z","aloittajanNimi":"Joni Rajala"},{"tila":"Luettu","id":3,"otsikko":"”Index out of bounds”?","aikaleima":"2022-11-15T11:27:47.285Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Kommentoitu","id":4,"otsikko":"Ohjelma tulostaa numeroita kirjainten sijasta!","aikaleima":"2022-11-16T11:27:47.330Z","aloittajanNimi":"Joni Rajala"},{"tila":"Ratkaistu","id":5,"otsikko":"Tehtävänannossa ollut linkki ei vie mihinkään","aikaleima":"2022-11-17T11:27:47.375Z","aloittajanNimi":"Joni Rajala"},{"tila":"Kommentoitu","id":6,"otsikko":"”} Expected”?","aikaleima":"2022-11-18T11:27:47.422Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Kommentoitu","id":7,"otsikko":"Tiketin otsikko","aikaleima":"2022-11-25T08:36:17.664Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Luettu","id":8,"otsikko":"Tiketin otsikko","aikaleima":"2022-11-25T08:36:17.864Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Lisätietoa pyydetty","id":9,"otsikko":"Kysymyksen otsikko","aikaleima":"2022-11-25T10:38:30.667Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Ratkaistu","id":10,"otsikko":"toinen kysymys","aikaleima":"2022-11-25T10:39:05.981Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Lähetetty","id":11,"otsikko":"title","aikaleima":"2022-11-25T10:39:22.568Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Lähetetty","id":12,"otsikko":"kysymys","aikaleima":"2022-11-25T10:41:19.455Z","aloittajanNimi":"Henri Kaustinen"},{"tila":"Luettu","id":13,"otsikko":"Kävin ohjelmoinnin jälkeen omatoimisesti dynossa ja lukemat olivat enemmän / vähemmän kuin piti?!","aikaleima":"2022-11-29T08:35:10.763Z","aloittajanNimi":"Henri Kaustinen"}]
  }

  private showQuestions() {
    this.ticket
      .getQuestions(Number(this.courseID))
      .then((response) => {
        console.log('response: ');
        console.dir(response);
        if (response.length > 0) {
          let tableData: Sortable[] = response.map(({ tila, id, otsikko, aikaleima, aloittaja }) => ({
            tila: this.ticket.getTicketState(tila),
            id: id,
            otsikko: otsikko,
            aikaleima: aikaleima,
            aloittajanNimi: aloittaja.nimi
          }));

          console.log('Tabledata alla:');
          console.log(JSON.stringify(tableData));

          if (tableData !== null ) {
            this.dataSource = new MatTableDataSource(tableData);
          }
          console.log('MatTableDataSource alla:');
          console.dir(this.dataSource);
          this.numberOfQuestions = tableData.length;
          // console.log('Saatiin vastaus (alla):');
          // console.dir(SortableData);
          this.dataSource.sort = this.sortQuestions;
          this.dataSource.paginator = this.paginator;
        }
        console.dir(this.dataSource);
      })
      .catch((error) => {
        console.error(error.message);
      })
      .finally(() => {
        if (this.numberOfQuestions === 0) {
          this.showNoQuestions = true;
        } else {
          this.showNoQuestions = false;
        }
        this.isLoaded = true;
      });
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

  // Näytä otsikko riippuen käyttäjän roolista.
  private showHeader(courseID: string) {
    this.authService
      .getMyUserInfo(courseID)
      .then((response) => {
        if (response?.sposti.length > 0) {
          this.authService.setUserEmail(response.sposti);
        }
        if (response?.nimi.length > 0) {
          this.authService.setUserName(response.nimi);
        }
        if (response.asema !== undefined) {
          let userRole: string = response.asema;
          // console.log('Käyttäjän asema: ' + userRole);
          if (userRole == 'opettaja') {
            this.header = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
            this.authService.setUserRole(userRole);
          } else if (userRole == 'admin') {
            this.header = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
            this.authService.setUserRole(userRole);
          } else if (userRole == 'opiskelija') {
            this.header = $localize`:@@Opettajalle lähettämäsi kysymykset:Opettajalle lähettämäsi kysymykset`;
            this.authService.setUserRole(userRole);
          } else {
            console.error('Käyttäjän asemaa kurssilla ei löydetty.');
          }

        }
      })
      .catch((error) =>
        console.error(
          'listingComponent: Saatiin virhe haettaessa käyttäjän asemaa: ' +
            error.message
        )
      );
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

  private showFAQ() {
    this.ticket
      .getFAQ(Number(this.courseID))
      .then((response) => {
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
          this.dataSourceFAQ.paginator = this.paginatorFaq;
        }
      })
      .catch((error) => {

      })
      .finally(() => {
        this.FAQisLoaded = true;
      });
  }

  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  goTicketView(ticketID: number) {
    let url: string = '/ticket-view/' + ticketID;
    this.router.navigateByUrl(url);
  }

  goFaqView(faqID: number) {
    let url: string = '/faq-view/' + faqID;
    this.router.navigateByUrl(url);
  }

  goSendTicket() {
    this.router.navigateByUrl('submit');
  }
}
