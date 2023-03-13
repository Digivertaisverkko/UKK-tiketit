import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthService } from 'src/app/core/auth.service';
import { KentanTiedot, TicketService, Tiketti, UusiTiketti, AddTicketResponse } from 'src/app/ticket/ticket.service';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { EditAttachmentsComponent } from '../components/edit-attachments/edit-attachments.component';

interface TiketinKentat extends KentanTiedot {
  arvo: string;
}

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})

export class SubmitTicketComponent implements OnInit {
  @ViewChild(EditAttachmentsComponent) attachments!: EditAttachmentsComponent;
  @Input() public fileList: File[] = [];
  private courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public courseName: string = '';
  public currentDate = new Date();
  public editExisting: boolean = window.history.state.editTicket ?? false;
  public errorMessage: string = '';
  public isInIframe: boolean = getIsInIframe();
  public message: string = '';
  public state: 'editing' | 'sending' | 'done' = 'editing';
  public title: string = '';
  public ticketFields: TiketinKentat[] = [];
  public ticketId: string | null = this.route.snapshot.paramMap.get('id');
  public uploadClick: Subject<string> = new Subject<string>();
  public userName: string | null = '';

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private ticketService: TicketService) {}

  ngOnInit(): void {
    if (this.courseId === null) { throw new Error('Ei kurssi ID:ä.') }
    this.auth.fetchUserInfo(this.courseId);
    this.auth.trackUserInfo().subscribe(response => {
      this.userName = response?.nimi ?? '';
    });
    this.ticketService.getCourseName(this.courseId).then(response => {
      this.courseName = response;
    }).catch(() => {});
    this.ticketService.getTicketFieldInfo(this.courseId).then((response) => {
      this.ticketFields = response as TiketinKentat[];
      for (let field of this.ticketFields) {
        field.arvo = '';
      }
    });
    if (this.ticketId != null) this.fetchTicketInfo();
  }

  private fetchTicketInfo() {
    if (this.ticketId == null) return
    this.ticketService.getTicketInfo(this.ticketId).then(response => {
      if (response?.id) {
        this.title = response.otsikko;
        this.message = response.viesti;

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
      }
    }).catch(e => {})
  }

  public goBack() {
    this.router.navigateByUrl('course/' + this.courseId + '/list-tickets');
  }

  public sendTicket(): void {
    let ticket: UusiTiketti = {} as UusiTiketti;
    ticket.otsikko = this.title;
    ticket.viesti = this.message;
    ticket.kentat = this.ticketFields.map((field) => {
      return { id: Number(field.id), arvo: field.arvo }
    });
    if (this.courseId == null) { throw new Error('Ei kurssi ID:ä.') }
    if (this.ticketId != null) {
      this.ticketService.editTicket(this.ticketId, ticket)
        .then( () => this.goBack()
        ).catch(error => {
          this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
        })
    } else {
    this.ticketService.addOnlyTicket(this.courseId, ticket)
      .then(response => {
        if (this.fileList.length === 0) this.goBack()
        if (response == null || response?.success !== true) {
          this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
          throw new Error('Kysymyksen lähettäminen epäonnistui.');
        }
        if (response?.uusi == null) {
          this.errorMessage = 'Liitetiedostojen lähettäminen epäonnistui.';
          throw new Error('Ei tarvittavia tietoja tiedostojen lähettämiseen.');
        }
        response = response as AddTicketResponse;
        const ticketID = response.uusi.tiketti;
        const commentID = response.uusi.kommentti;
        this.state = 'sending';
        this.attachments.sendFiles(ticketID, commentID).then(response => {
          if (response === true) {
          this.state = "editing";
          this.goBack();
        } else {
          throw new Error
        }
        }).catch(error => {
          this.errorMessage = $localize `:@@Kaikkien liitteiden lähettäminen ei onnistunut:Kaikkien liitteiden lähettäminen ei onnistunut` + '.';

        })
      }).catch( error => {
        // ? lisää eri virhekoodeja?
        this.state = 'done';
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
      });
    }
    //   this.ticketService.addTicket(this.courseId, ticket, this.fileList)
    //   .then(() => this.goBack()
    //   ).catch( error => {
    //     // ? lisää eri virhekoodeja?
    //     this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
    //   });
    // }
  }
}
