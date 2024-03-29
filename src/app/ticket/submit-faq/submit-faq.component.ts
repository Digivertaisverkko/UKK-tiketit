import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Validators as EditorValidators } from 'ngx-editor';
import { Subject } from 'rxjs';

import { AddTicketResponse, FileInfo, Kentta, Liite, Tiketti, UusiUKK }
    from '@ticket/ticket.models';
import { CourseService } from '@course/course.service';
import { EditAttachmentsComponent }
    from '@ticket/components/edit-attachments/edit-attachments.component';
import schema from '@shared/editor/schema';
import { StoreService } from '@core/services/store.service';
import { TicketService } from '@ticket/ticket.service';

/**
 * Näkymä uuden UKK:n lähettämiseen tai vanhan muokkaamiseen.
 *
 * @export
 * @class SubmitFaqComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-submit-faq',
  templateUrl: './submit-faq.component.html',
  styleUrls: ['./submit-faq.component.scss']
})

export class SubmitFaqComponent implements OnInit {
  @Input() public attachmentsMessages: string = '';
  @Input() public courseid!: string;
  @Input() public fileInfoList: FileInfo[] = [];
  @Input() public id!: string;
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;

  // Muokataanko jo aiemmin lisättyä UKK:a.
  public editExisting: boolean = window.history.state.editFaq ?? false;
  public errorMessage: string = '';
  public form: FormGroup = this.buildForm();
  public isFaqSent: boolean = false;
  public oldAttachments: Liite[] = [];
  public originalTicket: Tiketti | undefined;
  public showConfirm: boolean = false;
  public state: 'editing' | 'sending' = 'editing';
  public ticketid!: string;
  public ticketFields: Kentta[] = [];
  // Kokonaan uutta tikettiä tehtäessä ticketId voi olla asetettu, jos
  // UKK on kopioitu tiketistä.
  public titlePlaceholder: string = '';
  public uploadClick = new Subject<string>();
  private errorForListing: string | undefined;
  private isCopiedFromTicket: boolean = window.history.state.copiedFromTicket ?? false;

  get additionalFields(): FormArray {
    return this.form.controls["additionalFields"] as FormArray;
  }

  get answer(): FormControl {
    return this.form.get('answer') as FormControl;
  }

  get title(): FormControl {
    return this.form.get('title') as FormControl;
  }

  get question(): FormControl {
    return this.form.get('question') as FormControl;
  }

  constructor(private courses: CourseService,
              private formBuilder: FormBuilder,
              private router: Router,
              private store: StoreService,
              private ticketService: TicketService,
              private titleServ: Title)
  {}

  ngOnInit(): void {
    this.ticketid = this.id;
    this.titlePlaceholder = $localize `:@@Otsikko:Otsikko` + '*';

    if (!this.ticketid) {
      this.titleServ.setTitle(
        this.store.getBaseTitle() + $localize `:@@Uusi UKK:Uusi UKK`
      );
      this.fetchAdditionalFields();
    } else {
      this.fetchTicketInfo(this.ticketid, this.courseid);
    }
  }

  private buildAdditionalFields(): void {
    /* Luodaan lomakkeelle controllit
    HUOM! UKK:lla ei ole pakollisia kenttiä */
    for (const field of this.ticketFields) {
      let validators = Validators.maxLength(50);
      let value = field.arvo ? field.arvo : '';
      this.additionalFields.push(new FormControl(value, validators));
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
      additionalFields: this.formBuilder.array([]),
      question: [
        '',
        Validators.compose([
          EditorValidators.required(schema),
          Validators.maxLength(100000)
        ])
      ],
      answer: [
        '',
        Validators.compose([
          EditorValidators.required(schema),
          Validators.maxLength(100000)
        ])
      ],
      attachments: ['']
    });
  }

  private createFaq(): UusiUKK {
    let faq: UusiUKK = {} as UusiUKK;
    faq.otsikko = this.form.controls['title'].value;
    faq.viesti = this.form.controls['question'].value;
    faq.vastaus = this.form.controls['answer'].value;
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
    this.courses.getTicketFieldInfo(this.courseid)
    .then((response) => {
      this.ticketFields = response.kentat as Kentta[];
      this.buildAdditionalFields();
    });
  }

  private fetchTicketInfo(ticketId: string, courseId: string): void {
    this.ticketService.getTicket(ticketId, courseId).then(response => {
      if (response === null) {
        return
      }
      this.form.controls['title'].setValue(response.otsikko);
      this.form.controls['question'].setValue(response.viesti);
      // kommentit[0] on vastaus, johon UKK:n liitteet on osoitettu.
      if (!this.isCopiedFromTicket) {
        this.oldAttachments = response.kommentit[0]?.liitteet ?? [];
      }
      this.originalTicket = response;
      this.titleServ.setTitle(this.store.getBaseTitle() + response.otsikko);
      this.ticketFields = response.kentat as Kentta[];
      this.buildAdditionalFields();

      /* Käydään läpi kaikki kommentit ja asetetaan tilan 5 eli
      "Ratkaisuehdotuksen" omaava kommentti oletusvastaukseksi. Lopputuloksena
      viimeinen ratkaisuehdotus jää oletusvastaukseksi. */

      if (this.editExisting) { 
          this.form.controls['answer'].setValue(response.kommentit[0]?.viesti ?? '');
      } else {
        for (let comment of response.kommentit) {
          if (comment.tila === 5) {
            this.form.controls['answer'].setValue(comment.viesti);
          }
        }
      }
    });
  }

  public goBack(): void {
    if (this.errorForListing) {
      const route = 'course/' + this.courseid + '/list-tickets';
      const data = { error: this.errorForListing };
      this.router.navigate([route], { state: data });
    } else {
      this.router.navigateByUrl('course/' + this.courseid + '/list-tickets');
    }
  }

  private prepareSendFiles(response?: AddTicketResponse): void {
    if (!this.editExisting && response?.uusi == null) {
      this.errorMessage = $localize`:@@Kaikkien liitteiden lähettäminen ei
        onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut`;
      throw new Error('Ei tarvittavia tietoja tiedostojen lähettämiseen.');
    }
    let ticketID, commentID;
    if (!this.editExisting) {
      ticketID = response!.uusi.tiketti;
      commentID = response!.uusi.kommentti;
    } else {
      ticketID = this.ticketid;
      commentID = this.originalTicket?.kommentit[0].id;
      if (ticketID == null || commentID == null) {
        throw Error('Ei tarvittavia tietoja liitteiden lähettämiseen.');
      }
    }
    this.sendFiles(ticketID, commentID);
  }

  public submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.state = 'sending';
    this.form.disable();
    let newFaq: UusiUKK = this.createFaq();
    if (this.courseid === null) throw new Error('Kurssi ID puuttuu URL:sta.');
    // Ei voi ticketID:n perusteella tehdä, kun kopioidessa UKK:ksi se on olemassa.
    if (this.editExisting) {
      if (!this.ticketid) return
      this.submitEditedFAQ(newFaq, this.ticketid);
    } else {
      this.submitNewFAQ(newFaq);
    }
  }

  private submitEditedFAQ(faq: UusiUKK, ticketId: string): void {
    this.ticketService.editFaq(ticketId, faq, this.courseid)
      .then((response: { success: boolean }) => {
        if (response === null || response?.success !== true) {
          throw new Error('UKK:n muokkaaminen epäonnistui.');
        }
        if (this.attachments.filesToRemove.length === 0) {
          return true
        }
        return this.attachments.removeSentFiles();
      }).then((res: boolean) => {
        if (res === false) {
          this.errorForListing = $localize `:@@Kaikkien liitetiedostojen poistaminen ei onnistunut:Kaikkien valittujen liitetiedostojen poistaminen ei onnistunut` + '.';
        }
        if (this.attachments.fileInfoList.length === 0) this.goBack();
        this.isFaqSent = true;
        this.prepareSendFiles();
      })
      .catch(() => {
        this.state = 'editing';
        this.form.enable();
        this.errorMessage = $localize`:@@UKK muokkaaminen epäonnistui:
            Usein kysytyn kysymyksen muokkaaminen ei onnistunut` + '.';
      });
  }

  private submitNewFAQ(faq: UusiUKK): void {
    // Uuteen tikettiin tarvitaan kurssi-id, jos muokataan vanhaa, niin ticketID.
    this.ticketService.addFaq(faq, this.courseid)
      .then((response: AddTicketResponse) => {
        if (this.attachments.fileInfoList.length === 0) this.goBack();
        if (response === null || response?.success !== true) {
          throw new Error('Kysymyksen lähettäminen epäonnistui.');
        }
        this.isFaqSent = true;
        this.prepareSendFiles(response);
      })
      .catch(() => {
        this.state = 'editing';
        this.form.enable();
        this.errorMessage = $localize`:@@UKK lisääminen epäonnistui:
            Usein kysytyn kysymyksen lähettäminen epäonnistui` + '.';
      });
  }

  private sendFiles(ticketID: string, commentID: string): void {
    this.attachments.sendFiles(ticketID, commentID)
    .then(() => {
      this.goBack()
    })
    .catch((res: any) => {
      this.errorMessage = $localize`:@@Kaikkien liitteiden lähettäminen ei
          onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut`;
      this.state = 'editing';
      this.form.enable();
    })
  }

}
