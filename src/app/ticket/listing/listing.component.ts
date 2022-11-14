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

export interface Question {
  tila: number;
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittaja: {
    id: number,
    nimi: string;
    sposti: string;
    asema: string;
  };
}

export interface Sortable {
  tila: string;
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
}

export enum Tila {
  "Virhetila",
  "Lähetetty",
  "Luettu",
  "Lisätietoa pyydetty",
  "Kommentoitu",
  "Ratkaistu",
  "Arkistoitu"
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
  private courseID = 0;
  // dataSource:any = [{}];
  dataSource = {} as MatTableDataSource<Sortable>;
  // dataSource = new MatTableDataSource<Sortable>();
  displayedColumns: string[] = [ 'otsikko', 'aikaleima', 'aloittajanNimi' ];
  public columnDefinitions: ColumnDefinition[]; 
  ticketViewLink: string = environment.apiBaseUrl + '/ticket-view/';
  public isPhonePortrait: boolean = false;
  public showNoQuestions: boolean = false;
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
    private ticket: TicketService)
  {
    this.columnDefinitions = [
      { def: 'tila', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'aikaleima', showMobile: true },
      { def: 'aloittajanNimi', showMobile: false } 
    ]
  }

  ngOnInit() {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.isPhonePortrait = false;
      this.maxTicketTitleLength = 100;
      if (result.matches) {
        this.maxTicketTitleLength = 35;
        this.isPhonePortrait = true;
      }
    });
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['courseID'] !== undefined) {
        this.courseID = 1;
      } else {}
        this.courseID = params['courseID'];
        console.log('course ID: ' + this.courseID)
        this.updateView();
    })
  }

  public getDisplayedColumn(): string[] {
    return this.columnDefinitions
    .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  private updateView() {
  this.ticket.getQuestions(this.courseID).then(response => {
    response =[];
    this.tableLength = response.length;
    if (response.length === 0) {
      this.showNoQuestions = true;
    } else {
      this.showNoQuestions = false; 
    }
    this.dataSource = new MatTableDataSource(response.map(({ tila, id, otsikko, aikaleima, aloittaja }) => (
      {
        tila: Tila[tila],
        id: id,
        otsikko: otsikko,
        aikaleima: aikaleima,
        aloittajanNimi: aloittaja.nimi
      }
    )))
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
