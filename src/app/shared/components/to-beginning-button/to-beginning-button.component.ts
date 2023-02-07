import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TicketService } from 'src/app/ticket/ticket.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-to-beginning-button',
  templateUrl: './to-beginning-button.component.html',
  styleUrls: ['./to-beginning-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToBeginningButtonComponent {

  constructor (
    private router: Router,
    private route: ActivatedRoute) {
  }

  public goBack(): void {
    const courseID = this.route.snapshot.paramMap.get('courseid');
    this.router.navigateByUrl('course/' + courseID +  '/list-tickets');
  }

}
