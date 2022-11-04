import { Component, OnInit } from '@angular/core';
import { TicketService, Ticket, Tila } from '../ticket.service';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {
  ticket: Ticket;

  constructor(private ticketService: TicketService) {
    this.ticket = {} as Ticket;
  }

  ngOnInit(): void {
    this.ticketService.getTicketInfo(this.ticketID).then(response => {this.ticket = response});
  }

  public ticketID: string = '3';

  public getTila(tilaNum: number): string {
    return Tila[tilaNum];
  }

}
