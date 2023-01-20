import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';
import { NewFaq, TicketService } from '../ticket.service';

@Component({
  selector: 'app-submit-faq',
  templateUrl: './submit-faq.component.html',
  styleUrls: ['./submit-faq.component.scss']
})
export class SubmitFaqComponent implements OnDestroy, OnInit {

  public courseName: string = '';
  public currentDate = new Date();
  public faqAnswer: string = '';
  public faqAssignment: string = '';
  public faqMessage: string = '';
  public faqProblem: string = '';
  public faqTitle: string = '';
  public userName: string | null = '';

  private courseId: string = '';
  private messageSubscription: Subscription;

  constructor(
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    private ticketService: TicketService,
    ) {
      this.messageSubscription = this.ticketService.onMessages().subscribe(
        message => { this._snackBar.open(message, 'OK') });
  }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.courseId = this.ticketService.getActiveCourse();
    this.ticketService.getCourseName(this.courseId).then(response => {
      this.courseName = response;
    }).catch(error => {
      console.error(error.message);
    });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  private goBack(): void {
    let url:string = '/list-tickets?courseID=' + this.ticketService.getActiveCourse();
    console.log('submit-ticket: url: ' + url);
    this.router.navigateByUrl(url);
  }

  public sendFaq(): void {
    const newFaq: NewFaq = {
      otsikko: this.faqTitle,
      viesti: this.faqMessage,
      kentat: [
        { id: 1, arvo: this.faqAssignment },
        { id: 2, arvo: this.faqProblem }
      ],
      vastaus: this.faqAnswer,
    }

    console.log(newFaq);

    this.ticketService.sendFaq(this.courseId, newFaq)
      .then(() => { this.goBack() })
      .catch(error => {
        console.error(error.message);
      });
  }

}
