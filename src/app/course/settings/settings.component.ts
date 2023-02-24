import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { TicketService, KentanTiedot, Kentta } from 'src/app/ticket/ticket.service';
import { MatTableDataSource } from '@angular/material/table';

interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

interface TableData extends KentanTiedot {
  valittu: boolean;
}

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public columnDefinitions: ColumnDefinition[];
  public errorMessage: string = '';
  public dataSource = new MatTableDataSource<TableData>();
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
    private ticket: TicketService
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

  public isAllChecked(): boolean {
    return this.dataSource.data.every(row => row.valittu === false)
  }

  public removeSelected() {
    const tableData = this.dataSource.data.filter(row => row.valittu === false);
    this.dataSource.data = tableData;
  }

  public addField() {
    const newField: TableData = {
        otsikko: '',
        pakollinen: false,
        esitaytettava: false,
        ohje: '',
        valinnat: null,
        valittu: false
    }
    const tableData: TableData[] = this.dataSource.data;
    tableData.push(newField);
    this.dataSource.data = tableData;
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

  private fetchTicketFieldInfoDummy(courseID: string) {
    // const response = this.ticket.getTicketFieldInfoDummy(courseID);
    // if (response.length > 0) {
    //   const tableData = response.map(field => ({ valittu: false, ...field}));
    //   this.dataSource = new MatTableDataSource(tableData);
    // }
    // console.dir(this.dataSource);
  }

  private fetchTicketFieldInfo(courseID: string) {
    this.ticket.getTicketFieldInfo(courseID).then(response => {
      if (response[0]?.otsikko != null) {
        const tableData = response.map(field => ({ valittu: false, ...field}));
        this.dataSource = new MatTableDataSource(tableData);
      }
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
    this.ticket.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

}
