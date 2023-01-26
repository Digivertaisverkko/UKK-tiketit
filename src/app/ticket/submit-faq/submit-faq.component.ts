import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from 'src/app/core/auth.service';
import { UusiUKK, TicketService, Kommentti, Tiketti } from '../ticket.service';

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
  public originalTicket: Tiketti | undefined;
  // public userName: string | null = '';
  public userName: string = '';
  // public user$ = this.authService.trackUserInfo();

  private courseId: string = this.ticketService.getActiveCourse();
  private messageSubscription: Subscription;
  private ticketId: string | null = this.activatedRoute.snapshot.paramMap.get('id');

  constructor(
    private _snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private ticketService: TicketService,
    ) {
      this.messageSubscription = this.ticketService.onMessages().subscribe(
        message => { this._snackBar.open(message, 'OK') });
  }

  ngOnInit(): void {
    this.authService.trackUserInfo().subscribe(response => {
      if (response.nimi !== null) this.userName = response.nimi;
    })
    if (this.ticketId !== null) {
      this.ticketService.getTicketInfo(this.ticketId)
        .then((response) => {
          this.originalTicket = response;
          // Valitaan oletusvastaukseksi ensimmäinen kommentti, jonka tila on "ratkaisuehdotus", eli tila 5.
          for (let comment of response.kommentit) {
            if (comment.tila === 5) {
              this.faqAnswer = comment.viesti;
            }
          }
          if (String(response.kurssi) !== this.courseId) {
            this.courseId = String(response.kurssi);
            this.ticketService.setActiveCourse(String(this.courseId));
            this.ticketService.getCourseName(this.courseId)
              .then( response => { this.courseName = response })
              .catch( error => { console.error(error.message) });
          }
          this.faqMessage = response.viesti;
          this.faqTitle = response.otsikko;
          if (response.kentat !== undefined ) {
            for (let kentta of response.kentat) {
              switch (kentta.otsikko) {
                case 'Ongelman tyyppi':
                  this.faqProblem = kentta.arvo;
                  break;
                case 'Tehtävä':
                  this.faqAssignment = kentta.arvo;
                  break;
              }
            }
          }
        });
    }

    this.ticketService.getCourseName(this.courseId)
      .then( response => { this.courseName = response })
      .catch( error => { console.error(error.message) });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  public getSenderTitle(name: string, role: string): string {
    if (name === this.authService.getUserName2()) {
      return $localize`:@@Minä:Minä`
    }
    switch (role) {
      case 'opiskelija':
        return $localize`:@@Opiskelija:Opiskelija`;
      case 'opettaja':
        return $localize`:@@Opettaja:Opettaja`;
      case 'admin':
        return $localize`:@@Admin:Admin`;
      default:
        return '';
    }
  }

  private goBack(): void {
    let url:string = '/list-tickets?courseID=' + this.courseId;
    console.log('submit-ticket: url: ' + url);
    this.router.navigateByUrl(url);
  }

  // Onko annettu aikaleima tänään.
  public isToday(timestamp: string | Date): boolean {
    let currentDate = new Date().toDateString();
    let dateString = typeof timestamp === 'string' ? new Date(timestamp).toDateString() : timestamp.toDateString();
    return dateString === currentDate ? true : false;
  }

  public sendFaq(): void {
    const newFaq: UusiUKK = {
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
