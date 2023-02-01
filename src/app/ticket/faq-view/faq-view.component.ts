import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from 'src/app/core/auth.service';
import { UserManagementModule } from 'src/app/user-management/user-management.module';
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

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
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
            }).catch((error) => {
              console.error()
            });
          }
        })
        .catch((error) => {
          console.error(error);
          this.errorMessage =
            $localize`:@@UKK näyttäminen epäonnistui:Usein kysytyn kysymyksen näyttäminen epäonnistui` + '.';
        })
        .finally(() => {
          this.isLoaded = true;
        });
    }
  }

  editFaq() {
    let url:string = '/submit-faq/' + this.faqID;
    console.log('submit-faq: url: ' + url);
    this.router.navigate([url], { state: { editFaq: 'true' } });
  }

  private getIfInIframe() {
    const isInIframe = window.sessionStorage.getItem('IN-IFRAME');
    if (isInIframe == 'false') {
      this.isInIframe = false;
    } else {
      this.isInIframe = true;
    }
  }

}
