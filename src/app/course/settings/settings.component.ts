import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Constants } from '@shared/utils';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Title } from '@angular/platform-browser';
import { CourseService } from '../course.service';
import { Kenttapohja } from '../course.models';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public courseID: string = '';
  public errorMessage: string = '';
  public fieldList: Kenttapohja[] = [];
  public inviteEmail: string = '';
  public isDirty: boolean = false;
  public showConfirm: boolean = false;
  public isLoaded: boolean = false;
  public message: string = '';

  constructor(
    private courses: CourseService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
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
    this.saveFields();
  }

  public exportFAQs() {
    const faq = $localize `:@@UKK:UKK`;
    const course = $localize `:@@kurssi:kurssi`;
    const filename = `${faq}-${course}-${this.courseID}.json`;
    this.courses.exportFAQs(this.courseID).then(response => {
      let filecontent = JSON.stringify(response, null, 2);
      const link = this.renderer.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute(
          'href',
          "data:text/json;charset=UTF-8," + encodeURIComponent(filecontent));
      link.setAttribute('download', filename);
      link.click();
      link.remove();
    })
    .catch(error => {
      this.errorMessage = $localize `:@@Tiedoston lataaminen epäonnistui:
                                        Tiedoston lataaminen epäonnistui` + '.';
    });
  }

  private fetchTicketFieldInfo(courseID: string) {
    this.courses.getTicketFieldInfo(courseID).then(response => {
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

  public onFileAdded(event: any) {

  }

  public saveFields() {
    this.courses.setTicketFieldInfo(this.courseID, this.fieldList)
      .then(response => {
        if (response === true ) {
          this.message = $localize `:@@Tallennettu:Tallennettu`;
          this.isDirty = false;
          this.fetchTicketFieldInfo(this.courseID);
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
