import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators
    } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { EditAttachmentsComponent
    } from '../components/edit-attachments/edit-attachments.component';
import { AddTicketResponse, Liite, TicketService, Tiketti,
    UusiUKK } from '../ticket.service';
import { AuthService } from '../../core/auth.service';
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
  selector: 'app-submit-faq',
  templateUrl: './submit-faq.component.html',
  styleUrls: ['./submit-faq.component.scss']
})

export class SubmitFaqComponent implements OnInit {
  @Input() public attachmentsMessages: string = '';
  @Input() public fileInfoList: FileInfo[] = [];
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;

  public courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public editExisting: boolean = window.history.state.editFaq ?? false;
  public errorMessage: string = '';
  public faqAnswer: string = '';
  public faqMessage: string = '';
  public form: FormGroup = this.buildForm();
  public oldAttachments: Liite[] = [];
  public originalTicket: Tiketti | undefined;
  public showConfirm: boolean = false;
  public state: 'editing' | 'sending' | 'done' = 'editing';
  public ticketFields: AdditionalField[] = [];
  public ticketId: string | null = this.route.snapshot.paramMap.get('id');
  public titlePlaceholder: string = '';
  public uploadClick: Subject<string> = new Subject<string>();

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
        Constants.baseTitle + $localize `:@@Uusi UKK:Uusi UKK`
      );
      this.fetchAdditionalFields();
    } else {
      this.fetchTicketInfo(this.ticketId);
    }
  }

  private buildAdditionalFields(): void {
    /* Luodaan lomakkeelle controllit
    HUOM! UKK:lla ei ole pakollisia kenttiä */
    for (const field of this.ticketFields) {
      let validators = Validators.maxLength(50);
      let value = field.arvo !== undefined && field.arvo !== null ? field.arvo : '';
      this.additionalFields.push(new FormControl(value, validators));
    }
  }

  // TODO: editorin faqMessage ja faqAnswer
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

  private createFaq(): UusiUKK {
    let faq: UusiUKK = {} as UusiUKK;
    faq.otsikko = this.form.controls['title'].value;
    faq.viesti = this.faqMessage;
    faq.vastaus = this.faqAnswer;
    faq.kentat = [];
    for (let i = 0; i < this.ticketFields.length; i++) {
      faq.kentat.push({
        id: Number(this.ticketFields[i].id),
        arvo: this.additionalFields.controls[i].value
      });
    }
    return faq;
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
      this.faqMessage = response.viesti;
      // 1. kommentti on vastaus, johon UKK:n liitteet on osoitettu.
      this.oldAttachments = response.kommentit[0]?.liitteet ?? [];
      this.originalTicket = response;
      this.titleServ.setTitle(Constants.baseTitle + response.otsikko);
      this.ticketFields = response.kentat as AdditionalField[];
      this.buildAdditionalFields();

      /* Käydään läpi kaikki kommentit ja asetetaan tilan 5 eli
      "Ratkaisuehdotuksen" omaava kommentti oletusvastaukseksi. Lopputuloksena
      viimeinen ratkaisuehdotus jää oletusvastaukseksi. */
      for (let comment of response.kommentit) {
        if (comment.tila === 5) {
          this.faqAnswer = comment.viesti;
        }
      }

      if (String(response.kurssi) !== this.courseId) {
        this.courseId = String(response.kurssi);
        this.auth.fetchUserInfo(this.courseId);
      }
    });
  }

  public goBack(): void {
    this.router.navigateByUrl('course/' + this.courseId + '/list-tickets');
  }

  private prepareSendFiles(response: any): void {
    if (!this.editExisting && response?.uusi == null) {
      this.errorMessage = 'Liitetiedostojen lähettäminen epäonnistui.';
      throw new Error('Ei tarvittavia tietoja tiedostojen lähettämiseen.');
    }
    let ticketID, commentID;
    if (!this.editExisting) {
      ticketID = response.uusi.tiketti;
      commentID = response.uusi.kommentti;
    } else {
      commentID = this.originalTicket?.kommentit[0].id;
      ticketID = this.ticketId;
      if (ticketID == null || commentID == null) {
        throw Error('Ei tarvittavia tietoja liitteiden lähettämiseen.');
      }
    }
    this.sendFiles(ticketID, commentID);
  }

  public submit(): void {
    if (this.form.invalid) return;
    this.state = 'sending';
    this.form.disable();
    let newFaq: UusiUKK = this.createFaq();
    if (this.courseId === null) throw new Error('Kurssi ID puuttuu URL:sta.');
    this.submitNew(newFaq);
  }

  private submitNew(faq: UusiUKK): void {
    if (this.courseId === null) return;
    let id = this.editExisting ? this.ticketId ?? '' : this.courseId;
    this.ticketService.addFaq(id, faq, this.editExisting)
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
      this.errorMessage = $localize`:@@UKK lisääminen epäonnistui:
          Usein kysytyn kysymyksen lähettäminen epäonnistui` + '.';
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
