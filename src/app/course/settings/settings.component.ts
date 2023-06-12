import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { takeWhile } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { Constants } from '@shared/utils';
import { CourseService } from '../course.service';
import { GenericResponse, Role, User } from '@core/core.models';
import { Kenttapohja } from '../course.models';
import { StoreService } from '@core/services/store.service';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Input() courseid: string | null = null;
  public errorMessage: string = '';
  public fieldList: Kenttapohja[] = [];
  public form: FormGroup = this.buildForm();
  public inviteErrorMessage: string = '';
  public inviteMessage: string = '';
  public isDirty: boolean = false;
  public isLoaded: boolean = false;
  public message: string = '';
  public showConfirm: boolean = false;

  constructor(
    private courses: CourseService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private router: Router,
    private store: StoreService,
    private titleServ: Title
  ) {

  }

  get email(): AbstractControl {
    return this.form.get('email') as FormControl;
  }

  get role(): AbstractControl {
    return this.form.get('role') as FormControl;
  }

  ngOnInit(): void {
    this.titleServ.setTitle(Constants.baseTitle + $localize
        `:@@Kurssin asetukset:Kurssin asetukset`);
      if (this.courseid) {
        this.fetchTicketFieldInfo(this.courseid);
    } else {
      console.error('Ei kurssi ID:ä, ei voida hakea tikettipohjan tietoja.');
    }
    this.trackUserInfo();
    this.trackIfParticipant();
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      email: [ '', Validators.required ],
      role: [ 1 ]
    })
  }

  public drop(event: CdkDragDrop<string[]>) {
    this.isDirty = true;
    moveItemInArray(this.fieldList, event.previousIndex, event.currentIndex);
    this.saveFields();
  }

  public exportFAQs() {
    if (!this.courseid) throw Error('Ei kurssi ID:ä.');
    const faq = $localize `:@@UKK:UKK`;
    const courseName = this.store.getCourseName();
    const filename = `${faq}-${courseName}.json`;
    this.courses.exportFAQs(this.courseid).then(filecontent => {
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

  private fetchTicketFieldInfo(courseid: string) {
    this.courses.getTicketFieldInfo(courseid).then(response => {
      if (response[0]?.otsikko != null) {
        this.fieldList = response;
      }
      return
    }).catch(e => {
      this.errorMessage = $localize `:@@Kysymysten lisäkenttien haku epäonnistui:
          Kysymysten lisäkenttien haku epäonnistui` + '.';
    }).finally( () => this.isLoaded = true )
  }

  private getRole(checkboxValue: Number): Role {
    let role: Role;
    switch (checkboxValue) {
      case 1: role = 'opiskelija'; break;
      case 2: role = "opettaja"; break;
      default:
        throw Error('Ei hyväksyttyä roolinumeroa.');
    }
    return role
  }

  public sendInvite() {
    this.inviteErrorMessage = '';
    if (!this.courseid) return
    const email = this.form.controls['email'].value;
    const checkboxValue = this.form.controls['role'].value;
    const role: Role = this.getRole(checkboxValue);
    console.log('lähetetään tiedot: email: ' + email + ', rooli: ' + role);
    this.courses.sendInvitation(this.courseid, email, role).then(res => {
      if (res?.success === true) {
        this.inviteMessage = $localize `:@@Käyttäjän kutsuminen onnistui:Lähetettiin kutsu onnistuneesti` + '.';
      } else {
        console.log('kutsun lähettäminen epäonnistui.');
      }
    }).catch(err => {
      this.inviteErrorMessage = $localize `:@@Käyttäjän kutsuminen epäonnistui:Kutsun lähettäminen ulkopuoliselle käyttäjälle ei onnistunut` + '.';
    })
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
      if (!this.courseid) throw Error('Ei kurssi ID:ä.');
      this.courses.importFAQs(this.courseid, jsonData)
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
    if (!this.courseid) throw Error('Ei kurssi ID:ä.');
    this.courses.setTicketField(this.courseid, this.fieldList)
      .then(response => {
        if (response === true ) {
          this.message = $localize `:@@Tallennettu:Tallennettu`;
          this.isDirty = false;
          if (this.courseid) this.fetchTicketFieldInfo(this.courseid);
        } else {
          throw Error('Ei onnistunut.');
        }
    }).catch (error => {
      this.errorMessage = $localize `:@@Kenttäpohjan muuttaminen ei onnistunut:
      Kenttäpohjan muuttaminen ei onnistunut.`;
    })
  }

  private trackIfParticipant() {
    let participant: boolean | null = false;
    this.store.trackIfParticipant().pipe(
      takeWhile(res => participant === null)
    ).subscribe(res => {
      participant = res;
      if (res === false) {
        const route = `/course/${this.courseid}/forbidden`;
        this.router.navigateByUrl(route);
      }
    })
  }

  private trackUserInfo() {
    let user: User | undefined | null = null;
    this.store.trackUserInfo().pipe(
      takeWhile((res) => user === undefined)
      ).subscribe(res => {
      if (res?.nimi ) user = res;
      if (res?.asema === 'opiskelija') {
        const route = `/course/${this.courseid}/forbidden`;
        this.router.navigateByUrl(route);
      }
    })
  }

}
