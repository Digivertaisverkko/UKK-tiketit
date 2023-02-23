import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { TicketService, KentanTiedot, Kentta } from 'src/app/ticket/ticket.service';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public errorMessage: string = '';
  public ticketFieldInfo: KentanTiedot[] = [];
  public ticketFieldList: Kentta[] = [];
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
      // this.fetchTicketFieldInfo(courseID);
      this.fetchTicketFieldInfoDummy(courseID);
    });
  }

  private fetchTicketFieldInfoDummy(courseID: string) {
    this.ticketFieldList = this.ticket.getTicketFieldInfoDummy(courseID);
    console.log(this.ticketFieldList);
  }

  private fetchTicketFieldInfo(courseID: string) {
    this.ticket.getTicketFieldInfo(courseID).then(response => {
      if (response[0]?.otsikko != null) this.ticketFieldInfo = response;
      console.dir(this.ticketFieldInfo);
    }).catch(e => {
      this.errorMessage = "Ei saatu haettua tiketin kenttien tietoja."
    });
  }


  private showCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }


}
