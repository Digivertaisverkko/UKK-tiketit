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
  public isCopyToClipboardPressed: boolean = false;
  private courseID: string | null;
  private faqID: string | null = this.route.snapshot.paramMap.get('id');

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
  ) {
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.auth.trackUserInfo().subscribe(response => this.user = response);
  }

  ngOnInit(): void {
    this.getIfInIframe();
    if (this.courseID === null) {
      throw new Error('Kurssi ID puuttuu URL:sta.');
    }
    this.ticketService.getCourseName(this.courseID).then(response => {
      this.courseName = response;
    });
    if (this.faqID !== null) {
      this.ticketService.getTicketInfo(this.faqID)
        .then((response) => {
          this.ticket = response;
          if (this.auth.getUserName.length == 0) {
            try {
              if (this.courseID !== null) this.auth.fetchUserInfo(this.courseID);
            } catch {}
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
    let url = '/course/' + this.courseID + '/submit-faq/' + this.faqID;
    this.router.navigate([url], { state: { editFaq: 'true' } });
  }

  changeArchiveButton() {
    setTimeout(() => this.isArchivePressed = true, 300);
  }

  archiveFaq() {
    this.isArchivePressed = false;
    this.ticketService.archiveFAQ(Number(this.faqID)).then(response => {
      this.router.navigateByUrl('course/' + this.courseID +  '/list-tickets');
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
