import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators }
    from '@angular/forms';
import { Router } from '@angular/router';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent, MatChipGrid }
    from '@angular/material/chips';
import { Title } from '@angular/platform-browser';

import { arrayLengthValidator } from '@shared/directives/array-length.directive';
import { CourseService } from '../course.service';
import { Kenttapohja } from '../course.models';
import { StoreService } from '@core/services/store.service';

@Component({
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.scss']
})

export class EditFieldComponent implements OnInit {
  @Input() courseid: string = '';
  @Input() fieldid: string | null = null;
  public addOnBlur = true;
  public allFields: Kenttapohja[] = [];  // Kaikki kurssilla olevat lisäkentät.
  public errorMessage: string = '';
  public field: Kenttapohja;
  public form: FormGroup = this.buildForm();
  public isLoaded: boolean = false;
  public isRemovePressed: boolean = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public showConfirm: boolean = false;
  @ViewChild('chipGrid') chipGrid: MatChipGrid | null = null;

  get areSelectionsEnabled(): FormControl {
    return this.form.get('areSelectionsEnabled') as FormControl;
  }

  get selectionName(): AbstractControl<any, any> | null {
    return this.form.get('selectionName');
  }

  get selections(): AbstractControl<any, any> | null {
    return this.form.get('selections');
  }

  get title(): FormControl {
    return this.form.get('title') as FormControl;
  }

  constructor(
    private courses: CourseService,
    private formBuilder: FormBuilder,
    private router: Router,
    private store: StoreService,
    private titleServ: Title
  ) {
    this.field = {
      otsikko: '',
      pakollinen: false,
      esitaytettava: false,
      ohje: '',
      valinnat: []
    }
  }

  ngOnInit(): void {
    // Kentän id on uutta kenttää tehdessä null.
    if (this.fieldid === null) {
      this.titleServ.setTitle(this.store.getBaseTitle() + $localize
          `:@@Uusi lisäkenttä:Uusi lisäkenttä`);
    } else {
    /* Lähetykseen tarvitaan kaikkien kenttien tiedot, vaikka lähetettäisiin
       uusi kenttä. */
       this.getFieldInfo(this.courseid, this.fieldid);
    }
  }

