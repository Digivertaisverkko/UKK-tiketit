import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TicketService, Ticket, Tila } from '../ticket.service';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {
  ticket: Ticket;
  tila: typeof Tila = Tila;
  commentText: string = '';
  isLoaded: boolean = false;

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private route: ActivatedRoute
    ) {
      this.ticket = {} as Ticket;
  }

  ngOnInit(): void {
    this.ticketService.getTicketInfo(this.ticketID)
      .then(response => {
        this.ticket = response;
        this.isLoaded = true;
      });
  }

  public ticketID: string = String(this.route.snapshot.paramMap.get('id'));

  public sendComment(): void {
    this.ticketService.addComment(this.ticketID, this.commentText)
      .then(() => { this.refreshComponent() });
  }

  refreshComponent() {
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

}
