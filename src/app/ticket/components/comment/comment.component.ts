import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild }
    from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Validators as EditorValidators } from 'ngx-editor';
import { Subject, Subscription } from 'rxjs';

import { EditAttachmentsComponent } from '../edit-attachments/edit-attachments.component';
import { FileInfo, Kommentti } from '@ticket//ticket.models';
import { StoreService } from '@core/services/store.service';
import { TicketService } from '@ticket/ticket.service';
import { User } from '@core/core.models';

import schema from '@shared/editor/schema';

/**
 * Näyttää yhden kommentin. Kommenttia voi muokata tai sen voi poistaa.
 *
 * @export
 * @class CommentComponent
 * @implements {AfterViewInit}
 * @implements {OnInit}
 */
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})

export class CommentComponent implements AfterViewInit, OnInit{

  @Input() public attachmentsMessages: string = '';

  /**
   * Näytettävä kommentti.
   *
   * @type {Kommentti}
   * @memberof CommentComponent
   */
  @Input() public comment: Kommentti = {} as Kommentti;

  /**
   * Kurssi ID.
   *
   * @type {string}
   * @memberof CommentComponent
   */
  @Input() public courseid!: string;

  /**
   * Jos käyttäjä editoi kommenttia, editoitavan kommentin ID.
   *
   * @type {(string | null)}
   * @memberof CommentComponent
   */
  @Input() public editingCommentID: string | null = null;

  /**
   * Lista liitetiedostoissa, jos sellaisia kommenttiin on liitetty.
   *
   * @type {FileInfo[]}
   * @memberof CommentComponent
   */
  @Input() public fileInfoList: FileInfo[] = [];

  /**
   * Tiketin ID, johon kommentti on liitetty.
   *
   * @type {string}
   * @memberof CommentComponent
   */
  @Input() public ticketID: string = '';

  /**
   * Onko kyseessä "Kopioi UKK:ksi" näkymä. Tällöin näytetään alkuperäinen tiketti,
   * johon UKK perustuu ja muokkauksen poistaminen on pois käytöstä.
   *
   * @type {boolean}
   * @memberof CommentComponent
   */
  @Input() public isInCopyAsFAQ: boolean = false;

  /**
   * Kun kommenttia muokataan, lähetetään sen ID parent komponentille.
   *
   * @memberof CommentComponent
   */
  @Output() public editingCommentIDChange = new EventEmitter<string | null>();

  /**
   * Välittää ennen kaikkea tiedon, onko tiedostojen lataus käynnissä.
   *
   * @memberof CommentComponent
   */
  @Output() public messages = new EventEmitter<string>();

  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  public attachFilesText: string = '';
  public editingComment: string | null = null;
  public form: FormGroup = this.buildForm();
  public errorMessage: string = '';
  public isRemovePressed: boolean = false;
  public sender: User = {} as User;
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

  ngOnInit(): void {
    this.sender = this.comment.lahettaja;

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

  public removeComment(commentID: string) {
    if (!this.courseid) return
    this.ticketService.removeComment(this.ticketID, commentID, this.courseid).then(res => {
      this.stopEditing();
    }).catch((err: any) => {
      this.errorMessage = $localize `:@@Kommentin poistaminen ei onnistunut:
          Kommentin poistaminen ei onnistunut`+ '.';
      this.state="editing";
    })
  }

  public sendComment(commentID: string) {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.courseid) return;
    this.state = 'sending';
    this.form.disable();
    const commentText = this.form.controls['message'].value;
    const commentState = this.form.controls['checkboxes'].value;
    this.ticketService.editComment(this.ticketID, commentID, commentText,
      commentState, this.courseid).then(() => {
        if (this.attachments.filesToRemove.length === 0) {
          return true
        }
        return this.attachments.removeSentFiles();
      })
      .then((res: boolean) => {
        if (res === false) {
          this.errorMessage = $localize `:@@Kaikkien liitetiedostojen poistaminen ei onnistunut:Kaikkien valittujen liitetiedostojen poistaminen ei onnistunut` + '.';
        }
        if (this.fileInfoList.length === 0) {
          this.stopEditing();
          return
        }
        this.sendFiles(this.ticketID, commentID);
        return
      }).catch(err => {
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
        this.stopEditing();
      })
      .catch((res:any) => {
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
