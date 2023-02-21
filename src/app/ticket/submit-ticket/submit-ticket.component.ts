import { Component, OnDestroy, OnInit, Input, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Event, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { UusiTiketti, TicketService } from '../ticket.service';
import { getIsInIframe } from '../functions/isInIframe';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})

export class SubmitTicketComponent implements OnInit {
  // max pituus: 255.
  titleText: string = '';
  assignmentText: string = '';
  public courseName: string = '';
  public errorMessage: string = '';
  // public user: User;
  public isInIframe: boolean;
  problemText: string = '';
  newTicket: UusiTiketti = {} as UusiTiketti;
  public userName: string | null = '';
  userRole: string = '';
  answer: string = '';
  sendingIsAllowed: boolean = false;
  public currentDate = new Date();
  // public user$ = this.auth.trackUserInfo();
  public message: string = '';
  @Input() public fileList: File[] = [];
  public uploadClick: Subject<void> = new Subject<void>();
  private courseID: string | null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private _snackBar: MatSnackBar
    ) {
      this.courseID = this.route.snapshot.paramMap.get('courseid');
      this.isInIframe = getIsInIframe();
    }

  ngOnInit(): void {
    if (this.courseID === null) { throw new Error('Ei kurssi ID:ä.')}
    this.auth.fetchUserInfo(this.courseID);
    this.auth.trackUserInfo().subscribe(response => {
      this.userName = response?.nimi ?? '';
      this.userRole = response?.asema ?? '';
    })
    this.ticketService.getCourseName(this.courseID).then(response => {
      this.courseName = response;
    }).catch(() => {});
  }

  public sendTicket(): void {
    this.newTicket.otsikko = this.titleText;
    this.newTicket.viesti = this.message;
    this.newTicket.kentat = [{ id: 1, arvo: this.assignmentText }, { id: 2, arvo: this.problemText }];
    if (this.courseID == null) { throw new Error('Ei kurssi ID:ä.')}
    this.ticketService.addTicket(this.courseID, this.newTicket, this.fileList)
      .then(() => this.goBack()
      ).catch( error => {
        // TODO: lisää eri virhekoodeja?
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
      });
  }

  private goBack() {
    this.router.navigateByUrl('course/' + this.courseID + '/list-tickets');
  }

}
