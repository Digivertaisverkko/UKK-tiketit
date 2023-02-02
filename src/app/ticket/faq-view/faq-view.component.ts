import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from 'src/app/core/auth.service';
import { TicketService, Tiketti } from '../ticket.service';

@Component({
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.scss'],
})

export class FaqViewComponent implements OnInit {
  public courseName: string = '';
  public errorMessage: string = '';
  public isInIframe: boolean = true;
  public isLoaded: boolean = false;
  public ticket: Tiketti = {} as Tiketti;
  public user: User = <User>{};
  private faqID: string | null = this.route.snapshot.paramMap.get('id');
  public isArchivePressed: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
  ) {
    this.auth.trackUserInfo().subscribe(response => {
        this.user = response;
      });
  }

  ngOnInit(): void {
    this.getIfInIframe();
    if (this.faqID !== null) {
      this.ticketService
        .getTicketInfo(this.faqID)
        .then((response) => {
          this.ticket = response;
          this.ticketService.setActiveCourse(String(this.ticket.kurssi));
          if (this.auth.getUserName.length == 0) {
            this.auth.fetchUserInfo(String(this.ticket.kurssi));
          }
        })
        .then(() => {
          if (this.ticket.kurssi !== null) {
            this.ticketService
              .getCourseName(String(this.ticket.kurssi))
              .then((response) => {
                this.courseName = response;
            }).catch(() => {});
          }
        })
        .catch(error => {
          this.errorMessage =
            $localize`:@@UKK näyttäminen epäonnistui:Usein kysytyn kysymyksen näyttäminen epäonnistui` + '.';
        })
        .finally(() => this.isLoaded = true );
    }
  }

  editFaq() {
    let url:string = '/submit-faq/' + this.faqID;
    console.log('submit-faq: url: ' + url);
    this.router.navigate([url], { state: { editFaq: 'true' } });
  }

  archiveFaq() {
    this.isArchivePressed = false;
    this.ticketService.archiveFAQ(Number(this.faqID)).then(response => {
      const courseID = this.ticketService.getActiveCourse();
      this.router.navigateByUrl('/list-tickets?courseID=' + courseID);
    }).catch(error => {
      this.errorMessage = $localize `:@@UKK poisto epäonnistui:Usein kysytyn kysymyksen poistaminen ei onnistunut.`
    })
  }

  private getIfInIframe() {
    const isInIframe = window.sessionStorage.getItem('IN-IFRAME');
    this.isInIframe = (isInIframe === 'false') ? false : true;
  }

}
