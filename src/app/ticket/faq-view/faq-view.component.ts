import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService, Ticket } from '../ticket.service';

@Component({
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.scss']
})
export class FaqViewComponent implements OnInit {

public errorMessage: string = '';
private faqID: string | null = this.route.snapshot.paramMap.get('id');
public courseName: string = '';
public ticket: Ticket = {} as Ticket;
public isLoaded: boolean = false;
public isInIframe: boolean = true;

constructor (
  private router: Router,
  private route: ActivatedRoute,
  private ticketService: TicketService) {
  }

  ngOnInit(): void {
    this.getIfInIframe();
    if (this.faqID !== null) {
      this.ticketService.getTicketInfo(this.faqID)
      .then(response => {
        this.ticket = response;
        this.ticketService.setActiveCourse(String(this.ticket.kurssi));
      })
      .then( () => {
        if (this.ticket.kurssi !== null) {
          this.ticketService.getCourseName(String(this.ticket.kurssi)).then(response => {
            this.courseName = response;
          });
        }
      })
      .catch(error => {
        console.error(error);
        this.errorMessage = $localize `:@@UKK näyttäminen epäonnistui:Usein kysytyn kysymyksen näyttäminen epäonnistui` + '.';
      }).finally( () => {
        this.isLoaded = true;
      })
    }
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
