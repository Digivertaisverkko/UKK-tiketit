import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Validators as EditorValidators } from 'ngx-editor';
import { Subject, Subscription, takeUntil, tap, timer } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { TicketService  } from '../ticket.service';
import { AuthService } from 'src/app/core/auth.service';
import { Constants } from '../../shared/utils';
import { environment } from 'src/environments/environment';
import { EditAttachmentsComponent } from '../components/edit-attachments/edit-attachments.component';
import { User } from '../../core/core.models'
import { FileInfo, NewCommentResponse, Tiketti } from '../ticket.models';
import { StoreService } from 'src/app/core/store.service';

import schema from '../../shared/editor/schema';

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
  public editingCommentIDParent: string | null = null;
  public errorMessage: string = '';
  public form: FormGroup = this.buildForm();
  public isArchivePressed: boolean = false;
  public isEditable: boolean = false;
  public isEditingComment: boolean = false;
  public isLoaded: boolean = false;
  public isRemovable: boolean = false;
  public isRemovePressed: boolean = false;
  public newCommentState: 3 | 4 | 5 = 4;
  public state: 'editing' | 'sending' | 'done' = 'editing';  // Sivun tila
  public ticket: Tiketti = {} as Tiketti;
  public ticketID: string;
  public uploadClick = new Subject<string>();
  public user: User = {} as User;
  public showConfirm: boolean = false;
  private fetchTicketsSub: Subscription | null = null;
  private courseID: string | null;
  private isPolling: boolean = false;
  private readonly POLLING_RATE_MIN = (environment.production == true) ? 1 : 15;
  private unsubscribe$ = new Subject<void>();

  get message(): FormControl {
    return this.form.get('message') as FormControl;
  }

  constructor(
    private auth : AuthService,
    private formBuilder: FormBuilder,
    private route : ActivatedRoute,
    private router: Router,
    private store: StoreService,
    private ticketService: TicketService,
    private titleServ: Title
  ) {
    this.cantRemoveTicket = $localize `:@@Ei voi poistaa kysymystä:
        Kysymystä ei voi poistaa, jos siihen on tullut kommentteja` + '.'
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.ticketID = this.ticketIdFromParent !== null
    ? this.ticketIdFromParent
    : String(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.store.trackUserInfo().subscribe(response => {
      if (response?.id != null) {
        this.user = response;
        if (!this.isPolling) this.startPollingTicket();
      }
      if (this.user.asema === 'opettaja' || this.user.asema ==='admin') {
        this.attachFilesText = $localize `:@@Liitä:liitä`;
      } else {
        this.attachFilesText = $localize `:@@Liitä tiedostoja:Liitä tiedostoja`;
      }
    });

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

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      message: [
        '',
        Validators.compose([
          EditorValidators.required(schema),
          Validators.maxLength(100000)
        ])
      ],
      attachments: ['']
    });
  }

  // Jotkin painikkeet muuttuvat yhden painalluksen jälkeen vahvistuspainikkeiksi.
  public changeButton(button: 'archive' | 'remove') {
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
    console.log('haetaan tiketin tiedot.');
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
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä äyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:
            Kysymyksen poistaminen ei onnistunut.`;
      }
    })
  }

  public getCommentState(tila: number) {
    return this.ticketService.getTicketState(tila, this.user.asema);
  }

  public listenMessagesFromComment(event: any) {
    if (event === "done") {
      this.isEditingComment = false;
      this.fetchTicket(this.courseID);
    } else if (event === 'editingComment') {
      this.isEditingComment = true
    } else if (event === "sendingFiles") {
      this.state='sending';
    } else if (event === "continue") {
      this.state='editing';
    }
  }

  public sendComment(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const commentText = this.form.controls['message'].value;
    this.ticketService.addComment(this.ticketID, commentText, this.newCommentState)
      .then(response => {
        if (response == null || response?.success !== true) {
          this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:
              Kommentin lisääminen tikettiin epäonnistui.`;
          throw new Error('Kommentin lähettäminen epäonnistui.');
        }
        this.message.setValue('');
        this.form = this.buildForm();
        if (this.fileInfoList.length === 0) {
          this.ticketService.getTicketInfo(this.ticketID).then(response => {
            this.ticket = response
          });
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
    this.form.disable();
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
        this.form.enable();
      })
  }

  private startPollingTicket() {
    const pollRate = this.POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN;
    this.fetchTicketsSub?.unsubscribe();
    this.isPolling = true;
    this.fetchTicketsSub = timer(0, pollRate)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => this.fetchTicket(this.courseID))
      )
      .subscribe();
    }

}
