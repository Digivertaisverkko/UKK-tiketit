import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }
    from '@angular/core';
import { getIsInIframe } from 'src/app/shared/utils';
import { TicketService } from 'src/app/ticket/ticket.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-headline',
  template: `

    <h1 class="mat-h1"
        [ngClass]="login ? 'login-h1' : ''"
        *ngIf="headlineText && !isInIframe"
        >
      <!-- Span-tagit tarvitsee otsikon ympärille, että teemassa muotoillaan oikein. -->
      <span>{{headlineText}}</span>
    </h1>

    <div class="vertical-spacer" *ngIf="isInIframe || !headlineText"></div>
  `,
  styleUrls: ['./headline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadlineComponent implements OnInit {

  // login:a käytetään kirjautumissivulla.
  @Input() public login: boolean = false
  public headlineText: string | null = null;
  public isInIframe: boolean;

  constructor(
      private change: ChangeDetectorRef,
      private route : ActivatedRoute,
      private ticketServ: TicketService,
  ) {
    this.isInIframe = getIsInIframe();
  }

  ngOnInit() {
    if (this.login) {
      this.headlineText = "DVV-tikettijärjestelmä";
    } else {
      this.trackCourseID();
    }
  }

  private showCourseName(courseID: string) {
    this.ticketServ.getCourseName(courseID).then(response => {
      this.headlineText = response ?? '';
      // this.courseName = 'Testikurssi';
      this.change.detectChanges();
    }).catch( () => this.headlineText = '');
  }

  private trackCourseID(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.showCourseName(courseID);
    })
  }

}
