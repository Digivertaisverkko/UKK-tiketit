import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TicketService, Tiketti, NewCommentResponse } from '../ticket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from 'src/app/core/auth.service';
import { Subject, timer } from 'rxjs';
import { getIsInIframe } from '../functions/isInIframe';
import { environment } from 'src/environments/environment';
import { EditAttachmentsComponent } from '../components/edit-attachments/edit-attachments.component';

interface FileInfo {
  filename: string;
  file: File;
  error?: string;
  errorToolTip?: string;
  progress?: number;
  uploadError?: string;
  done?: boolean;
}

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})

export class TicketViewComponent implements OnInit {

  @Input() public attachmentsMessages: string = '';
  @Input() public fileInfoList: FileInfo[] = [];
  @Input() ticketIdFromParent: string | null = null;
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  public attachFilesText: string = '';
  public cantRemoveTicket: string;
  public commentText: string;
  public courseName: string = '';
  public editingComment: string | null = null;
  public errorMessage: string = '';
  public isEditable: boolean = false;
  public isInIframe: boolean;
  public isLoaded: boolean;
  public isRemovable: boolean = false;
  public isRemovePressed: boolean = false;
  public message: string = '';
  public newCommentState: 3 | 4 | 5 = 4;
  public readonly proposedSolution = $localize `:@@Ratkaisuehdotus:Ratkaisuehdotus`;
  public state: 'editing' | 'sending' | 'done' = 'editing';  // Sivun tila
  public ticket: Tiketti;
  public ticketID: string;
  public tila: string;  // Tiketin tila
  public uploadClick: Subject<string> = new Subject<string>();
  public user: User = {} as User;
  public userRole: string = '';
  private courseID: string | null;
  private userName: string = '';
  private readonly CURRENT_DATE = new Date().toDateString();
  private readonly POLLING_RATE_MIN = (environment.production == true) ? 1 : 15;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ticketService: TicketService,
  ) {
    this.cantRemoveTicket = $localize `:@@Ei voi poistaa kysymystä:
        Kysymystä ei voi poistaa, jos siihen on tullut kommentteja` + '.'
    this.commentText = '';
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.isInIframe = getIsInIframe();
    this.isLoaded = false;
    this.ticket = {} as Tiketti;
    this.ticketID = this.ticketIdFromParent !== null
    ? this.ticketIdFromParent
    : String(this.route.snapshot.paramMap.get('id'));
    this.tila = '';
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
    this.pollTickets(this.courseID);
  }

  public cancelCommentEditing() {
    this.editingComment = null;
  }

  public editComment(commentID: string) {
    this.editingComment = commentID;
  }

  private pollTickets(courseID: string) {
    const MILLISECONDS_IN_MIN = 60000;
    timer(0, this.POLLING_RATE_MIN * MILLISECONDS_IN_MIN)
      .subscribe(() => {
        if (this.courseID) this.fetchTickets(courseID)}
      );
  }

  private fetchTickets(courseID: string | null) {
    this.ticketService.getTicketInfo(this.ticketID).then(response => {
      this.ticket = response;
      if (this.userName.length == 0) {
        if (courseID !== null) this.auth.fetchUserInfo(courseID);
      }
      this.tila = this.ticketService.getTicketState(this.ticket.tila);
      if (this.ticket.aloittaja.id === this.user.id) {
        this.isEditable = true;
        this.isRemovable = this.ticket.kommentit.length === 0 ? true : false;
      }
      this.isLoaded = true;
    }).catch(error => {
      switch (error.tunnus) {
        case 1003:
          this.errorMessage = $localize`:@@Ei oikeutta kysymykseen:
              Sinulla ei ole lukuoikeutta tähän kysymykseen.`;
          break;
        default:
          this.errorMessage = $localize`:@@Kysymyksen näyttäminen epäonnistui:
              Kysymyksen näyttäminen epäonnistui`;
      }
      this.isLoaded = true;
    });
  }

  public editTicket() {
    let url = '/course/' + this.courseID + '/submit/' + this.ticketID;
    this.router.navigate([url], { state: { editTicket: 'true' } });
  }

  public removeTicket() {
    this.ticketService.removeTicket(this.ticketID).then(response => {
      if (response === false ) {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:
            Kysymyksen poistaminen ei onnistunut.`;
      } else {
        this.router.navigateByUrl('/course/' + this.courseID + '/list-tickets');
      }
    }).catch(error => {
      if (error?.tunnus == 1003) {
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä
            käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:
            Kysymyksen poistaminen ei onnistunut.`;
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
    this.attachments.clear();
    this.router.navigateByUrl(`/course/${this.courseID}/submit-faq/${this.ticketID}`);
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

  public getCommentState(tila: number) {
    return this.ticketService.getTicketState(tila);
  }

  public sendEditedComment(commentID: string, commentText: string) {
    this.ticketService.editComment(this.ticketID, commentID, commentText)
      .then(response => {
      }).catch(err => {
        console.log('Kommentin muokkaaminen epäonnistui.');
      }).finally(() => {
        this.editingComment = null;
        this.fetchTickets(this.courseID);
      })
    console.log('sending');
  }

  public sendComment(): void {
    this.ticketService.addComment(this.ticketID, this.commentText, this.newCommentState)
      .then(response => {
        if (response == null || response?.success !== true) {
          this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:
              Kommentin lisääminen tikettiin epäonnistui.`;
          throw new Error('Kommentin lähettäminen epäonnistui.');
        }
        this.commentText = '';
        if (this.fileInfoList.length === 0) {
          this.ticketService.getTicketInfo(this.ticketID).then(response => {
            this.ticket = response
          });
          this.state = 'editing';
          return
        }
        response = response as NewCommentResponse;
        const commentID = response.kommentti;
        this.sendFiles(this.ticketID, commentID);
      }).catch(error => {
        this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:
            Kommentin lisääminen tikettiin epäonnistui.`;
      })
  }

  private sendFiles(ticketID: string, commentID: string) {
    this.state = 'sending';
    this.attachments.sendFilesPromise(ticketID, commentID)
      .then((res:any) => {
        console.log('ticket view: vastaus: ' + res);
      })
      .catch((res:any) => {
        console.log('ticket view: napattiin virhe: ' + res);
        this.errorMessage = $localize `:@@Kaikkien liitteiden lähettäminen
            ei onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut`;
      })
      .finally(() => {
        console.log('kaikki valmista');
        this.state = 'done';
        this.fileInfoList = [];
        this.attachments.clear();
        this.ticketService.getTicketInfo(this.ticketID).then(response => {
          this.ticket = response;
        });
        this.state = 'editing';
      })
  }

}
