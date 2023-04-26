import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }
    from '@angular/core';
import { getIsInIframe } from 'src/app/shared/utils';
import { TicketService } from 'src/app/ticket/ticket.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-headline',
  template: `
    <h1 class="main-header"
        id="courseName"
        *ngIf="courseName.length > 0 && !isInIframe"

        >
      <!-- Span-tagit tarvitsee otsikon ympärille, että teemassa muotoillaan oikein. -->
      <span>{{courseName}}</span>
    </h1>
  `,
  styleUrls: ['./headline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadlineComponent implements OnInit {

  public courseName: string = '';
  public isInIframe: boolean;

  constructor(
      private change: ChangeDetectorRef,
      private route : ActivatedRoute,
      private ticketServ: TicketService,
  ) {
    this.isInIframe = getIsInIframe();
  }

  ngOnInit() {
    this.trackCourseID();
  }

  private showCourseName(courseID: string) {
    this.ticketServ.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
      // this.courseName = 'Testikurssi';
      this.change.detectChanges();
    }).catch( () => this.courseName = '');
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
