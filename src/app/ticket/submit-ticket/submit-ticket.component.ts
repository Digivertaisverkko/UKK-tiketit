import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators
    } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { EditAttachmentsComponent
    } from '../components/edit-attachments/edit-attachments.component';
import { AddTicketResponse, Liite, TicketService, UusiTiketti
    } from '../ticket.service';
import { AuthService, User } from '../../core/auth.service';
import { Constants } from '../../shared/utils';

interface AdditionalField {
  id: string;
  otsikko: string;
  arvo: string;
  tyyppi: string;
  ohje: string;
  pakollinen: boolean;
  esitaytettava: boolean;
  valinnat: string[];
}

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
  @Input() public fileInfoList: FileInfo[] = [];
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;

  private commentID: string | null = null;
  public courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public currentDate = new Date();
  public editExisting: boolean = window.history.state.editTicket ?? false;
  public errorMessage: string = '';
  public form: FormGroup = this.buildForm();
  public message: string = '';
  public oldAttachments: Liite[] = [];
  public showConfirm: boolean = false;
  public state: 'editing' | 'sending' | 'done' = 'editing';
  public ticketFields: AdditionalField[] = [];
  public ticketId: string | null = this.route.snapshot.paramMap.get('id');
  public titlePlaceholder: string = '';
  public uploadClick: Subject<string> = new Subject<string>();
  public user: User | null = null;

  get additionalFields(): FormArray {
    return this.form.controls["additionalFields"] as FormArray;
  }

  get title(): FormControl {
    return this.form.get('title') as FormControl;
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
    console.log(1);
    this.auth.trackUserInfo().subscribe(response => {
      if (response?.nimi != null) {
        this.user = response
      }
    });
  }


  private buildAdditionalFields(): void {
    // Luodaan lomakkeelle controllit
    for (const field of this.ticketFields) {
      let validators;
      if (field.pakollinen) {
        validators = Validators.required, Validators.maxLength(50);
      }
      let value = field.arvo !== undefined && field.arvo !== null ? field.arvo : '';
      this.additionalFields.push(new FormControl(value, validators));
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
    ticket.otsikko = this.form.controls['title'].value;
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
      this.ticketFields = response as AdditionalField[];
      this.buildAdditionalFields();
    });
  }

  private fetchTicketInfo(ticketId: string): void {
    this.ticketService.getTicketInfo(ticketId)
    .then(response => {
      this.form.controls['title'].setValue(response.otsikko);
      this.message = response.viesti;
      this.oldAttachments = response.liitteet ?? [];
      this.commentID = response.kommenttiID;
      this.titleServ.setTitle(Constants.baseTitle + response.otsikko);
      this.ticketFields = response.kentat as AdditionalField[];
      this.buildAdditionalFields();
    });
  }

  public goBack(): void {
    this.router.navigateByUrl('course/' + this.courseId + '/list-tickets');
  }

  private prepareSendFiles(response: any): void {
    if (response?.uusi == null) {
      this.errorMessage = 'Liitetiedostojen lähettäminen epäonnistui.';
      throw new Error('Ei tarvittavia tietoja tiedostojen lähettämiseen.');
    }
    let ticketID, commentID;
    ticketID = response.uusi.tiketti;
    commentID = response.uusi.kommentti;
    this.sendFiles(ticketID, commentID);
  }

  public submit(): void {
    this.state = 'sending';
    this.form.disable();
    let newTicket = this.createTicket();
    if (this.courseId === null) throw new Error('Kurssi ID puuttuu URL:sta.');
    if (this.editExisting) {
      this.submitEdited(newTicket);
    } else {
      this.submitNew(newTicket);
    }
  }

  private submitEdited(newTicket: UusiTiketti): void {
    if (this.ticketId === null || this.commentID === null) throw new Error;
    this.ticketService.editTicket(this.ticketId, newTicket)
    .then( () => {
      if (this.oldAttachments.length === 0) this.goBack();
      this.sendFiles(this.ticketId!, this.commentID!);
    })
    .catch(error => {
      this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
          Kysymyksen lähettäminen epäonnistui` + '.';
      this.state = 'editing';
      this.form.enable();
    });
  }

  private submitNew(ticket: UusiTiketti): void {
    if (this.courseId === null) return;
    this.ticketService.addTicket(this.courseId, ticket)
    .then((response: AddTicketResponse) => {
      if (this.attachments.fileInfoList.length === 0) this.goBack();
      if (response === null || response?.success !== true) {
        this.state = 'editing';
        this.form.enable();
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
            Kysymyksen lähettäminen epäonnistui` + '.';
        throw new Error('Kysymyksen lähettäminen epäonnistui.');
      }
      this.prepareSendFiles(response);
    })
    .catch( error => {
      // ? lisää eri virhekoodeja?
      this.state = 'editing';
      this.form.enable();
      this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
          Kysymyksen lähettäminen epäonnistui` + '.';
    });
  }

  private sendFiles(ticketID: string, commentID: string): void {
    this.attachments.sendFilesPromise(ticketID, commentID)
    .then(() => {
      this.state = 'done';
      this.goBack();
    })
    .catch((res: any) => {
      this.errorMessage = $localize`:@@Kaikkien liitteiden lähettäminen ei
          onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut`;
      console.log(this.router.url + ': saatiin virhe: ' + res);
      this.state = 'editing';
      this.form.enable();
    })
    .finally(() => {
      console.log('Komponentti: Kaikki valmiita!');
      // Kommentoi alla olevat, jos haluat, että jää näkyviin.
      // this.attachments.clear();
    });
  }

}
