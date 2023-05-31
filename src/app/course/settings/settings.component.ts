import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Title } from '@angular/platform-browser';

import { Constants } from '@shared/utils';
import { CourseService } from '../course.service';
import { Kenttapohja } from '../course.models';
import { GenericResponse } from '@core/core.models';
import { StoreService } from '@core/store.service';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public readonly courseID: string | null = this.route.snapshot.paramMap.get('courseid');
  public errorMessage: string = '';
  public fieldList: Kenttapohja[] = [];
  public inviteEmail: string = '';
  public isDirty: boolean = false;
  public isLoaded: boolean = false;
  public message: string = '';
  public showConfirm: boolean = false;

  constructor(
    private courses: CourseService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private store: StoreService,
    private titleServ: Title
  ) {
  }

  ngOnInit(): void {
    this.titleServ.setTitle(Constants.baseTitle + $localize
        `:@@Kurssin asetukset:Kurssin asetukset`);
      if (this.courseID) {
        this.fetchTicketFieldInfo(this.courseID);
    } else {
      console.error('Ei kurssi ID:ä, ei voida hakea tikettipohjan tietoja.');
    }
  }

  public drop(event: CdkDragDrop<string[]>) {
    this.isDirty = true;
    moveItemInArray(this.fieldList, event.previousIndex, event.currentIndex);
    this.saveFields();
  }

  public exportFAQs() {
    if (!this.courseID) throw Error('Ei kurssi ID:ä.');
    const faq = $localize `:@@UKK:UKK`;
    const courseName = this.store.getCourseName();
    const filename = `${faq}-${courseName}.json`;
    this.courses.exportFAQs(this.courseID).then(filecontent => {
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
    }).finally( () => this.isLoaded = true )
  }

  public onFileAdded(event: any) {
    this.message = '';
    const file: File = event.target.files[0];
    if (!file) throw Error('Ei tiedostoa.');
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      let jsonData: JSON;
      try {
        jsonData = JSON.parse(fileReader.result as string);
      } catch {
        this.errorMessage = $localize `:@@Tiedoston sisältö on virheellisessä muodossa:
        Tiedoston sisältö on virheellisessä muodossa` + '.';
        return
      }
      if (!this.courseID) throw Error('Ei kurssi ID:ä.');
      this.courses.importFAQs(this.courseID, jsonData)
        .then((res: GenericResponse) => {
          if (res.success === true) {
            this.message = $localize `:@@Lisättiin usein kysytyt kysymykset tälle kurssille:
                Lisättiin usein kysytyt kysymykset tälle kurssille` + '.';
          } else {
            console.log('vastaus: ' + JSON.stringify(res));
          }
      }).catch(e => {
        this.errorMessage = $localize `:@@UKKden lisääminen epäonnistui:
          Usein kysyttyjen kysymysten lisääminen tälle kurssille ei onnistunut.`;
      })
    }
    fileReader.readAsText(file);
  }

  public saveFields() {
    if (!this.courseID) throw Error('Ei kurssi ID:ä.');
    this.courses.setTicketField(this.courseID, this.fieldList)
      .then(response => {
        if (response === true ) {
          this.message = $localize `:@@Tallennettu:Tallennettu`;
          this.isDirty = false;
          if (this.courseID) this.fetchTicketFieldInfo(this.courseID);
        } else {
          throw Error;
        }
    }).catch (error => {
      this.errorMessage = $localize `:@@Kenttäpohjan muuttaminen ei onnistunut:
      Kenttäpohjan muuttaminen ei onnistunut.`;
    })
  }

}
