import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators
    } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { EditAttachmentsComponent
} from '../components/edit-attachments/edit-attachments.component';
import { AddTicketResponse, KentanTiedot, Liite, TicketService, UusiTiketti
} from '../ticket.service';
import { AuthService } from '../../core/auth.service';
import { Constants, getIsInIframe } from '../../shared/utils';

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
  @Input() public attachmentsMessages: string = '';
  @Input() public fileInfo: FileInfo[] = [];
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;

  private commentID: string | null = null;
  public courseId: string | null = this.route.snapshot.paramMap.get('courseid');
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
              private titleServ: Title)
  {}

  ngOnInit(): void {
    if (this.courseId === null) throw new Error('Kurssi ID puuttuu URL:sta.');
    this.titlePlaceholder = $localize `:@@Otsikko:Otsikko` + '*';

    if (this.ticketId === null) {
      this.titleServ.setTitle(
        Constants.baseTitle + $localize `:@@Uusi kysymys: Uusi kysymys`
      );
      this.fetchAdditionalFields();
    } else {
      this.fetchTicketInfo(this.ticketId);
    }

    this.auth.fetchUserInfo(this.courseId);
    this.auth.trackUserInfo()
    .subscribe(response => { this.userName = response?.nimi ?? ''; });

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

  // TODO: editorin message
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
    if (this.courseId === null) throw new Error('Kurssi ID puuttuu URL:sta.');
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
      this.oldAttachments = response.liitteet ?? [];
      this.commentID = response.kommenttiID;
    });
  }

  public goBack() {
    this.router.navigateByUrl('course/' + this.courseId + '/list-tickets');
  }

  public sendTicket(): void {
    let ticket = this.createTicket();

    if (this.courseId === null) throw new Error('Kurssi ID puuttuu URL:sta.');
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
    .then((response: AddTicketResponse) => {
      if (this.attachments.fileInfoList.length === 0) this.goBack();
      if (response === null || response?.success !== true) {
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
    this.attachments.sendFilesPromise(ticketID, commentID)
    .then((res) => {
      this.state = 'done';
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
