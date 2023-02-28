import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { TicketService } from 'src/app/ticket/ticket.service';


@Component({
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.scss']
})
export class EditFieldComponent implements OnInit {
  public isInIframe: boolean;
  public courseID: string = '';
  public courseName: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticket: TicketService
  ) {
    this.isInIframe = getIsInIframe();
  }

  ngOnInit(): void {
    this.trackRouteParameters();
  }

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        // this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.courseID = courseID;
      this.showCourseName(this.courseID);
    });
  }

  private showCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

}