import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';
import { NewTicket, TicketService } from '../ticket.service';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})
export class SubmitTicketComponent implements OnDestroy, OnInit {
  // max pituus: 255.
  titleText: string = '';
  assignmentText: string = '';
  problemText: string = '';
  messageText: string = '';
  newTicket: NewTicket = {} as NewTicket;
  isFaq: boolean = false;
  userRole: 'opettaja' | 'opiskelija' | 'admin' | '' = '';

  messageSubscription: Subscription;
  message: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private ticketService: TicketService,
    private _snackBar: MatSnackBar
    ) {
      this.messageSubscription = this.ticketService.onMessages().subscribe(
        (message) => { this._snackBar.open(message, 'OK') });
    }

  ngOnInit(): void {
    this.trackUserRole();
  }

  goBack() {
    let url:string = '/list-tickets?courseID=' + this.ticketService.getActiveCourse();
    console.log('submit-ticket: url: ' + url);
    this.router.navigateByUrl(url);
  }

  private trackUserRole() {
    this.auth.onGetUserRole().subscribe(response => {
      console.log('saatiin rooli: ' + response);
      this.userRole = response;
    })
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  public sendTicket(): void {
    this.newTicket.otsikko = this.titleText;
    this.newTicket.viesti = this.messageText;
    this.newTicket.ukk = this.isFaq;
    this.newTicket.kentat = [{ id: 1, arvo: this.assignmentText }, { id: 2, arvo: this.problemText }];
    console.log(this.newTicket);
    this.ticketService.addTicket('1', this.newTicket)
      .then(() => {
        this.goBack()
      }).catch( error => {
        console.error(error.message);
      });
  }

}
