import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthService } from 'src/app/core/auth.service';
import { Error, KentanTiedot, TicketService, Tiketti, UusiUKK, AddTicketResponse 
          } from 'src/app/ticket/ticket.service';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { EditAttachmentsComponent } from '../components/edit-attachments/edit-attachments.component';

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
  public courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public courseName: string = '';
  public editExisting: boolean = window.history.state.editFaq ?? false;
  public errorMessage: string = '';
  public faqAnswer: string = '';
  public faqMessage: string = '';
  public isInIframe: boolean = getIsInIframe();
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
              private ticketService: TicketService) {
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
    }
    this.ticketService.getCourseName(this.courseId)
      .then( response => { this.courseName = response });
  }

/*   public onFileChanged(event: any) {
    const MEGABYTE = 1000000;
    for (let file of event.target.files) {
      if (this.fileInfoList.some(item => item.filename === file.name)) continue
      let fileinfo: FileInfo = { filename: file.name };
      if (file.size > this.MAX_FILE_SIZE_MB * MEGABYTE) {
        fileinfo.error = $localize `:@@Liian iso:Liian iso`;
        fileinfo.errorToolTip = $localize `:@@Tiedoston koko ylittää:
        Tiedoston koko ylittää ${this.MAX_FILE_SIZE_MB} megatavun rajoituksen` + '.';
        this.attachmentsHasErrors = true;
      } else {
        this.fileList.push(file);
      }
      this.fileInfoList.push(fileinfo);
      console.log('fileinfolist ' + JSON.stringify(this.fileInfoList));
      console.log('filelist:');
      console.dir(this.fileList);
    }
  } */

  // public removeSelectedFile(index: number) {
  //   this.fileList.splice(index, 1);
  //   this.fileInfoList.splice(index, 1);
  //   this.attachmentsHasErrors = (this.fileInfoList.some(item => item.error));
  // }

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
      .then(response => {
        if (this.attachments.fileInfoList.length === 0) this.goBack()
        if (response?.success !== true) {
          this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:
              Kysymyksen lähettäminen epäonnistui` + '.'
          throw new Error('Kysymyksen lähettäminen epäonnistui.');
        }
        if (response == null || response?.uusi == null) {
          this.errorMessage = 'Liitetiedostojen lähettäminen epäonnistui.';
          throw new Error('Ei tarvittavia tietoja tiedostojen lähettämiseen.');
        }        
        response = response as AddTicketResponse;
        const ticketID = response.uusi.tiketti;
        const commentID = response.uusi.kommentti;
        this.sendfiles(ticketID, commentID);
      })
      .catch((error: Error) => {
        this.state = 'done';
        console.log(error);
        if (error?.tunnus == 1003) {
          this.errorMessage = $localize`:@@Ei oikeuksia:Sinulla ei ole riittäviä
              käyttäjäoikeuksia` + '.';
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
        this.goBack();
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
