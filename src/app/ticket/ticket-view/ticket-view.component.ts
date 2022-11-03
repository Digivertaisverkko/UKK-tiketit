import { Component, OnInit } from '@angular/core';
import { TicketService, Ticket } from '../ticket.service';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {
  ticket: Ticket;
  isLoaded: boolean;

  constructor(private ticketService: TicketService) {
    this.ticket = {} as Ticket;
    this.isLoaded = false;
  }

  ngOnInit(): void {
    this.getTicketInfo();
  }

  public ticketID: string = '1';

  public async getTicketInfo() {
    await this.ticketService.getTicketInfo(this.ticketID).then(response => {this.ticket = response});
    console.log('kjeh' + this.ticket);
    this.isLoaded = true;
  }

}
