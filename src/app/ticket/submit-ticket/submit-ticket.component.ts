import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from 'src/app/core/auth.service';
import { UusiTiketti, TicketService } from '../ticket.service';

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
  // public user: User;
  problemText: string = '';
  messageText: string = '';
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
      this.messageSubscription = this.ticketService.onMessages().subscribe(
        (message) => { this._snackBar.open(message, 'OK') });

    }

  ngOnInit(): void {
    const courseID = this.ticketService.getActiveCourse();
    this.auth.trackUserInfo().subscribe(response => {
      if (response.nimi !== null) this.userName = response.nimi;
      if (response.asema !== null) this.userRole = response.asema;
    })
    // if (this.auth.getUserName2.length == 0) {
    //   this.auth.saveUserInfo(String(courseID));
    // }
    this.ticketService.getCourseName(courseID).then(response => {
      this.courseName = response;
    }).catch(() => {});
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

  public sendTicket(): void {
    this.newTicket.otsikko = this.titleText;
    this.newTicket.viesti = this.message;
    this.newTicket.kentat = [{ id: 1, arvo: this.assignmentText }, { id: 2, arvo: this.problemText }];
    const courseID = this.ticketService.getActiveCourse();
    console.log(this.newTicket);
    this.ticketService.addTicket(courseID, this.newTicket)
      .then(() => {
        this.goBack()
      }).catch( error => {
        console.error(error.message);
      });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

}
