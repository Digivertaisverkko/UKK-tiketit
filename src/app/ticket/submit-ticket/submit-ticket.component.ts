import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators as EditorValidators } from 'ngx-editor';
import { Observable, Subject } from 'rxjs';

import { User } from '@core/core.models'
import { StoreService } from '@core/store.service';
import { CourseService } from 'src/app/course/course.service';
import schema from 'src/app/shared/editor/schema';
import { Constants } from 'src/app/shared/utils';
import { EditAttachmentsComponent }
    from 'src/app/ticket/components/edit-attachments/edit-attachments.component';
import { AddTicketResponse, FileInfo, Kentta, Liite, UusiTiketti }
    from 'src/app/ticket/ticket.models';
import { TicketService } from 'src/app/ticket/ticket.service';

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
  public readonly courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public readonly currentDate = new Date();
  public editExisting: boolean = window.history.state.editTicket ?? false;
  public errorMessage: string = '';
  public form: FormGroup = this.buildForm();
  public oldAttachments: Liite[] = [];
  public showConfirm: boolean = false;
  public state: 'editing' | 'sending' | 'done' = 'editing';
  public successMessage: string = '';
  public ticketFields: Kentta[] = [];
  public ticketId: string | null = this.route.snapshot.paramMap.get('id');
  public titlePlaceholder: string = '';
  public uploadClick = new Subject<string>();
  public user$: Observable<User | null>;

  get additionalFields(): FormArray {
    return this.form.controls["additionalFields"] as FormArray;
  }

  get message(): FormControl {
    return this.form.get('message') as FormControl;
  }

  get title(): FormControl {
    return this.form.get('title') as FormControl;
  }

  constructor(private courses: CourseService,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private store: StoreService,
              private ticketService: TicketService,
              private titleServ: Title
              ) {
    this.user$ = this.store.trackUserInfo();
  }

  ngOnInit(): void {
    if (this.courseId === null) throw new Error('Kurssi ID puuttuu URL:sta.');
    this.titlePlaceholder = $localize `:@@Otsikko:Otsikko` + '*';

    if (this.ticketId === null) {
      this.titleServ.setTitle(
        Constants.baseTitle + $localize `:@@Uusi kysymys: Uusi kysymys`
      );
      this.fetchAdditionalFields();
    } else {
      this.fetchTicketInfo(this.ticketId, this.courseId);
    }
  }

  private buildAdditionalFields(): void {
    // Luodaan lomakkeelle controllit
    for (const field of this.ticketFields) {
      let validators = Validators.maxLength(50);
      if (field.pakollinen) {
        validators = Validators.required, Validators.maxLength(50);
      }
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
      message: [
        '',
        Validators.compose([
          EditorValidators.required(schema),
          Validators.maxLength(100000)
        ])
      ],
      attachments: [''],
    });
  }

  private createTicket(): UusiTiketti {
    let ticket: UusiTiketti = {} as UusiTiketti;
    ticket.otsikko = this.form.controls['title'].value;
    ticket.viesti = this.form.controls['message'].value;
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
    this.courses.getTicketFieldInfo(this.courseId)
    .then((response) => {
      this.ticketFields = response as Kentta[];
      this.buildAdditionalFields();
    });
  }

  private fetchTicketInfo(ticketId: string, courseID: string): void {
    this.ticketService.getTicket(ticketId, courseID)
    .then(response => {
      this.form.controls['title'].setValue(response.otsikko);
      this.form.controls['message'].setValue(response.viesti);
      this.oldAttachments = response.liitteet ?? [];
      this.commentID = response.kommenttiID;
      this.titleServ.setTitle(Constants.baseTitle + response.otsikko);
      this.ticketFields = response.kentat as Kentta[];
      this.buildAdditionalFields();
    });
  }

  public goBack(): void {
    this.router.navigateByUrl('course/' + this.courseId + '/list-tickets');
  }

  private prepareSendFiles(response: any): void {
    if (!this.courseId) return
    if (response?.uusi == null) {
      this.errorMessage = 'Liitetiedostojen lähettäminen epäonnistui.';
      throw new Error('Ei tarvittavia tietoja tiedostojen lähettämiseen.');
    }
    let ticketID, commentID;
    ticketID = response.uusi.tiketti;
    commentID = response.uusi.kommentti;
    this.sendFiles(ticketID, commentID, this.courseId);
  }

  public submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
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
    if (!this.ticketId || !this.commentID || !this.courseId) throw new Error;
    this.ticketService.editTicket(this.ticketId, newTicket, this.courseId)
    .then( () => {
      if (this.oldAttachments.length === 0) this.goBack();
      this.successMessage = $localize `:@@Muokatun kysymyksen lähettäminen onnistui:
      Muokatun kysymyksen lähettäminen onnistui` + '.';
      if (!this.courseId) return
      this.sendFiles(this.ticketId!, this.commentID!, this.courseId);
    })
    .catch(error => {
      this.errorMessage = $localize `:@@Muokatun kysymyksen lähettäminen epäonnistui:
          Muokatun kysymyksen lähettäminen epäonnistui` + '.'
      this.state = 'editing';
      this.form.enable();
    });
  }

  private submitNew(ticket: UusiTiketti): void {
    if (this.courseId === null) return;
    this.ticketService.addTicket(this.courseId, ticket)
    .then((response: AddTicketResponse) => {
      console.warn('uusi');
      if (this.attachments.fileInfoList.length === 0) this.goBack();
      if (response === null || response?.success !== true) {
        this.state = 'editing';
        this.form.enable();
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
            Kysymyksen lähettäminen epäonnistui` + '.';
        throw new Error('Kysymyksen lähettäminen epäonnistui.');
      } else if (response?.success === true) {
        this.successMessage = $localize `:@@Uuden kysymyksen lähettäminen onnistui:
            Uuden kysymyksen lähettäminen onnistui` + '.';
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

  private sendFiles(ticketID: string, commentID: string, courseID: string): void {
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
