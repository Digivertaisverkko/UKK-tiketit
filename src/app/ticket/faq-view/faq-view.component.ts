import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService, FAQ, Ticket } from '../ticket.service';

@Component({
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.scss']
})
export class FaqViewComponent implements OnInit {

private faqID: string | null = this.route.snapshot.paramMap.get('id');
public faq: Ticket = {} as Ticket;
public isLoaded: boolean = false;

constructor (
  private router: Router,
  private route: ActivatedRoute,
  private ticketService: TicketService) {
  }

  ngOnInit(): void { 
    if (this.faqID !== null) {
      this.ticketService.getTicketInfo(this.faqID)
      .then(response => {
        this.faq = response;
        this.isLoaded = true;
      });
    }
  } 

  public goBack(): void {
    this.router.navigateByUrl('/list-tickets?courseID=' + this.ticketService.getActiveCourse());
  }
  
}