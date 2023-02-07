import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TicketService } from 'src/app/ticket/ticket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-to-beginning-button',
  templateUrl: './to-beginning-button.component.html',
  styleUrls: ['./to-beginning-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToBeginningButtonComponent {

  constructor (private ticketService: TicketService,
    private router: Router) {

  }

  public goBack(): void {
    // if (this.ticket.kurssi === undefined ) {
      const courseID = this.ticketService.getActiveCourse();
      // this.router.navigateByUrl('/list-tickets?courseID=' + courseID);
      this.router.navigateByUrl('course/' + courseID +  '/list-tickets');
    // } else {
    //   this.router.navigateByUrl('/list-tickets?courseID=' + this.ticket.kurssi);
    // }
  }

}
