import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { TicketService, KentanTiedot } from 'src/app/ticket/ticket.service';


@Component({
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.scss']
})

export class EditFieldComponent implements OnInit {
  public fieldInfo: KentanTiedot = {} as KentanTiedot;
  public isInIframe: boolean;
  public courseID: string = '';
  public courseName: string = '';
  public multipleSelection: boolean = false;
  private fieldID: string | null = this.route.snapshot.paramMap.get('fieldid');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
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
      if (this.fieldID == null) {
        throw new Error('Virhe: ei tiketin kentän ID:ä.');
      }
      this.ticketService.getTicketFieldInfo(courseID, this.fieldID).then(response => {
        if (response[0].id) {
          this.fieldInfo = response[0];
          console.log(this.fieldInfo.valinnat);
          this.multipleSelection = this.fieldInfo.valinnat[0].length === 0 ? false : true;
          console.log(this.fieldInfo.valinnat[0].length);
          console.log(this.multipleSelection);
          console.log('Kentän tiedot: ' + JSON.stringify(this.fieldInfo));
        } 
      })
    });
  }

  private showCourseName(courseID: string) {
    this.ticketService.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

}