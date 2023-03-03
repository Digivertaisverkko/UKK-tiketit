import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { TicketService, KentanTiedot, Kentta } from 'src/app/ticket/ticket.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

// interface TableData extends KentanTiedot {
//   valittu: boolean;
// }

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public errorMessage: string = '';
  public message = '';
  public fieldList: KentanTiedot[] = [];
  public inviteEmail: string = '';
  public isInIframe: boolean;
  public courseID: string = '';
  public courseName: string = '';
  private delayFetching: string = window.history.state.delayFetching ?? false;

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
      // FIXME: Palvelin voi palauttaa tyhjän taulun, niin väliaikainen fiksi.
      if (this.delayFetching == 'true') {
        setTimeout(() => { this.fetchTicketFieldInfo(this.courseID) }, 200);
      } else {
      this.fetchTicketFieldInfo(courseID);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fieldList, event.previousIndex, event.currentIndex);
  }

  public saveFields() {
    this.ticketService.setTicketFieldInfo(this.courseID, this.fieldList).then(response => {
      if (response === true ) {
        this.message = "Tallennus onnistui.";
      } else {
        this.errorMessage = 'Kenttäpohjan muuttaminen ei onnistunut.';
      }
    }).catch (error => {
      this.errorMessage = 'Kenttäpohjan muuttaminen ei onnistunut.';
    })
  }

  public htmlToText(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || html;
    return text;
  }

  private fetchTicketFieldInfo(courseID: string) {
    this.ticketService.getTicketFieldInfo(courseID).then(response => {
      if (response[0]?.otsikko != null) {
        this.fieldList = response;
      }
      console.dir(this.fieldList);
    }).catch(e => {
      this.errorMessage = "Ei saatu haettua tiketin kenttien tietoja."
    });
  }

  private showCourseName(courseID: string) {
    this.ticketService.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

}
