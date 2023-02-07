import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from 'src/app/core/auth.service';
import { TicketService, Tiketti, Error } from '../ticket.service';

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
  public isArchivePressed: boolean = false;
  private faqID: string | null = this.route.snapshot.paramMap.get('id');

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
  ) {
    this.auth.trackUserInfo().subscribe(response => this.user = response);
  }

  ngOnInit(): void {
    this.getIfInIframe();
    if (this.faqID !== null) {
      this.ticketService.getTicketInfo(this.faqID)
        .then((response) => {
          this.ticket = response;
          this.ticketService.setActiveCourse(String(this.ticket.kurssi));
          if (this.auth.getUserName.length == 0) {
            try {
              this.auth.fetchUserInfo(String(this.ticket.kurssi));
            } catch {}
          }
        })
        .then(() => {
          if (this.ticket.kurssi !== null) {
            this.ticketService.getCourseName(String(this.ticket.kurssi))
              .then((response) => this.courseName = response
            ).catch()
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
    let url:string = '/course/' + this.ticket.kurssi + '/submit-faq/' + this.faqID;
    console.log('submit-faq: url: ' + url);
    this.router.navigate([url], { state: { editFaq: 'true' } });
  }

  archiveFaq() {
    this.isArchivePressed = false;
    this.ticketService.archiveFAQ(Number(this.faqID)).then(response => {
      const courseID = this.ticketService.getActiveCourse();
      this.router.navigateByUrl('course/' + this.ticket.kurssi +  '/list-tickets');
    }).catch((error: Error) => {
      if (error.tunnus == 1003) {
        this.errorMessage = $localize `:@@:Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@UKK poisto epäonnistui:Usein kysytyn kysymyksen poistaminen ei onnistunut.`
      }
    })
  }

  private getIfInIframe() {
    const isInIframe = window.sessionStorage.getItem('IN-IFRAME');
    this.isInIframe = (isInIframe === 'false') ? false : true;
  }

}
