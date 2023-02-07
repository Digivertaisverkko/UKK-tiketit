import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TicketService, Tiketti } from '../ticket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/auth.service';
import { interval, startWith, switchMap } from 'rxjs';
import { getIsInIframe } from '../functions/isInIframe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {
  public courseName: string = '';
  public errorMessage: string = '';
  public isInIframe: boolean;
  public ticket: Tiketti;
  public tila: string;
  public newCommentState: 3 | 4 | 5 = 4;
  public commentText: string;
  public isLoaded: boolean;
  public proposedSolution = $localize `:@@Ratkaisuehdotus:Ratkaisuehdotus`;
  public ticketID: string;
  // Ticket info polling rate in minutes.
  private readonly POLLING_RATE_MIN = (environment.production == true) ? 1 : 15;
  private readonly CURRENT_DATE = new Date().toDateString();

  public message: string = '';
  public userRole: string = '';
  private userName: string = '';

  constructor(
    private auth: AuthService,
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar
    ) {
      this.ticket = {} as Tiketti;
      this.tila = '';
      this.commentText = '';
      this.isInIframe = getIsInIframe();
      this.isLoaded = false;
      this.ticketID = String(this.route.snapshot.paramMap.get('id'));
      // this.messageSubscription = this.ticketService.onMessages().subscribe(
      //   (message) => { this._snackBar.open(message, 'OK') });
  }

  ngOnInit(): void {
    this.auth.trackUserInfo().subscribe(response => {
        if (response.asema !== undefined ) this.userRole = response.asema;
        if (response.nimi !== undefined ) this.userName = response.nimi;
    });
    // FIXME: kasvatettu pollausväliä, muuta ennen käyttäjätestausta.
    interval(this.POLLING_RATE_MIN * 60 * 1000)
      .pipe(
        startWith(0),
        switchMap(() => this.ticketService.getTicketInfo(this.ticketID))
      ).subscribe({
        next: response => {
          this.ticket = response;
          this.ticketService.setActiveCourse(String(this.ticket.kurssi));
          if (this.userName.length == 0) {
            this.auth.fetchUserInfo(String(this.ticket.kurssi));
          }
          this.tila = this.ticketService.getTicketState(this.ticket.tila);
          this.ticketService.getCourseName(String(this.ticket.kurssi)).then(response => {
            console.log(' saatiin vastaus: ' + response);
            this.courseName = response;
          });
          this.isLoaded = true;
        },
        error: error => {
          switch (error.tunnus) {
            case 1003:
              this.errorMessage = $localize`:@@Ei oikeutta kysymykseen:Sinulla ei ole lukuoikeutta tähän kysymykseen.`;
              break;
            default:
              this.errorMessage = $localize`:@@Kysymyksen näyttäminen epäonnistui:Kysymyksen näyttäminen epäonnistui`;
          }
          this.isLoaded = true;
        }
      })
  }
  
  public copyAsFAQ() {
    if (this.userRole !== 'opettaja' && this.userRole !== 'admin') {
      this.errorMessage = `:@@Ei oikeuksia: Sinulla ei ole tarvittavia käyttäjäoikeuksia` + '.';
    }
    this.router.navigateByUrl('/submit-faq/' + this.ticketID);
  }




  public getSenderTitle(name: string, role: string): string {
    if (name == this.userName) return $localize`:@@Minä:Minä`
    switch (role) {
      case 'opiskelija':
        return $localize`:@@Opiskelija:Opiskelija`; break;
      case 'opettaja':
        return $localize`:@@Opettaja:Opettaja`; break;
      case 'admin':
        return $localize`:@@Admin:Admin`; break;
      default:
        return '';
    }
  }

  // Onko annettu aikaleima tänään.
  public isToday(timestamp: string | Date) : boolean {
    if (typeof timestamp === 'string') {
      var dateString = new Date(timestamp).toDateString();
    } else {
      var dateString = timestamp.toDateString();
    }
    // console.log(' vertaillaan: ' + dateString + ' ja ' + this.currentDate);
    return dateString == this.CURRENT_DATE ? true : false
  }

  // private trackUserRole() {
  //   this.auth.onGetUserRole().subscribe(response => {
  //     // console.log('saatiin rooli: ' + response);
  //     this.userRole = response;
  //   })
  // }

  public getCommentState(tila: number) {
    return this.ticketService.getTicketState(tila);
  }

  public sendComment(): void {
    this.ticketService.addComment(this.ticketID, this.commentText, this.newCommentState)
      .then((response) => {
        if (response?.success == true) {
          this.errorMessage = '';
          this.ticketService.getTicketInfo(this.ticketID).then(response => { this.ticket = response });
          // this._snackBar.open($localize `:@@Kommentin lisääminen:Kommentin lisääminen tikettiin onnistui.`, 'OK');
        } else {
          this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`;
          console.log(response);
        }
      })
      .then( () => { this.commentText = '' } )
      .catch(error => {
        this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`;
      });
  }

  // public goSubmitFaqWithId(): void {
  //   let url:string = '/submit-faq/' + this.ticketID;
  //   console.log('submit-faq: url: ' + url);
  //   this.router.navigateByUrl(url);
  // }
}
