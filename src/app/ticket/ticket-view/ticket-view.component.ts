import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TicketService, Tiketti } from '../ticket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from 'src/app/core/auth.service';
import { interval, startWith, Subject, switchMap } from 'rxjs';
import { getIsInIframe } from '../functions/isInIframe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})

export class TicketViewComponent implements OnInit {

  @Input() ticketIdFromParent: string | null = null;
  @Input() public fileList: File[] = [];
  @Input() public attachmentsHasErrors: boolean = false;
  @Input() public clearList: boolean = false;
  public uploadClick: Subject<void> = new Subject<void>();

  public attachFilesText: string = '';
  public commentText: string;
  public courseName: string = '';
  public errorMessage: string = '';
  public isEditable: boolean = false;
  public isInIframe: boolean;
  public isLoaded: boolean;
  public isRemovable: boolean = false;
  public isRemovePressed: boolean = false;
  public message: string = '';
  public newCommentState: 3 | 4 | 5 = 4;
  public proposedSolution = $localize `:@@Ratkaisuehdotus:Ratkaisuehdotus`;
  public ticket: Tiketti;
  public ticketID: string;
  public tila: string;
  public user: User = {} as User;
  public userRole: string = '';
  private userName: string = '';
  private courseID: string | null;
  private readonly POLLING_RATE_MIN = (environment.production == true) ? 1 : 15;   // Ticket info polling rate in minutes.
  private readonly CURRENT_DATE = new Date().toDateString();

  constructor(
    private auth: AuthService,
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.ticket = {} as Tiketti;
    this.tila = '';
    this.commentText = '';
    this.isInIframe = getIsInIframe();
    this.isLoaded = false;
    this.ticketID = this.ticketIdFromParent !== null
      ? this.ticketIdFromParent
      : String(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.auth.trackUserInfo().subscribe(response => {
      if (response.id != null) this.user = response;
      if (response.asema !== undefined ) this.userRole = response.asema;
      if (response.nimi !== undefined ) this.userName = response.nimi;
      if (this.userRole === 'opettaja' || this.userRole ==='admin') {
        this.attachFilesText = $localize `:@@Liitä:liitä`;
      } else {
        this.attachFilesText = $localize `:@@Liitä tiedostoja:Liitä tiedostoja`;
      }
    });
    if (this.courseID === null) {
      throw new Error('Kurssi ID puuttuu URL:sta.');
    }
    this.ticketService.getCourseName(this.courseID).then(response => {
      this.courseName = response;
    });
    this.pollTickets();
  }

  private pollTickets() {
    // FIXME: kasvatettu pollausväliä, muuta ennen käyttäjätestausta.
    const MILLISECONDS_IN_MIN = 60000;
    interval(this.POLLING_RATE_MIN * MILLISECONDS_IN_MIN)
      .pipe(
        startWith(0),
        switchMap(() => this.ticketService.getTicketInfo(this.ticketID))
      ).subscribe({
        next: response => {
          this.ticket = response;
          if (this.userName.length == 0) {
            if (this.courseID !== null) this.auth.fetchUserInfo(this.courseID);
          }
          this.tila = this.ticketService.getTicketState(this.ticket.tila);
          if (this.ticket.aloittaja.id === this.user.id) {
            this.isEditable = true;
            this.isRemovable = this.ticket.kommentit.length === 0 ? true : false;
          }
          console.log(' onko editoitavissa: ' + this.isEditable);
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

  public editTicket() {
    let url = '/course/' + this.courseID + '/submit/' + this.ticketID;
    this.router.navigate([url], { state: { editTicket: 'true' } });
  }

  public removeTicket() {
    this.ticketService.removeTicket(this.ticketID).then(response => {
      if (response === false ) {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:Kysymyksen poistaminen ei onnistunut.`;
      } else {
        this.router.navigateByUrl('/course/' + this.courseID + '/list-tickets');
      }
    }).catch(error => {
      if (error?.tunnus == 1003) {
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:Kysymyksen poistaminen ei onnistunut.`;
      }
    })
  }

  changeRemoveButton() {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  public copyAsFAQ() {
    // Jos on vaihtunut toisessa sessiossa, niin ei ole päivittynyt.
    if (this.userRole !== 'opettaja' && this.userRole !== 'admin') {
      this.errorMessage = `:@@Ei oikeuksia:Sinulla ei ole tarvittavia käyttäjäoikeuksia` + '.';
    }
    this.router.navigateByUrl('/course/' + this.courseID + '/submit-faq/' + this.ticketID);
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
    this.ticketService.addComment(this.ticketID, this.commentText, this.fileList, this.newCommentState)
      .then(response => {
        if (response?.success == true) {
          this.errorMessage = '';
          this.ticketService.getTicketInfo(this.ticketID).then(response => { this.ticket = response });
          // this._snackBar.open($localize `:@@Kommentin lisääminen:Kommentin lisääminen tikettiin onnistui.`, 'OK');
        } else {
          this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`;
          console.log(response);
        }
      })
      .then( () => {
        this.commentText = '';
        this.fileList = [];
      })
      .catch(error => {
        this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`;
      }).finally(() => {

      });
  }

  // public goSubmitFaqWithId(): void {
  //   let url:string = '/submit-faq/' + this.ticketID;
  //   console.log('submit-faq: url: ' + url);
  //   this.router.navigateByUrl(url);
  // }
}
