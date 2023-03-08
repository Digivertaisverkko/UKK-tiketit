import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthService } from 'src/app/core/auth.service';
import { Error, KentanTiedot, TicketService, Tiketti, UusiUKK } from 'src/app/ticket/ticket.service';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';


interface TiketinKentat extends KentanTiedot {
  arvo: string;
}

interface FileInfo {
  filename: string;
  error?: string;
  errorToolTip?: string;
}

@Component({
  selector: 'app-submit-faq',
  templateUrl: './submit-faq.component.html',
  styleUrls: ['./submit-faq.component.scss']
})

export class SubmitFaqComponent implements OnInit {
  @Input() public fileList: File[] = [];
  // @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  public courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public courseName: string = '';
  public editExisting: boolean = window.history.state.editFaq ?? false;
  public errorMessage: string = '';
  public faqAnswer: string = '';
  public faqMessage: string = '';
  public isInIframe: boolean = getIsInIframe();
  public originalTicket: Tiketti | undefined;
  public ticketFields: TiketinKentat[] = [];
  public ticketId: string | null = this.route.snapshot.paramMap.get('id');
  public title: string = '';
  public uploadClick: Subject<string> = new Subject<string>();

  attachmentsHasErrors: boolean = false;
  public fileInfoList: FileInfo[] = [];
  public url: string = '';
  // public fileNameList: string[] = [];
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';
 
  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private ticketService: TicketService) {}

  ngOnInit(): void {
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

  public onFileChanged(event: any) {
    const MEGABYTE = 1000000;
    for (let file of event.target.files) {
      if (this.fileInfoList.some(item => item.filename === file.name)) continue
      let fileinfo: FileInfo = { filename: file.name };
      if (file.size > 10 * MEGABYTE) {
        fileinfo.error = $localize `:@@Liian iso:Liian iso`;
        fileinfo.errorToolTip = $localize `:@@Tiedoston koko ylittää:Tiedoston koko ylittää 10 megatavun rajoituksen` + '.';
        this.attachmentsHasErrors = true;
      } else {
        this.fileList.push(file);
      }
      this.fileInfoList.push(fileinfo);
    }
  }

  public removeSelectedFile(index: number) {
    this.fileList.splice(index, 1);
    this.fileInfoList.splice(index, 1);
    this.attachmentsHasErrors = (this.fileInfoList.some(item => item.error));
  }

  private goBack(): void {
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
    this.ticketService.sendFaq(id, newFaq, this.fileList, this.editExisting)
      .then(() => { this.goBack() })
      .catch( (error: Error) => {
        if (error?.tunnus == 1003) {
          this.errorMessage = $localize `:@@Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
        } else {
          this.errorMessage = $localize `:@@UKK lisääminen epäonnistui:Usein kysytyn kysymyksen lähettäminen epäonnistui` + '.';
        }
      });
  }
}
