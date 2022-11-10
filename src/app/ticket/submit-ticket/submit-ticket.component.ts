import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NewTicket, TicketService } from '../ticket.service';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})
export class SubmitTicketComponent implements OnInit {
  titleText: string = '';
  assignmentText: string = '';
  problemText: string = '';
  messageText: string = '';

  newTicket: NewTicket = {} as NewTicket;

  display: FormControl = new FormControl("", Validators.required);

  constructor(
    private router: Router,
    private ticketService: TicketService) {
  }

  ngOnInit(): void {
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
