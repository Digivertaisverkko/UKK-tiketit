import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TicketService, Ticket, Tila, Comment } from '../ticket.service';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  commentObs: Observable<any> | undefined;
  dataSource: MatTableDataSource<Comment> | undefined;
  ticket: Ticket;
  tila: typeof Tila;
  commentText: string;
  isLoaded: boolean;
  ticketID: string;

  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
    ) {
      this.ticket = {} as Ticket;
      this.tila = Tila;
      this.commentText = '';
      this.isLoaded = false;
      this.ticketID = String(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.ticketService.getTicketInfo(this.ticketID)
      .then(response => {
        this.ticket = response;
        this.setPagination(response.kommentit);
        this.isLoaded = true;
      });
  }

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }

  public sendComment(): void {
    this.ticketService.addComment(this.ticketID, this.commentText)
      .then(() => { this.ticketService.getTicketInfo(this.ticketID)
        .then(response => {
          this.ticket = response;
          this.setPagination(response.kommentit);
        }) })
      .then(() => { this.commentText = '' });
  }

  private setPagination(comments: Comment[]): void {
    this.dataSource = new MatTableDataSource<Comment>(comments);
    this.changeDetectorRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.commentObs = this.dataSource.connect();
  }

}
