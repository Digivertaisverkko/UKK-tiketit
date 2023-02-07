import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';
import { UusiTiketti, TicketService } from '../ticket.service';
import { getIsInIframe } from '../functions/isInIframe';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})

export class SubmitTicketComponent implements OnDestroy, OnInit {
  // max pituus: 255.
  titleText: string = '';
  assignmentText: string = '';
  public courseName: string = '';
  public errorMessage: string = '';
  // public user: User;
  public isInIframe: boolean;
  problemText: string = '';
  newTicket: UusiTiketti = {} as UusiTiketti;
  public userName: string | null = '';
  userRole: string = '';
  answer: string = '';
  sendingIsAllowed: boolean = false;
  public currentDate = new Date();
  // public user$ = this.auth.trackUserInfo();

  messageSubscription: Subscription;
  public message: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private ticketService: TicketService,
    private _snackBar: MatSnackBar
    ) {
      this.isInIframe = getIsInIframe();
      this.messageSubscription = this.ticketService.onMessages().subscribe(
        (message) => { this._snackBar.open(message, 'OK') });
    }

  ngOnInit(): void {
    const courseID = this.ticketService.getActiveCourse();
    this.auth.fetchUserInfo(courseID);
    this.auth.trackUserInfo().subscribe(response => {
      this.userName = response?.nimi ?? '';
      this.userRole = response?.asema ?? '';
    })
    this.ticketService.getCourseName(courseID).then(response => {
      this.courseName = response;
    }).catch(() => {});
  }

  goBack() {
    let url:string = 'course/' + this.ticketService.getActiveCourse() + '/list-tickets';
    console.log('submit-ticket: url: ' + url);
    this.router.navigateByUrl(url);
  }

  public sendTicket(): void {
    this.newTicket.otsikko = this.titleText;
    this.newTicket.viesti = this.message;
    this.newTicket.kentat = [{ id: 1, arvo: this.assignmentText }, { id: 2, arvo: this.problemText }];
    const courseID = this.ticketService.getActiveCourse();
    console.log(this.newTicket);
    this.ticketService.addTicket(courseID, this.newTicket)
      .then(() => this.goBack()
      ).catch( error => {
        // TODO: lisää eri virhekoodeja?
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
      });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

}
