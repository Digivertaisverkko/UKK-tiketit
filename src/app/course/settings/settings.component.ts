import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Constants } from '../../shared/utils';
import { TicketService, KentanTiedot } from 'src/app/ticket/ticket.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Title } from '@angular/platform-browser';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public courseID: string = '';
  public errorMessage: string = '';
  public fieldList: KentanTiedot[] = [];
  public inviteEmail: string = '';
  public isDirty: boolean = false;
  public showConfirm: boolean = false;
  public isLoaded: boolean = false;
  public message: string = '';
 
  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private titleServ: Title
  ) {
  }

  ngOnInit(): void {
    this.titleServ.setTitle(Constants.baseTitle + $localize
        `:@@Kurssin asetukset:Kurssin asetukset`);
    this.trackRouteParameters();
  }

  public drop(event: CdkDragDrop<string[]>) {
    this.isDirty = true;
    moveItemInArray(this.fieldList, event.previousIndex, event.currentIndex);
  }

  private fetchTicketFieldInfo(courseID: string) {
    this.ticketService.getTicketFieldInfo(courseID).then(response => {
      if (response[0]?.otsikko != null) {
        this.fieldList = response;
      }
      console.dir(this.fieldList);
      return
    }).catch(e => {
      this.errorMessage = $localize `:@@Kysymysten lisäkenttien haku epäonnistui:
          Kysymysten lisäkenttien haku epäonnistui` + '.';
    }).finally( () => this.isLoaded = true)
  }

  public saveFields() {
    this.ticketService.setTicketFieldInfo(this.courseID, this.fieldList)
      .then(response => {
        if (response === true ) {
          this.message = $localize `:@@Tallennettu:Tallennettu`;
          this.isDirty = false;
        } else {
          throw Error;
        }
    }).catch (error => {
      this.errorMessage = $localize `:@@Kenttäpohjan muuttaminen ei onnistunut:
      Kenttäpohjan muuttaminen ei onnistunut.`;
    })
  }

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        this.isLoaded = true;
        return
      }
      this.courseID = courseID;
      // FIXME: Palvelin voi palauttaa tyhjän taulun, niin väliaikainen fiksi.
      // if (this.delayFetching == 'true') {
        // setTimeout(() => { this.fetchTicketFieldInfo(this.courseID) }, 200);
      // } else {
      this.fetchTicketFieldInfo(courseID);
      // }
    });
  }

}
