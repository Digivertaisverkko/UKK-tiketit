import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants, getIsInIframe } from '../../shared/utils';
import { Subject } from 'rxjs';

import { AuthService } from 'src/app/core/auth.service';
import {  Error, KentanTiedot, Liite, TicketService, Tiketti, UusiUKK,
          AddTicketResponse } from 'src/app/ticket/ticket.service';
import { EditAttachmentsComponent } from '../components/edit-attachments/edit-attachments.component';
import { Title } from '@angular/platform-browser';


interface TiketinKentat extends KentanTiedot {
  arvo: string;
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
  @Input() public fileInfoList: FileInfo[] = [];
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  @Input() public attachmentsMessages: string = '';
  private commentID: string | null = null;
  public courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public courseName: string = '';
  public editExisting: boolean = window.history.state.editFaq ?? false;
  public errorMessage: string = '';
  public faqAnswer: string = '';
  public faqMessage: string = '';
  public isInIframe: boolean = getIsInIframe();
  public oldAttachments: Liite[] = [];
  public originalTicket: Tiketti | undefined;
  public state: 'editing' | 'sending' | 'done' = 'editing';
  public ticketFields: TiketinKentat[] = [];
  public ticketId: string | null = this.route.snapshot.paramMap.get('id');
  public title: string = '';
  public titlePlaceholder: string = '';
  public uploadClick: Subject<string> = new Subject<string>();
  public readonly MAX_FILE_SIZE_MB=100;

  attachmentsHasErrors: boolean = false;
  public url: string = '';
  // public fileNameList: string[] = [];
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private ticketService: TicketService,
              private titleServ: Title
              ) {
  }

  ngOnInit(): void {
    this.titlePlaceholder = $localize `:@@Otsikko:Otsikko` + '*';
    this.isInIframe = getIsInIframe();
    if (this.courseId === null) {
      throw new Error('Kurssi ID puuttuu URL:sta.');
    }
    this.ticketService.getTicketFieldInfo(this.courseId).then((response) => {
      this.ticketFields = response as TiketinKentat[];
      for (let field of this.ticketFields) {
        field.arvo = '';
      }
    });
    if (this.ticketId !== null) {
      this.ticketService.getTicketInfo(this.ticketId)
        .then((response) => {
          this.originalTicket = response;
          // response.kommentit[0].id;
          // 1. kommentti on vastaus, johon UKK:n liitteet on osoitettu.
          this.oldAttachments = response.kommentit[0]?.liitteet ?? [];
          this.titleServ.setTitle(Constants.baseTitle + this.originalTicket.otsikko);
          // Käydään läpi kaikki kommentit ja asetetaan tilan 5 eli "Ratkaisuehdotuksen" omaava kommentti
          // oletusvastaukseksi. Lopputuloksena viimeinen ratkaisuehdotus jää oletusvastaukseksi.
          for (let comment of response.kommentit) {
            if (comment.tila === 5) {
              this.faqAnswer = comment.viesti;
            }
          }
          if (String(response.kurssi) !== this.courseId) {
            this.courseId = String(response.kurssi);
            this.auth.fetchUserInfo(this.courseId);
            this.ticketService.getCourseName(this.courseId)
              .then( response => { this.courseName = response });
          }
          this.faqMessage = response.viesti;
          this.title = response.otsikko;
          if (response.kentat !== undefined ) {
            for (let tiketinKentta of response.kentat) {
              for (let uusiKentta of this.ticketFields) {
                if (tiketinKentta.otsikko === uusiKentta.otsikko) {
                  uusiKentta.arvo = tiketinKentta.arvo;
                  break;
                }
              }
            }
          }
        });
    } else {
      this.titleServ.setTitle(Constants.baseTitle + $localize `:@@Uusi UKK:Uusi UKK`);
    }
    this.ticketService.getCourseName(this.courseId)
      .then( response => { this.courseName = response });
  }

  public goBack(): void {
    this.router.navigateByUrl('course/' + this.courseId +  '/list-tickets');
  }

  public sendFaq(): void {
    let newFaq: UusiUKK = {
      otsikko: this.title,
      viesti: this.faqMessage,
      vastaus: this.faqAnswer,
    }
    newFaq.kentat = this.ticketFields.map((field) => {
      return { id: Number(field.id), arvo: field.arvo }
    });
    if (this.courseId === null) throw new Error('Ei kurssi ID:ä.');
    let id = this.editExisting ? this.ticketId ?? '' : this.courseId;

    this.ticketService.addFaq(id, newFaq, this.editExisting)
      .then((response: AddTicketResponse) => {
        if (this.attachments.fileInfoList.length === 0) {
          this.goBack();
          // Ei toiminut, jos otti else:n pois.
        } else {
          if (response?.success !== true) {
            this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
                Kysymyksen lähettäminen epäonnistui` + '.'
            return
          }
          if (response == null) {
            this.errorMessage = 'Liitetiedostojen lähettäminen epäonnistui.';
            return
          }
          let ticketID: string;
          let commentID: string | null;
          // Uutta tikettiä lisätessä sen tiedot tulevat vastauksessa.
          if (response?.uusi != null) {
            ticketID = response.uusi.tiketti;
            commentID = response.uusi.kommentti;
          } else {
            ticketID = this.ticketId!;
            commentID = this.originalTicket?.kommentit[0]?.id ?? null;
            if (commentID == null) {
              console.error('Ei kommentti ID:ä.');
              return
            }
          }
          console.warn(`ticketID: ${ticketID} commentID ${commentID}`)
          this.sendfiles(ticketID, commentID);
        }
      })
      .catch((error: Error) => {
        this.state = 'editing';
        console.log(error);
        if (error?.tunnus == 1003) {
          this.errorMessage = $localize`:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
        } else {
          this.errorMessage = $localize`:@@UKK lisääminen epäonnistui:
              Usein kysytyn kysymyksen lähettäminen epäonnistui` + '.';
        }
      });
  }

  private sendfiles(ticketID: string, commentID:string) {
    this.state = 'sending';
    this.attachments.sendFilesPromise(ticketID, commentID).
      then(res => {
        console.log('komponentti: saatiin vastaus: ');
        console.dir(res);
        // this.goBack();
      })
      .catch((res: any) => {
        this.errorMessage = $localize`:@@Kaikkien liitteiden lähettäminen
            ei onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut`;
        console.log('submit-ticket: saatiin virhe: ' + res);
      })
      .finally(() => {
        console.log('Komponentti: Kaikki valmiita!');
        this.state = 'done';
      })
  }

}
