import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthService } from 'src/app/core/auth.service';
import { KentanTiedot, TicketService, UusiTiketti } from 'src/app/ticket/ticket.service';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';

interface TiketinKentat extends KentanTiedot {
  arvo: string;
}

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})

export class SubmitTicketComponent implements OnInit {
  @Input() public fileList: File[] = [];
  private courseId: string | null = this.route.snapshot.paramMap.get('courseid');
  public courseName: string = '';
  public currentDate = new Date();
  public errorMessage: string = '';
  public isInIframe: boolean = getIsInIframe();
  public message: string = '';
  private newTicket: UusiTiketti = {} as UusiTiketti;
  public ticketFields: TiketinKentat[] = [];
  public title: string = '';
  public uploadClick: Subject<void> = new Subject<void>();
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
  }

  private goBack() {
    this.router.navigateByUrl('course/' + this.courseId + '/list-tickets');
  }

  public sendTicket(): void {
    this.newTicket.otsikko = this.title;
    this.newTicket.viesti = this.message;
    this.newTicket.kentat = this.ticketFields.map((field) => {
      return { id: Number(field.id), arvo: field.arvo }
    });

    if (this.courseId == null) { throw new Error('Ei kurssi ID:ä.') }
    this.ticketService.addTicket(this.courseId, this.newTicket, this.fileList)
      .then(() => this.goBack()
      ).catch( error => {
        // TODO: lisää eri virhekoodeja?
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
      });
  }
}
