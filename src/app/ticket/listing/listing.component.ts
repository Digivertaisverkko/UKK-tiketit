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
  aloittaja: number;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements AfterViewInit, OnInit {

  displayedColumns: string[] = ['otsikko', 'aikaleima', 'aloittaja'];
 ticketViewLink: string = environment.apiBaseUrl + '/ticket-view/';

  dataSource = new MatTableDataSource<Question>();
  userID = '3';
  // dataSource = new MatTableDataSource(ELEMENT_DATA);

  //displayedColumns: string[] = ['id', 'nimi', 'ulkotunnus']
  //data = new MatTableDataSource(kurssit);

  constructor(private _liveAnnouncer: LiveAnnouncer,
    private router: Router,
    private ticket: TicketService) {
      this.ticket.getQuestions('1').then( response => {
        // this.dataSource = new MatTableDataSource(response);
        this.dataSource = new MatTableDataSource<Question>(response);
        console.log('Saatiin vastaus (alla):');
        console.dir(response);
      });
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

}
