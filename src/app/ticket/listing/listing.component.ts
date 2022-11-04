import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { TicketService } from '../ticket.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface Question {
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
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
}


// const DATA = [
// { id: 3, otsikko: "”Index out of bounds”?", aikaleima: "2022-10-18T07:07:07.693Z", aloittaja: 3},
// { id: 6, otsikko: "”} Expected”?", aikaleima: "2022-10-21T07:07:07.847Z", aloittaja: 2 },
// { id: 7, otsikko: "Uusi tiketti", aikaleima: "2022-11-02T07:49:12.382Z", aloittaja: 1 }

// ]

const emptyData: Array<Sortable> = [
  { id: 0, otsikko: '', aikaleima: '', aloittajanNimi: ''}
]

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements AfterViewInit, OnInit {
  // dataSource:any = [{}];
  dataSource = {} as MatTableDataSource<Sortable>;
  // dataSource = new MatTableDataSource<Sortable>();
  displayedColumns: string[] = ['otsikko', 'aikaleima', 'aloittajanNimi'];
  ticketViewLink: string = environment.apiBaseUrl + '/ticket-view/';
  userID = '3';
  courseID: string = '1';
  // dataSource = new MatTableDataSource(ELEMENT_DATA);

  //displayedColumns: string[] = ['id', 'nimi', 'ulkotunnus']
  //data = new MatTableDataSource(kurssit);

  constructor(private _liveAnnouncer: LiveAnnouncer,
    private router: Router,
    private ticket: TicketService) {
    this.ticket.getQuestions(this.courseID).then(response => {

      this.dataSource = new MatTableDataSource(response.map(({ id, otsikko, aikaleima, aloittaja }) => (
        {
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

  @ViewChild(MatSort)
  sort!: MatSort;

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
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
    console.log('Koitetaan routea: '+ url);
    this.router.navigateByUrl(url);
  }
  
  goSendTicket() {
    this.router.navigateByUrl('submit');
  }
}
