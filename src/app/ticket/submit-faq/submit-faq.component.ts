import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from 'src/app/core/auth.service';
import { UusiUKK, TicketService, Tiketti, Error } from '../ticket.service';
import { getIsInIframe } from '../functions/isInIframe';

@Component({
  selector: 'app-submit-faq',
  templateUrl: './submit-faq.component.html',
  styleUrls: ['./submit-faq.component.scss']
})
export class SubmitFaqComponent implements OnInit {

  public courseName: string = '';
  public currentDate = new Date();
  public faqAnswer: string = '';
  public faqAssignment: string = '';
  public faqMessage: string = '';
  public faqProblem: string = '';
  public faqTitle: string = '';
  public isInIframe: boolean;
  public originalTicket: Tiketti | undefined;
  public userName: string = '';
  public editExisting: boolean;
  public errorMessage: string = '';
  // public user$ = this.authService.trackUserInfo();
  private courseID: string | null;
  public ticketId: string | null = this.activatedRoute.snapshot.paramMap.get('id');

  constructor(
    private _snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
    ) {
      this.courseID = this.route.snapshot.paramMap.get('courseid');
      this.isInIframe = getIsInIframe();
      this.editExisting = window.history.state.editFaq ?? false;
  }

  ngOnInit(): void {
    console.log('editoidaan UKK:a: '+ this.editExisting);
    this.isInIframe = getIsInIframe();
    if (this.courseID === null) {
      throw new Error('Kurssi ID puuttuu URL:sta.');
    }
    this.authService.trackUserInfo().subscribe(response => {
      this.userName = response?.nimi;
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
          if (String(response.kurssi) !== this.courseID) {
            this.courseID = String(response.kurssi);
            this.authService.fetchUserInfo(this.courseID);
            this.ticketService.getCourseName(this.courseID)
              .then( response => { this.courseName = response })
              .catch( error => {});
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
    this.ticketService.getCourseName(this.courseID)
      .then( response => { this.courseName = response })
      .catch( error => {});
  }

  // ngOnDestroy(): void {

  // }

  private goBack(): void {
    this.router.navigateByUrl('course/' + this.courseID +  '/list-tickets');
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
    if (this.courseID === null) throw new Error('Ei kurssi ID:ä.');
    let id = this.editExisting ? this.ticketId ?? '' : this.courseID;
    this.ticketService.sendFaq(id, newFaq, this.editExisting)
      .then(() => { this.goBack() })
      .catch( (error: Error) => {
        if (error.tunnus == 1003) {
          this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
        } else {
          this.errorMessage = $localize `:@@UKK lisääminen epäonnistui:Usein kysytyn kysymyksen lähettäminen epäonnistui` + '.';
        }
      });
  }

}
