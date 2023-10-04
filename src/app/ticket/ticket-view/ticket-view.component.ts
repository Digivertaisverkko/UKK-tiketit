import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Validators as EditorValidators } from 'ngx-editor';

import { EditAttachmentsComponent } from '../components/edit-attachments/edit-attachments.component';
import { environment } from 'src/environments/environment';
import { FileInfo, NewCommentResponse, Tiketti } from '../ticket.models';
import schema from '@shared/editor/schema';
import { StoreService } from '@core/services/store.service';
import { TicketService  } from '../ticket.service';
import { User } from '@core/core.models'


/**
 * Yksittäisen tiketin / kysymyksen näkymä. Sisältää kommentin lähettämisen
 * tikettiin. Tikettien lähettämiseen ja muokkaamiseen käytetään submit-ticket -
 * komponenttia.
 *
 * @export
 * @class TicketViewComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})

export class TicketViewComponent implements OnInit, OnDestroy {

  /**
   * view-attachments -komponentilta tulevat viestit.
   *
   * @type {string}
   * @memberof TicketViewComponent
   */
  @Input() public attachmentsMessages: string = '';

  /**
   * Tiketin ID.
   *
   * @type {string}
   * @memberof TicketViewComponent
   */
  @Input() public courseid!: string;

  /**
   * Lista liitetiedostojen tiedoista, view-attachments -komponentilta, jotta
   * ne voidaan kommenttia lisätessä lähettää.
   *
   * @type {FileInfo[]}
   * @memberof TicketViewComponent
   */
  @Input() public fileInfoList: FileInfo[] = [];

  /**
   * Kommentti-komponenteilta tulevia viestejä liitteiden lähettämisen tilasta.
   *
   * @type {string}
   * @memberof TicketViewComponent
   */
  @Input() public messagesFromComments: string = '';
  /* */

  /**
   * Parent komponentilta mahdollisesti tuleva tiketti ID. Saadaan, jos
   * komponentti on upotettuna "Kopioi UKK":ksi -toimintoa käytettäessä.
   *
   * @type {(string | null)}
   * @memberof TicketViewComponent
   */
  @Input() ticketIdFromParent: string | null = null;

  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  public attachFilesText: string = '';
  public editingCommentIDParent: string | null = null;
  public errorMessage: string = '';
  public errorTitle: string = '';
  // Testejä varten, kun ei aina ota käyttöön asetettua localea.
  public errorCode: string = '';
  public form: FormGroup = this.buildForm();
  public isArchivePressed: boolean = false;
  public isEditable: boolean = false;
  public isEditingComment: boolean = false;
  public isLoaded: boolean = false;
  public isPolling: boolean = false;
  public isRemovePressed: boolean = false;
  public newCommentState: 3 | 4 | 5 = 4;
  /* Error state = On jokin virhe, joka estää tiketin näyttämisen ja
     kommentoinnin. */
  public state: 'editing' | 'sending' | 'done' | 'error' = 'editing';  // Sivun tila
  public ticket: Tiketti = {} as Tiketti;
  public ticketID: string;
  public uploadClick = new Subject<string>();
  public user: User | null | undefined;
  // public user: User = {} as User;
  public showConfirm: boolean = false;
  private fetchTicketsSub: Subscription | null = null;
  private readonly POLLING_RATE_MIN = (environment.production == true) ? 1 : 15;
  private unsubscribe$ = new Subject<void>();

  get message(): FormControl {
    return this.form.get('message') as FormControl;
  }

  constructor(
    private formBuilder: FormBuilder,
    private route : ActivatedRoute,  // public testejä varten.
    public router: Router,
    private store : StoreService,
    private ticketService: TicketService,
    private titleServ: Title
  ) {
    this.ticketID = this.ticketIdFromParent !== null
        ? this.ticketIdFromParent
        : String(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.store.trackUserInfo().pipe(
      takeWhile(response => this.user === undefined)
        ).subscribe(response => {
      if (response === null) {
        const route = `/course/${this.courseid}/forbidden`;
        this.router.navigateByUrl(route);
      }
      if (response === undefined ) return
      this.isLoaded = true;
      if (response?.nimi != null) {
        this.user = response;
        if (this.user.asema === null) {
          this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
          this.state = 'error';
          this.isLoaded = true;
        } else {
          if (!this.isPolling) this.startPollingTicket();
        }
      }
      if (this.user?.asema === 'opettaja' || this.user?.asema ==='admin') {
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

  public archiveTicket(ticketID: string, courseID: string) {
    this.ticketService.archiveTicket(ticketID, courseID).then(response => {
      if (response?.success === true) {
        this.router.navigateByUrl('/course/' + courseID + '/list-tickets');
      } else {
        throw Error
      }
    }).catch(error => {
      if (error?.tunnus == 1003) {
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:Kysymyksen asettaminen ratkaistuksi ei onnistunut:
            Kysymyksen asettaminen ratkaistuksi ei onnistunut` + '.';
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
    if (this.user?.asema !== 'opettaja' && this.user?.asema !== 'admin') {
      this.errorMessage = `:@@Ei oikeuksia:Sinulla ei ole tarvittavia käyttäjäoikeuksia` + '.';
    }
    this.attachments.clear();
    const url = `/course/${this.courseid}/submit-faq/${this.ticketID}`;
    this.router.navigate([url], { state: { copiedFromTicket: 'true' } });
  }

  // Hae tiketti ja päivitä näkymän tila.
  public fetchTicket(courseID: string) {
    this.errorMessage = '';
    this.state = 'editing';
    this.errorCode = '';
    // fetchaus sulkee editointiboxin.
    if (this.editingCommentIDParent !== null) return
    this.ticketService.getTicket(this.ticketID, courseID).then(response => {
      if (response === null) {
        this.errorTitle = $localize `:@@Kysymystä ei löytynyt:Kysymystä ei löytynyt`;
        this.errorMessage = $localize`:@@Kysymystä ei ole olemassa:
        Hakemaasi kysymystä ei ole olemassa. Kysymyksen lähettäjä on poistanut sen tai sinulla on virheellinen URL-osoite` + '.';
        this.state = 'error';
        this.errorCode = 'noTicket';
        return
      }
      this.ticket = response;
      if (this.ticket.aloittaja.id === this.user!.id) {
        this.isEditable = true;
      }
      this.titleServ.setTitle(this.store.getBaseTitle() + response.otsikko);
      this.isLoaded = true;
    }).catch(error => {
      this.state = 'error';
      switch (error.tunnus) {
        case 1003:
          this.errorMessage = $localize`:@@Ei oikeutta kysymykseen:
              Sinulla ei ole lukuoikeutta tähän kysymykseen.`;
          break;
        default:
          this.errorMessage = $localize`:@@Kysymyksen näyttäminen epäonnistui:
              Kysymyksen näyttäminen epäonnistui` + '.';
      }
      this.isLoaded = true;
    });
  }

  public editTicket(): void {
    let url = `/course/${this.courseid}/submit/${this.ticketID}`;
    this.router.navigate([url], { state: { editTicket: true } });
  }

  public getCommentState(tila: number) {
    if (this.user === undefined || this.user === null) return
    return this.ticketService.getTicketState(tila, this.user.asema);
  }

  //  Reagoi kommenttikomponenteilta tuleviin viesteihin.
  public listenMessagesFromComment(event: any) {
    if (event === "done") {
      this.isEditingComment = false;
      this.state = 'editing';
      this.fetchTicket(this.courseid!);
    } else if (event === 'editingComment') {
      this.isEditingComment = true
    } else if (event === "sendingFiles") {
      this.state = 'sending';
    } else if (event === "continue") {
      this.state = 'editing';
    }
  }

  public removeTicket(ticketID: string, courseID: string): void {
    this.ticketService.removeTicket(ticketID, courseID).then(response => {
      if (response?.success !== true ) {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:
            Kysymyksen poistaminen ei onnistunut.`;
      } else {
        this.router.navigateByUrl('/course/' + this.courseid + '/list-tickets');
      }
    }).catch(error => {
      if (error?.tunnus == 1003) {
        this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@Kysymyksen poistaminen ei onnistunut:
            Kysymyksen poistaminen ei onnistunut.`;
      }
    })
  }

  public sendComment(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const commentText = this.form.controls['message'].value;
    this.ticketService.addComment(this.ticketID, this.courseid!, commentText,
      this.newCommentState).then(response => {
        if (response == null || response?.success !== true || !this.courseid) {
          this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:
              Kommentin lisääminen kysymykseen epäonnistui.`;
          throw new Error('Kommentin lähettäminen epäonnistui.');
        }
        this.message.setValue('');
        this.form = this.buildForm();
        if (!this.fileInfoList || this.fileInfoList.length === 0) {
          this.fetchTicket(this.courseid);
          return
        }
        response = response as NewCommentResponse;
        const commentID = response.kommentti;
        this.sendFiles(this.ticketID, commentID, this.courseid);
      }).catch(error => {
        this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:
            Kommentin lisääminen kysymykseen epäonnistui.`;
      })
  }

  // Lähetä komenttiin lisätyt liitetiedostot.
  private sendFiles(ticketID: string, commentID: string, courseID: string) {
    this.state = 'sending';
    this.form.disable();
    this.attachments.sendFiles(ticketID, commentID)
      .then((res:any) => {
      })
      .catch((res:any) => {
        this.errorMessage = $localize `:@@Kaikkien liitteiden lähettäminen ei onnistunut:
            Kaikkien liitteiden lähettäminen ei onnistunut`;
      })
      .finally(() => {
        this.fileInfoList = [];
        this.attachments.clear();
        this.state = 'editing';
        this.form.enable();
        this.fetchTicket(this.courseid!);
      })
  }

  private startPollingTicket() {
    const pollRate = this.POLLING_RATE_MIN * this.store.getMsInMin();
    this.fetchTicketsSub?.unsubscribe();
    this.isPolling = true;
    this.fetchTicketsSub = timer(0, pollRate)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => this.fetchTicket(this.courseid!))
      )
      .subscribe();
    }

}
