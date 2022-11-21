import { Component, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NewTicket, TicketService } from '../ticket.service';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})
export class SubmitTicketComponent implements OnDestroy {
  titleText: string = '';
  assignmentText: string = '';
  problemText: string = '';
  messageText: string = '';
  newTicket: NewTicket = {} as NewTicket;

  messageSubscription: Subscription;
  message: string = '';

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private _snackBar: MatSnackBar
    ) {
      this.messageSubscription = this.ticketService.onMessages().subscribe(
        (message) => { this._snackBar.open(message, 'OK') });
  }

  goBack() {
    let url:string = '/list-tickets?courseID=' + this.ticketService.getActiveCourse();
    console.log('submit-ticket: url: ' + url);
    this.router.navigateByUrl(url);
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  public sendTicket(): void {
    this.newTicket.otsikko = this.titleText;
    this.newTicket.viesti = this.messageText;
    this.newTicket.kentat = [{id: 1, arvo: this.assignmentText}, {id: 2, arvo: this.problemText}];
    console.log(this.newTicket);
    this.ticketService.addTicket('1', this.newTicket)
      .then(() => { this.router.navigateByUrl('/list-tickets') });
  }

}
