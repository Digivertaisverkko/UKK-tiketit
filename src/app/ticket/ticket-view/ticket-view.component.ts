import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TicketService, Ticket, Tila } from '../ticket.service';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {
  ticket: Ticket;
  tila: typeof Tila;
  commentText: string;
  isLoaded: boolean;
  ticketID: string;

  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute
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
        this.isLoaded = true;
      });
  }

  public sendComment(): void {
    this.ticketService.addComment(this.ticketID, this.commentText)
      .then(() => { this.ticketService.getTicketInfo(this.ticketID).then(response => { this.ticket = response }) })
      .then(() => { this.commentText = '' });
  }

}