  public addSelection(event: MatChipInputEvent): void {
    const selection = (event.value || '').trim();
    if (selection) {
      this.selections?.markAsDirty();
      this.field.valinnat.push(selection);
    }
    event.chipInput!.clear();
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      title: [ '', Validators.required ],
      areSelectionsEnabled: [ true ],
      selections: [ [], [arrayLengthValidator()] ],
      selectionName: [ '' ],
      infoText: [ '' ],
      mandatory: [ '' ],
    })
  }

  // Monivalintojen merkkijonojen yhteismäärä välimerkit huomioiden.
  public getArraysStringLength(array: String[]): number {
    if (array.length === 0 ) return 0
    let totalLength = 0;
    for (let string of array) {
      totalLength += string.length;
    }
    // Muuttujien välilä on palvelimella välimerkki.
    totalLength += array.length - 1;
    return totalLength;
  }

  public changeRemoveButton() {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  private createField(): Kenttapohja {
    let field: Kenttapohja = {} as Kenttapohja;
    field.id = this.field.id;
    const controls = this.form.controls;
    field.otsikko = controls['title'].value;
    field.pakollinen = controls['mandatory'].value;
    // TODO: Esitäytettävä ei vielä käytössä.
    field.esitaytettava = this.field.esitaytettava;
    field.ohje = controls['infoText'].value;
    if (this.areSelectionsEnabled.value) {
      field.valinnat = controls['selections'].value;
    } else {
      field.valinnat = [];
    }
    return field
  }

  public editSelection(valinta: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.removeSelection(valinta);
      return;
    }
    let index = this.field.valinnat.indexOf(valinta);
    if (index >= 0) this.field.valinnat[index] = value;
  }

  // Aseta monivalinnan chipsit ja input field enabled tai disabled -tilaan.
  public enableSelections(enableSelections: boolean) {
    if (enableSelections) {
      this.selectionName?.enable();
      this.selections?.enable();
    } else {
      this.selectionName?.disable();
      this.selections?.disable();
    }
  }

  // Hae kentän tiedot editoidessa olemassa olevaa.
  private getFieldInfo(courseID: string, fieldID: string | null) {
    this.courses.getTicketFieldInfo(courseID).then(response => {
      if (!Array.isArray(response)) {
        throw new Error('Ei saatu haettua kenttäpohjan tietoja.');
      }
      // Tarvitaan tietojen lähettämiseen.
      this.allFields = response;

      if (this.allFields.length > 0 && this.fieldid) {
        let matchingField = response.filter(field => String(field.id) === fieldID);
        if (matchingField == null) {
          throw new Error('Ei saatu haettua kenttäpohjan tietoja.');
        }
        this.field = matchingField[0];
         // Jos ei valintoja, niin oletuksena valinnat-array sisältää yhden
        // alkion "", mitä ei haluta.
        if (this.field.valinnat[0].length === 0) this.field.valinnat = [];
        const areSelections: boolean = this.field.valinnat.length > 0;
        this.areSelectionsEnabled?.setValue(areSelections);
        this.enableSelections(areSelections);
      }

      this.setControls();
      this.titleServ.setTitle(this.store.getBaseTitle() + ' ' +
          $localize `:@@Lisäkenttä:Lisäkenttä` + ' - ' + this.field.otsikko);
      this.isLoaded = true;
      return
    }).catch(error => {
      console.dir(error);
      this.errorMessage = $localize `:@@Lisäkentän tietojen haku epäonnistui:
          Lisäkentän tietojen haku epäonnistui` + '.';
    }).finally( () => this.isLoaded = true)
  }

  // TODO: nuolella siirtyminen edelliseen chippiin.
  public onArrowLeft(event: any) {
    console.log('Vasen nuoli painettu');
    // event.target === this.input.nativeElement &&
    if (event.key === 'ArrowLeft' && event.target.selectionStart === 0) {
      // if (this.chipGrid != null) this.chipGrid.last.focus();
    }
  }

  public removeSelection(valinta: string): void {
    let index = this.field.valinnat.indexOf(valinta);
    if (index >= 0) this.field.valinnat.splice(index, 1);
  }

  // Lähetä kaikkien kenttien tiedot.§
  private sendAllFields(courseID: string, allFields: Kenttapohja[]) {
    this.courses.setTicketField(courseID, allFields)
      .then(response => {
        if (response === true ) {
          this.router.navigateByUrl('/course/' + courseID + '/settings')
        } else {
          throw Error;
        }
      }).catch (() => {
        this.errorMessage = $localize `:@@Kenttäpohjan muuttaminen ei onnistunut:
        Kenttäpohjan muuttaminen ei onnistunut.`;
      })
  }

  private setControls(): void {
    this.form.controls['title'].setValue(this.field.otsikko);
    this.form.controls['infoText'].setValue(this.field.ohje);
    this.form.controls['mandatory'].setValue(this.field.pakollinen);
    this.form.controls['selections'].setValue(this.field.valinnat);
  }

  // Päivitä kaikkien kenttien tiedot ennen lähettämistä.
  public updateAllFields(remove?: boolean): void {
    if (this.form.invalid || !this.courseid) return
    const newField = this.createField();
    if (this.fieldid == null) {   // Ellei ole uusi kenttä.
      this.allFields.push(newField);
    } else {
      const index = this.allFields.findIndex(field => field.id == this.fieldid);
      if (remove) {
        this.allFields.splice(index, 1);
      } else {
        this.allFields.splice(index, 1, newField)
      }
    }
    this.sendAllFields(this.courseid, this.allFields);
  }

}
