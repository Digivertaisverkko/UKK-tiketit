import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, takeUntil, tap, timer } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TicketService, Tiketti, NewCommentResponse } from '../ticket.service';
import { AuthService, User } from 'src/app/core/auth.service';
import { CommentComponent } from '../components/comment/comment.component';
import { Constants, getIsInIframe, isToday } from '../../shared/utils';
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
  public commentText: string = '';
  public courseName: string = '';
  public editingCommentIDParent: string | null = null;
  public errorMessage: string = '';
  public isArchivePressed: boolean = false;
  public isEditable: boolean = false;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isRemovable: boolean = false;
  public isRemovePressed: boolean = false;
  public message: string = '';
  public newCommentState: 3 | 4 | 5 = 4;
  public state: 'editing' | 'sending' | 'done' = 'editing';  // Sivun tila
  public ticket: Tiketti = {} as Tiketti;;
  public ticketID: string;
  public uploadClick = new Subject<string>();
  public user: User = {} as User;
  private fetchTicketsSub: Subscription | null = null;
  private courseID: string | null;
  private isPollingTicket: boolean = false;
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
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.isInIframe = getIsInIframe();
    this.ticketID = this.ticketIdFromParent !== null
    ? this.ticketIdFromParent
    : String(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.startLoading();
    this.auth.trackUserInfo().subscribe(response => {
      if (response.id != null) this.user = response;
      if (this.user.asema === 'opettaja' || this.user.asema ==='admin') {
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
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = "Kysymyksen arkistointi ei onnistunut.";
      }
    })
  }

  // Jotkin painikkeet muuttuvat yhden painalluksen jälkeen vahvistuspainikkeiksi.
  changeButton(button: 'archive' | 'remove') {
    setTimeout(() => {
      if (button === 'archive') {
        this.isArchivePressed = true
      } else if (button === 'remove') {
        this.isRemovePressed = true
      }
    }, 300);
  }

  public copyAsFAQ() {
    // Jos on vaihtunut toisessa sessiossa, niin ei ole päivittynyt.
    if (this.user.asema !== 'opettaja' && this.user.asema !== 'admin') {
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
      if (this.user.nimi.length == 0) {
        if (courseID !== null) this.auth.fetchUserInfo(courseID);
      }
      if (this.ticket.aloittaja.id === this.user.id) {
        this.isEditable = true;
        this.isRemovable = this.ticket.kommentit.length === 0 ? true : false;
      }
      this.titleServ.setTitle(Constants.baseTitle + response.otsikko);
      this.stopLoading();
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
      this.stopLoading();
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
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä äyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:
            Kysymyksen poistaminen ei onnistunut.`;
      }
    })
  }

  public getSenderTitle(name: string, role: string): string {
    if (name == this.user.nimi) return $localize`:@@Minä:Minä`
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

  public isToday(timestamp: string | Date) : boolean {
    return isToday(timestamp)
  }

  public getCommentState(tila: number) {
    return this.ticketService.getTicketState(tila, this.user.asema);
  }

  public messageFromComment(event: any) {
    if (event === "done") {
      this.fetchTicket(this.courseID);
    } else if (event === "sendingFiles") {
      this.state='sending';
    } else if (event === "continue") {
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
      })
      .catch((res:any) => {
        this.errorMessage = $localize `:@@Kaikkien liitteiden lähettäminen ei onnistunut:
            Kaikkien liitteiden lähettäminen ei onnistunut`;
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
    const pollRate = this.POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN;
    this.fetchTicketsSub?.unsubscribe();
    this.isPollingTicket = true;
    this.fetchTicketsSub = timer(0, pollRate)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => this.fetchTicket(this.courseID))
      )
      .subscribe();
    }

}
