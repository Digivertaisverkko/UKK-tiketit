import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators
  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthService } from 'src/app/core/auth.service';
import { KentanTiedot, Liite, TicketService, UusiTiketti, AddTicketResponse
        } from 'src/app/ticket/ticket.service';
import { Constants, getIsInIframe } from '../../shared/utils';
import { EditAttachmentsComponent } from '../components/edit-attachments/edit-attachments.component';
import { Title } from '@angular/platform-browser';

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
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})

export class SubmitTicketComponent implements OnInit {
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  @Input() public fileInfo: FileInfo[] = [];
  @Input() public attachmentsMessages: string = '';
  private commentID: string | null = null;
  private courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public courseName: string = '';
  public currentDate = new Date();
  public editExisting: boolean = window.history.state.editTicket ?? false;
  public errorMessage: string = '';
  public isInIframe: boolean = getIsInIframe();
  public message: string = '';
  public oldAttachments: Liite[] = [];
  public state: 'editing' | 'sending' | 'done' = 'editing';
  public ticketFields: KentanTiedot[] = [];
  public ticketForm: FormGroup = this.buildForm();
  public ticketId: string | null = this.route.snapshot.paramMap.get('id');
  public titlePlaceholder: string = '';
  public uploadClick: Subject<string> = new Subject<string>();
  public userName: string | null = '';

  get additionalFields(): FormArray {
    return this.ticketForm.controls["additionalFields"] as FormArray;
  }

  get title(): FormControl {
    return this.ticketForm.get('title') as FormControl;
  }

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private ticketService: TicketService,
              private titleServ: Title
              )
  {}

  ngOnInit(): void {
    this.titleServ.setTitle(Constants.baseTitle + $localize `:@@Uusi kysymys:
        UUsi kysymys`);
    this.titlePlaceholder = $localize `:@@Otsikko:Otsikko` + '*';
    if (this.courseId === null) throw new Error('Ei kurssi ID:ä.');
    this.auth.fetchUserInfo(this.courseId);
    this.auth.trackUserInfo().subscribe(response => {
      this.userName = response?.nimi ?? '';
    });
    this.ticketService.getCourseName(this.courseId).then(response => {
      this.courseName = response;
    }).catch(() => {
    });

    if (this.ticketId === null) {
      this.fetchAdditionalFields();
    } else {
      this.fetchTicketInfo(this.ticketId);
    }
  }

  private buildAdditionalFields(): void {
    // Luodaan lomakkeelle controllit
    for (const field of this.ticketFields) {
      let validators;
      if (field.pakollinen) {
        validators = Validators.required, Validators.maxLength(50);
      }
      this.additionalFields.push(new FormControl('', validators));
    }
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ])
      ],
      additionalFields: this.formBuilder.array([])
    });
  }

  private createTicket(): UusiTiketti {
    let ticket: UusiTiketti = {} as UusiTiketti;
    ticket.otsikko = this.ticketForm.controls['title'].value;
    ticket.viesti = this.message;
    ticket.kentat = [];
    for (let i = 0; i < this.ticketFields.length; i++) {
      ticket.kentat.push({
        id: Number(this.ticketFields[i].id),
        arvo: this.additionalFields.controls[i].value
      });
    }
    return ticket;
  }

  private fetchAdditionalFields(): void {
    if (this.courseId == null) throw new Error('Ei kurssi ID:ä.');
    this.ticketService.getTicketFieldInfo(this.courseId)
    .then((response) => {
      this.ticketFields = response as KentanTiedot[];
      this.buildAdditionalFields();
    });
  }

  // TODO: lisäkenttien muokkaaminen, kun backend tarjoaa rajapinnan niiden hakemiseen
  private fetchTicketInfo(ticketId: string): void {
    this.ticketService.getTicketInfo(ticketId)
    .then(response => {
      this.ticketForm.controls['title'].setValue(response.otsikko);
      this.message = response.viesti;
      this.commentID = response.kommenttiID;
      this.oldAttachments = response.liitteet ?? [];
    }).catch(e => {});
  }

  public goBack() {
    this.router.navigateByUrl('course/' + this.courseId + '/list-tickets');
  }

  // public focusNext(nextInput: ElementRef) {
  //   nextInput.nativeElement.focus()
  // }

  public focusNext() {
    // element.dispatchEvent(new KeyboardEvent('keydown', {altKey: true}))
/*     var form = event.target.closest('form');
    var index = Array.prototype.indexOf.call(form, event.target);
    form.elements[index + 1].focus(); */
  }

  public sendTicket(): void {
    let ticket = this.createTicket();

    if (this.courseId == null) { throw new Error('Ei kurssi ID:ä.'); }
    if (this.ticketId != null) {
      this.submitEditedTicket(ticket);
    } else {
      this.submitNewTicket(ticket);
    }
  }

  private submitEditedTicket(ticket: UusiTiketti) {
    if (this.ticketId === null) return;
    this.ticketService.editTicket(this.ticketId, ticket)
      .then( () => {
        if (this.oldAttachments.length === 0) this.goBack();
        if (this.ticketId === null || this.commentID === null) throw Error;
        this.sendFiles(this.ticketId, this.commentID);
      }
      ).catch(error => {
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
            Kysymyksen lähettäminen epäonnistui` + '.';
        this.state = 'editing';
        this.ticketForm.enable();
      });
  }

  private submitNewTicket(ticket: UusiTiketti) {
    if (this.courseId === null) return;
    this.ticketService.addTicket(this.courseId, ticket)
    .then(response => {
      if (this.attachments.fileInfoList.length === 0) this.goBack();
      if (response == null || response?.success !== true) {
        this.state = 'editing';
        this.ticketForm.enable();
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
            Kysymyksen lähettäminen epäonnistui` + '.';
        throw new Error('Kysymyksen lähettäminen epäonnistui.');
      }
      if (response?.uusi == null) {
        this.errorMessage = 'Liitetiedostojen lähettäminen epäonnistui.';
        throw new Error('Ei tarvittavia tietoja tiedostojen lähettämiseen.');
      }
      response = response as AddTicketResponse;
      const ticketID = response.uusi.tiketti;
      const commentID = response.uusi.kommentti;
      this.sendFiles(ticketID, commentID);
    }).catch( error => {
      // ? lisää eri virhekoodeja?
      this.state = 'editing';
      this.ticketForm.enable();
      this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
          Kysymyksen lähettäminen epäonnistui` + '.';
    });
  }

  private sendFiles(ticketID: string, commentID: string) {
    this.state = 'sending';
    this.ticketForm.disable();
    this.attachments.sendFilesPromise(ticketID, commentID).
      then((res) => {
        this.goBack();
      })
    .catch((res: any) => {
      this.errorMessage = $localize `:@@Kaikkien liitteiden lähettäminen
          ei onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut`;
      console.log('submit-ticket: saatiin virhe: ' + res);
      this.state = 'editing';
      this.ticketForm.enable();
    })
    .finally(() => {
      console.log('Komponentti: Kaikki valmiita!');
      // Kommentoi alla olevat, jos haluat, että jää näkyviin.
      // this.attachments.clear();
    });
  }

}
