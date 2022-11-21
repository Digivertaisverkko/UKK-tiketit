import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
import { TicketService } from '../ticket.service';
import { AuthService, User } from 'src/app/core/auth.service';
// import { Statement } from '@angular/compiler';

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
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements AfterViewInit, OnInit {
  private courseID: string | null = '';
  // dataSource:any = [];
  dataSource = {} as MatTableDataSource<Sortable>;
  // dataSource = new MatTableDataSource<Sortable>();
  // displayedColumns: string[] = [ 'otsikko', 'aikaleima', 'aloittajanNimi' ];
  public columnDefinitions: ColumnDefinition[]; 
  ticketViewLink: string = environment.apiBaseUrl + '/ticket-view/';
  public isPhonePortrait: boolean = false;
  public showNoQuestions: boolean = true;
  public isLoaded: boolean = false;
  public header: string = '';
  public maxTicketTitleLength = 100;
  private routeSubscription: Subscription | null = null;
  public tableLength: number = 0;

  @ViewChild(MatSort)
  sort!: MatSort;

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  // dataSource = new MatTableDataSource(ELEMENT_DATA);

  //displayedColumns: string[] = ['id', 'nimi', 'ulkotunnus']
  //data = new MatTableDataSource(kurssit);

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private responsive: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private ticket: TicketService,
    private authService: AuthService)
  {

    this.columnDefinitions = [
      { def: 'tila', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'aikaleima', showMobile: true },
      { def: 'aloittajanNimi', showMobile: false } 
    ]
  }

  ngOnInit() {
    // if (this.route.snapshot.paramMap.get('courseID') !== null) {};
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.isPhonePortrait = false;
      this.maxTicketTitleLength = 100;
      if (result.matches) {
        this.maxTicketTitleLength = 35;
        this.isPhonePortrait = true;
      }
    });
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['courseID'] == undefined) {
        console.error(' Course ID:ä ei löydetty');
      } else {
        this.courseID = params['courseID'];
        // Jotta header ja submit-view tietää tämän, kun käyttäjä klikkaa otsikkoa, koska on tikettilistan URL:ssa.
        this.ticket.setActiveCourse(this.courseID);
        if (this.courseID !== null) {
          this.showHeader(this.courseID);
        }
      }
      console.log('löydettiin kurssi id: ' + this.courseID)
    })
    this.updateView();
  }

  private showHeader(courseID: string) {
    this.authService.getMyUserInfo(courseID).then(response => {
      let userRole: string = response.asema;
      // console.log('Käyttäjän asema: ' + userRole);
      if (userRole == "opettaja") {
        this.header = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
        userRole = $localize`:@@Opettaja:Opettaja`;
        this.authService.setUserRole(userRole);
      } else if (userRole == "admin") {
        this.header = $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
        this.authService.setUserRole(userRole);
      } else if (userRole == "opiskelija") {
        this.header = $localize`:@@Opettajalle lähettämäsi kysymykset:Opettajalle lähettämäsi kysymykset`;
        userRole = $localize`:@@Opiskelija:Opiskelija`;
        this.authService.setUserRole(userRole);
      } else {
        console.error('Käyttäjän asemaa kurssilla ei löydetty.');
      }
    });
  }

  public getDisplayedColumn(): string[] {
    return this.columnDefinitions
    .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  private updateView() {
  this.ticket.getQuestions(Number(this.courseID)).then(response => {
    // Testaamiseen:
    // response =[];
    this.tableLength = response.length;
    if (this.tableLength === 0) {
      this.showNoQuestions = true;
    } else {
      this.showNoQuestions = false; 
    }
    const lang = localStorage.getItem('language')?.substring(0,2);
    this.dataSource = new MatTableDataSource(response.map(({ tila, id, otsikko, aikaleima, aloittaja }) => (
      {
        tila: this.ticket.getTicketState(tila),
        id: id,
        otsikko: otsikko,
        aikaleima: aikaleima,
        aloittajanNimi: aloittaja.nimi
      }
    )))
    this.isLoaded = true;
    // console.log('Saatiin vastaus (alla):');
    // console.dir(SortableData);
  }).then(response =>
    console.dir(this.dataSource)
  );
  // this.dataSource = new MatTableDataSource(DATA);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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

  goSendTicket() {
    this.router.navigateByUrl('submit');
  }
}
