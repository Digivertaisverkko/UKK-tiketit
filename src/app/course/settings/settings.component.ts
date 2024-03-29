import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Observable, takeWhile, timer } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { CourseService } from '../course.service';
import { environment } from 'src/environments/environment';
import { GenericResponse, Role, User } from '@core/core.models';
import { isEmail } from '@shared/directives/is-email.directive';
import { Kenttapohja } from '../course.models';
import { StoreService } from '@core/services/store.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Näkymä kurssin asetusten katseluun ja muokkaamiseen. Lisäkenttien muokkaamiseen
 * on edit-field -näkymä.
 *
 * @export
 * @class SettingsComponent
 * @implements {OnInit}
 */
@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Input() courseid!: string;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public errorMessage: string = '';
  public fieldList: Kenttapohja[] = [];
  public form: FormGroup = this.buildForm();
  public inviteErrorMessage: string = '';
  public inviteMessage: string = '';
  public isLoaded: boolean = false;
  public message: string = '';
  public settingsError: string = '';
  public settingsForm: FormGroup = this.buildSettingsForm();
  public settingsMessage: string = '';
  public showConfirm: boolean = false;
  private fetchFieldTimer$: Observable<number>;
  private readonly POLLING_RATE_MIN = ( environment.production == true ) ? 5 : 5;

  constructor(
    private courses: CourseService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private router: Router,
    private store: StoreService,
    private titleServ: Title
  ) {
    const POLLING_RATE_MS = this.POLLING_RATE_MIN * this.store.getMsInMin();
    this.fetchFieldTimer$ = timer(0, POLLING_RATE_MS).pipe(takeUntilDestroyed());
  }

  get email(): AbstractControl {
    return this.form.get('email') as FormControl;
  }

  get helpText(): AbstractControl {
    return this.settingsForm.get('helpText') as FormControl;
  }

  get role(): AbstractControl {
    return this.form.get('role') as FormControl;
  }

  ngOnInit(): void {
    this.titleServ.setTitle(this.store.getBaseTitle() + $localize
        `:@@Kurssin asetukset:Kurssin asetukset`);
    this.trackUserInfo();
    this.startPollingFields(this.POLLING_RATE_MIN);
  }

  // Tee Form asetuksia varten.
  private buildSettingsForm(): FormGroup {
    return this.formBuilder.group({
      helpText: [ '' ]
    })
  }

  // Tee Form sähköpostia varten.
  private buildForm(): FormGroup {
    return this.formBuilder.group({
      email: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      role: [ 1 ]
    }, {
      validators: [ isEmail('email') ]
    }
    )
  }

  // Lisäkenttien drag & drop:n jälkeen tehtävä.
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fieldList, event.previousIndex, event.currentIndex);
    this.saveFields();
  }

  // Lataa UKK tai asetukset tiedostona.
  public export(type: 'FAQs' | 'settings') {
    let exportPromise: Promise<string>;
    let filenameStart: string = '';
    if (type === 'FAQs') {
      filenameStart = $localize `:@@UKK:UKK`;
      exportPromise = this.courses.exportFAQs(this.courseid);
    } else if (type === 'settings') {
      filenameStart = $localize `:@@Asetukset:Asetukset`;
      exportPromise = this.courses.exportSettings(this.courseid);
    } else {
      throw Error('settings.component.export: Väärä parametri.');
    }
    const courseName = this.store.getCourseName();
    const filename = `${filenameStart}-${courseName}.json`;
    exportPromise.then(filecontent => {
      if (filecontent.length === 0) return  // Testaamisessa hyödynnetään.
      const link = this.renderer.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute(
          'href',
          "data:text/json;charset=UTF-8," + encodeURIComponent(filecontent));
      link.setAttribute('download', filename);
      link.click();
      link.remove();
    })
    .catch(() => {
      this.errorMessage = $localize `:@@Tiedoston lataaminen epäonnistui:
          Tiedoston lataaminen epäonnistui` + '.';
    });
  }

  // Hae tiketin lisäkentät ja kuvaus ja päivitä ne lomakkeeseen.
  private fetchTicketFieldInfo(courseid: string) {
    this.courses.getTicketFieldInfo(courseid).then(response => {
      if (response.kentat[0]?.otsikko != null) {
        this.fieldList = response.kentat;
      }
      if (response.kuvaus) {
        this.settingsForm.controls['helpText'].setValue(response.kuvaus);
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

  private importFAQs(courseID: string, jsonData: JSON) {
    this.courses.importFAQs(courseID, jsonData).then((res: GenericResponse) => {
      if (res?.success === true) {
        this.message = $localize `:@@Lisättiin usein kysytyt kysymykset tälle kurssille:
            Lisättiin usein kysytyt kysymykset tälle kurssille` + '.';
      }
    }).catch(e => {
      this.errorMessage = $localize `:@@UKKden lisääminen epäonnistui:
        Usein kysyttyjen kysymysten lisääminen tälle kurssille ei onnistunut.`;
    })
  }

  private importSettings(courseID: string, jsonData: JSON) {
    this.courses.importSettings(courseID, jsonData).then((res: GenericResponse) => {
      if (res?.success === true) {
        if (this.courseid) this.fetchTicketFieldInfo(this.courseid);
        this.message = $localize `:@@Lisättiin lisäkentät tälle kurssille:
            Lisättiin asetukset tälle kurssille` + '.';
      }
    }).catch(e => {
      this.errorMessage = $localize `:@@Lisäkenttien lisääminen epäonnistui:
          Lisäkenttien lisääminen epäonnistui` + '.';
    })
  }

  public onDragStarted() {
    this.errorMessage = '';
    this.message='';
  }

  // Kutsu ulkopuolisia kurssille.
  public submitInvite() {
    this.form.markAllAsTouched();
    this.inviteErrorMessage = '';
    this.inviteMessage = '';
    if (this.form.invalid) {
      console.error('Form on virheellinen.');
      return;
    }
    const email = this.form.controls['email'].value;
    const checkboxValue = this.form.controls['role'].value;
    const role: Role = this.getRole(checkboxValue);
    this.courses.sendInvitation(this.courseid, email, role).then(res => {
      if (res?.success === true) {
        this.inviteMessage = $localize `:@@Käyttäjän kutsuminen onnistui:Kutsu välitettiin lähetettäväksi` + '.';
      } else {
        throw Error
      }
    }).catch(() => {
      this.inviteErrorMessage = $localize `:@@Käyttäjän kutsuminen epäonnistui:Kutsun lähettäminen ulkopuoliselle käyttäjälle ei onnistunut` + '.';
    })
  }

  public submitHelpText() {
    if (this.settingsForm.invalid) return;
    this.settingsError = '';
    this.settingsMessage = '';
    const helpText = this.helpText.value;
    this.courses.setHelpText(this.courseid, helpText).then(res => {
      if (res?.success === true) {
        if (this.courseid) this.fetchTicketFieldInfo(this.courseid);
        this.settingsMessage = $localize `:@@Kysymysten lisäohjeen tallentaminen onnistui:Kysymysten lisäohjeen tallentaminen onnistui` + '.';
        this.settingsForm.markAsPristine();
      } else {
        throw Error
      }
    }).catch(e => {
      this.settingsError = $localize `:@@Kysymysten lisäohjeen tallentaminen ei onnistunut:Kysymysten lisäohjeen tallentaminen ei onnistunut` + '.';
    })
  }

  // Valitse UKK- tai asetustiedosto (jonka jälkeen se lisätään).
  public pickFile(type: 'FAQs' | 'settings') {
    const fileInput = this.fileInput.nativeElement;
    fileInput.click();
    this.errorMessage = '';
    fileInput.addEventListener('change', (event: any) => {
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
        if (type === 'FAQs') {
          this.importFAQs(this.courseid, jsonData);
        } else if (type === 'settings') {
          this.importSettings(this.courseid, jsonData);
        }
      }
      fileReader.readAsText(file);
    })
  }

  // Tallenna lisäkentät drag & drobin jälkeen.
  public saveFields() {
    if (!this.courseid) throw Error('Ei kurssi ID:ä.');
    this.courses.setTicketField(this.courseid, this.fieldList).then(response => {
        if (response === true) {
          this.message = $localize `:@@Tallennettu:Tallennettu`;
          if (this.courseid) this.fetchTicketFieldInfo(this.courseid);
        } else {
          throw Error('Ei onnistunut.');
        }
    }).catch (error => {
      this.errorMessage = $localize `:@@Lisäkenttien järjestyksen muuttaminen ei onnistunut:Lisäkenttien järjestyksen muuttaminen ei onnistunut` + '.';
    })
  }

  // Hae tiketit tietyn ajan välein.
  private startPollingFields(POLLING_RATE_MIN: number) {
    console.log(`Aloitetaan kenttäpohjien pollaus joka ${POLLING_RATE_MIN} minuutti.`);
    let fetchStartTime: number | undefined;
    let elapsedTime: number | undefined;
    const POLLING_RATE_SEC = POLLING_RATE_MIN * 60;
    this.fetchFieldTimer$.subscribe(() => {
      this.fetchTicketFieldInfo(this.courseid!);
      if (fetchStartTime) {
        elapsedTime = Math.round((Date.now() - fetchStartTime) / 1000);
        console.log('Kenttäpohjien pollauksen viime kutsusta kulunut aikaa ' +
          `${elapsedTime} sekuntia.`);
        if (elapsedTime !== POLLING_RATE_SEC) {
          console.log(`Olisi pitänyt kulua ${POLLING_RATE_SEC} sekuntia.`);
        }
      }
      fetchStartTime = Date.now();
    });
  }

  // Ohjaa /forbidden, jos rooli on opiskelija.
  private trackUserInfo() {
    let user: User | undefined | null = null;
    this.store.trackUserInfo().pipe(
      takeWhile((res) => user === undefined)
      ).subscribe(res => {
      if (res?.nimi ) user = res;
      if (user === null || user?.asema === 'opiskelija' ||
            user?.osallistuja === false)  {
        const route = `/course/${this.courseid}/forbidden`;
        this.router.navigateByUrl(route);
      }
    })
  }

}
