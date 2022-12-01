import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TicketService } from '../ticket.service';

@Component({
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.scss']
})
export class FaqViewComponent {

constructor (
  private router: Router,
  private ticketService: TicketService) {
  
  }

  public goBack(): void {
    this.router.navigateByUrl('/list-tickets?courseID=' + this.ticketService.getActiveCourse);
  }
  
}