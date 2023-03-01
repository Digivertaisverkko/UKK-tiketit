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

  public columnDefinitions: ColumnDefinition[];
  public errorMessage: string = '';
  // public dataSource = new MatTableDataSource<TableData>();
  public fieldList: KentanTiedot[] = [];
  // public ticketFieldInfo: KentanTiedot[] = [];
  // public ticketFieldList: Kentta[] = [];
  public inviteEmail: string = '';
  public isInIframe: boolean;
  public isPhonePortrait: boolean = false;
  public courseID: string = '';
  public courseName: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
  ) {
    this.isInIframe = getIsInIframe();

    this.columnDefinitions = [
      { def: 'valittu', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'ohje', showMobile: true },
    ];
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
      this.fetchTicketFieldInfo(courseID);
      // this.fetchTicketFieldInfoDummy(courseID);
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fieldList, event.previousIndex, event.currentIndex);
  }

  public saveFields() {
    console.log('Ei vielä toteutettu');
  }

  private fetchTicketFieldInfo(courseID: string) {
    this.ticketService.getTicketFieldInfo(courseID).then(response => {
      if (response[0]?.otsikko != null) {
        this.fieldList = response;
      }
      console.dir(this.fieldList);
      // this.fieldList[0].ohje = "Mihin kohtitehtävän kysymys liittyy?";
      // this.fieldList[1].ohje = "Mihin kysymys liittyy?";
    }).catch(e => {
      this.errorMessage = "Ei saatu haettua tiketin kenttien tietoja."
    });
  }

  public getDisplayedColumn(): string[] {
    return this.columnDefinitions
      .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  private showCourseName(courseID: string) {
    this.ticketService.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

}
