import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, takeUntil, tap, timer } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TicketService, Tiketti, NewCommentResponse } from '../ticket.service';
import { AuthService, User } from 'src/app/core/auth.service';
import { CommentComponent } from '../components/comment/comment.component';
import { Constants, getIsInIframe } from '../../shared/utils';
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

export class TicketViewComponent implements OnInit, OnDestroy {

  @Input() public attachmentsMessages: string = '';
  @Input() public fileInfoList: FileInfo[] = [];
  @Input() public messagesFromComments: string = '';
  @Input() ticketIdFromParent: string | null = null;
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  public attachFilesText: string = '';
  public cantRemoveTicket: string;
  public commentText: string;
  public courseName: string = '';
  public editingCommentIDParent: string | null = null;
  public errorMessage: string = '';
  public isArchivePressed: boolean = false;
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
  public uploadClick = new Subject<string>();
  public user: User = {} as User;
  public userRole: string = '';
  private fetchTicketsSub: Subscription | null = null;
  private courseID: string | null;
  private isPollingTicket: boolean = false;
  private userName: string = '';
  private readonly CURRENT_DATE = new Date().toDateString();
  private readonly POLLING_RATE_MIN = (environment.production == true) ? 1 : 15;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ticketService: TicketService,
    private titleServ: Title
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

    if (!this.isPollingTicket) this.startPollingTicket();

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.fetchTicketsSub?.unsubscribe();
  }

  public archiveTicket() {
    this.ticketService.archiveTicket(this.ticketID).then(response => {
      if (response?.success === true) {
        this.router.navigateByUrl('/course/' + this.courseID + '/list-tickets');
      } else {
        throw Error
      }
    }).catch(error => {
      if (error?.tunnus == 1003) {
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä
            käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = "Kysymyksen arkistointi ei onnistunut.";
      }
    })
  }

  changeArchiveButton() {
    setTimeout(() => this.isArchivePressed = true, 300);
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

  private fetchTicket(courseID: string | null) {
    // fetchaus sulkee editointiboxin.
    if (this.editingCommentIDParent !== null) return
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
      this.titleServ.setTitle(Constants.baseTitle + response.otsikko);
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
    let url = `/course/${this.courseID}/submit/${this.ticketID}`;
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

  public messageFromComment(event: any) {
    if (event === "fetchTicket") {
      this.fetchTicket(this.courseID);
    } else if (event === "sendingFiles") {
      this.state='sending';
    } else if (event === "done") {
      this.state='editing';
    }
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

  private startPollingTicket() {
  this.fetchTicketsSub?.unsubscribe();
  this.isPollingTicket = true;
  this.fetchTicketsSub = timer(0, this.POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN)
    .pipe(
      takeUntil(this.unsubscribe$),
      tap(() => this.fetchTicket(this.courseID))
    )
    .subscribe();
  }

}
