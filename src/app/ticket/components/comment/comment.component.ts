import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import { Kommentti, TicketService } from '../../ticket.service';
import { AuthService, User } from 'src/app/core/auth.service';
import { EditAttachmentsComponent } from '../edit-attachments/edit-attachments.component';

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
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})

export class CommentComponent {

  @Input() public attachmentsMessages: string = '';
  @Input() public comment: Kommentti = {} as Kommentti;
  @Input() public editingCommentID: string | null = null;
  @Input() public fileInfoList: FileInfo[] = [];
  @Input() public ticketID: string = '';
  @Input() public user: User = {} as User;
  @Output() public editingCommentIDChange = new EventEmitter();
  @Output() public messages = new EventEmitter();
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  public attachFilesText: string = '';
  public editingComment: string | null = null;
  public errorMessage: string = '';
  public isRemovePressed: boolean = false;
  public state: 'editing' | 'sending' | 'done' = 'editing';  // Sivun tila
  public uploadClick = new Subject<string>();

  public readonly proposedSolution = $localize `:@@Ratkaisuehdotus:Ratkaisuehdotus`;
  private readonly CURRENT_DATE = new Date().toDateString();

  constructor(
    private auth: AuthService,
    private ticketService: TicketService
    ) {
      this.user = this.auth.getUserInfo();
      if (this.user.asema === 'opettaja' || this.user.asema ==='admin') {
        this.attachFilesText = $localize `:@@Liitä:liitä`;
      } else {
        this.attachFilesText = $localize `:@@Liitä tiedostoja:Liitä tiedostoja`;
      }
    }

  public cancelCommentEditing() {
    this.stopEditing();
  }

  public editComment(commentID: string) {
    this.editingCommentID = commentID;
    this.editingCommentIDChange.emit(this.editingCommentID);
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

  public removeComment(commentID: string) {
    this.ticketService.removeComment(this.ticketID, commentID).then(res => {
      this.stopEditing();
    }).catch((err: any) => {
      console.log('Kommentin poistaminen epäonnistui.');
    })
  }

  public changeRemoveBtn() {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  public sendComment(commentID: string, commentText: string) {
    this.state = 'sending';
    this.ticketService.editComment(this.ticketID, commentID, commentText)
      .then(response => {
        if (this.fileInfoList.length === 0) {
          this.stopEditing();
          return
        }
        this.sendFiles(this.ticketID, commentID);
        return
      }).catch(err => {
        console.log('Kommentin muokkaaminen epäonnistui.');
      })
  }

  private sendFiles(ticketID: string, commentID: string) {
    this.messages.emit('sendingFiles')
    this.attachments.sendFilesPromise(ticketID, commentID)
      .then((res:any) => {
        console.log('kaikki tiedostot valmiita.');
        this.messages.emit('done')
        this.stopEditing();
      })
      .catch((res:any) => {
        console.log('ticket view: napattiin virhe: ' + res);
        this.errorMessage = $localize `:@@Kaikkien liitteiden lähettäminen
            ei onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut`;
      })
  }

  // Lopeta kommentin 
  private stopEditing() {
    this.state = 'done';
    this.fileInfoList = [];
    this.attachments.clear();
    this.editingCommentID = null;
    this.editingCommentIDChange.emit(this.editingCommentID);
    this.isRemovePressed = false;
    this.messages.emit('fetchTicket');
  }

}
