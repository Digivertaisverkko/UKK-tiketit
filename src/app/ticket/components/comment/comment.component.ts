import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild }
    from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Validators as EditorValidators } from 'ngx-editor';
import { Subject, Subscription } from 'rxjs';

import { TicketService } from '@ticket/ticket.service';
import { EditAttachmentsComponent } from '../edit-attachments/edit-attachments.component';
import { getCourseIDfromURL } from '@shared/utils';
import { isToday } from '@shared/utils';
import { FileInfo, Kommentti } from '@ticket//ticket.models';
import { User } from '@core/core.models';
import { StoreService } from '@core/services/store.service';

import schema from '@shared/editor/schema';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})

export class CommentComponent implements AfterViewInit{

  @Input() public attachmentsMessages: string = '';
  @Input() public comment: Kommentti = {} as Kommentti;
  @Input() public editingCommentID: string | null = null;
  @Input() public fileInfoList: FileInfo[] = [];
  @Input() public ticketID: string = '';
  @Input() public sender: User | null = null;
  // Lähettää ID:n, mitä kommenttia editoidaan.
  @Output() public editingCommentIDChange = new EventEmitter<string | null>();
  // Välittää ennen kaikkea tiedon, onko tiedostojen lataus käynnissä.
  @Output() public messages = new EventEmitter<string>();
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  public attachFilesText: string = '';
  public editingComment: string | null = null;
  public form: FormGroup = this.buildForm();
  public errorMessage: string = '';
  public isRemovePressed: boolean = false;
  public state: 'editing' | 'sending' | 'done' = 'editing';  // Sivun tila
  public strings: Map<string, string>;
  public uploadClick = new Subject<string>();
  public user: User | null;

  get message(): FormControl {
    return this.form.get('message') as FormControl;
  }

  constructor(
    private formBuilder: FormBuilder,
    private store: StoreService,
    private ticketService: TicketService
  ) {
      this.user = this.store.getUserInfo();
      this.strings = new Map ([
        ['attach', $localize `:@@Liitä:Liitä` ],
        ['attachFiles', $localize `:@@Liitä tiedostoja:Liitä tiedostoja`],
      ]);
      this.attachFilesText = this.strings.get('attachFiles')!;
  }

  ngAfterViewInit(): void {
    this.trackWhenEditing();
  }


  private buildForm(): FormGroup {
    return this.formBuilder.group({
      message: [
        '',
        Validators.compose([
          EditorValidators.required(schema),
          Validators.maxLength(100000)
        ])
      ],
      checkboxes: [ this.comment.tila ],
      attachments: ['']
    });
  }

  public changeRemoveBtn() {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  public editComment(commentID: string) {
    this.editingCommentID = commentID;
    this.editingCommentIDChange.emit(this.editingCommentID);
    this.form.controls['message'].setValue(this.comment.viesti);
    this.form.controls['checkboxes'].setValue(this.comment.tila);
  }

  public getSenderTitle(name: string, role: string | null): string {
    if (name == this.sender?.nimi) return $localize`:@@Minä:Minä`
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

  public isToday(timestamp: string | Date) {
    return isToday(timestamp);
  }

  public removeComment(commentID: string) {
    const courseID = getCourseIDfromURL();
    if (!courseID) return
    this.ticketService.removeComment(this.ticketID, commentID, courseID).then(res => {
      this.stopEditing();
    }).catch((err: any) => {
      this.errorMessage = $localize `:@@Kommentin poistaminen ei onnistunut:
          Kommentin poistaminen ei onnistunut`+ '.';
      this.state="editing";
    })
  }

  public sendComment(commentID: string) {
    this.form.markAllAsTouched();
    const courseID = getCourseIDfromURL();
    if (this.form.invalid || !courseID) return;
    this.state = 'sending';
    this.form.disable();
    const commentText = this.form.controls['message'].value;
    const commentState = this.form.controls['checkboxes'].value;
    this.ticketService.editComment(this.ticketID, commentID, commentText,
        commentState, courseID)
      .then(() => {
        if (this.fileInfoList.length === 0) {
          this.stopEditing();
          return
        }
        this.sendFiles(this.ticketID, commentID);
        return
      }).catch(err => {
        console.log('Kommentin muokkaaminen epäonnistui.');
        this.errorMessage = $localize `:@@Kommentin muokkaaminen epäonnistui:
            Kommentin muokkaaminen epäonnistui` + '.';
        this.state="editing";
        this.form.enable();
        this.messages.emit('continue')
      })
  }

  private sendFiles(ticketID: string, commentID: string) {
    this.messages.emit('sendingFiles')
    this.attachments.sendFiles(ticketID, commentID)
      .then((res:any) => {
        console.log('kaikki tiedostot valmiita.');
        this.stopEditing();
      })
      .catch((res:any) => {
        console.log('ticket view: napattiin virhe: ' + res);
        this.errorMessage = $localize `:@@Kaikkien liitteiden lähettäminen ei onnistunut:
            Kaikkien liitteiden lähettäminen ei onnistunut` + '.';
        this.state="editing";
        this.form.enable();
        this.messages.emit('continue')
      })
  }

  // Lopeta kommentin editointi.
  public stopEditing() {
    this.state = 'done';
    this.fileInfoList = [];
    this.attachments.clear();
    this.editingCommentID = null;
    this.editingCommentIDChange.emit(null);
    this.isRemovePressed = false;
    this.messages.emit('done');
  }

  private trackWhenEditing() {
    const sub: Subscription = this.form.valueChanges.subscribe(() => {
      if (this.form.dirty) {
        this.messages.emit('editingComment');
        sub.unsubscribe();
      }
    })
  }

}
