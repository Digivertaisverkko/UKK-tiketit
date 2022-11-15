import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TicketService, Ticket, Tila } from '../ticket.service';
import { Subscription } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit, OnDestroy {
  public courseID: string;
  ticket: Ticket;
  tila: typeof Tila;
  commentText: string;
  isLoaded: boolean;
  ticketID: string;

  messageSubscription: Subscription;
  message: string = '';

  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar
    ) {
      this.courseID = this.ticketService.getActiveCourse();
      this.ticket = {} as Ticket;
      this.tila = Tila;
      this.commentText = '';
      this.isLoaded = false;
      this.ticketID = String(this.route.snapshot.paramMap.get('id'));
      this.messageSubscription = this.ticketService.onMessages().subscribe(
        (message) => { this._snackBar.open(message, 'OK') });
  }

  ngOnInit(): void {
    this.ticketService.getTicketInfo(this.ticketID)
      .then(response => {
        this.ticket = response;
        this.isLoaded = true;
      });
  }

  public goBack(): void {
    this.router.navigateByUrl('/list-tickets?courseID=' + this.courseID);
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  public sendComment(): void {
    this.ticketService.addComment(this.ticketID, this.commentText)
      .then(() => { this.ticketService.getTicketInfo(this.ticketID).then(response => { this.ticket = response }) })
      .then(() => { this.commentText = '' });
  }

}
