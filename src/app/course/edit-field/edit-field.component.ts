import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Constants } from '../../shared/utils';
import { TicketService, KentanTiedot } from 'src/app/ticket/ticket.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent, MatChipGrid } from '@angular/material/chips';
import { Title } from '@angular/platform-browser';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.scss']
})

export class EditFieldComponent implements OnInit {
  public addOnBlur = true;
  // Kaikki kurssilla olevat lisäkentät.
  public allFields: KentanTiedot[] = [];
  public courseID: string = '';
  public courseName: string = '';
  public errorMessage: string = '';
  public field: KentanTiedot;
  public fieldID: string | null = null;
  public form: FormGroup = this.buildForm();
  public isLoaded: boolean = false;
  public isRemovePressed: boolean = false;
  public multipleSelection: boolean = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public showConfirm: boolean = false;
  @ViewChild('chipGrid') chipGrid: MatChipGrid | null = null;

  get multipleSelections(): FormArray {
    return this.form.get("multipleSelections") as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
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
    this.trackRouteParameters();
  }

  public addSelection(event: MatChipInputEvent): void {

    const value = (event.value || '').trim();
    if (value) {
      this.multipleSelections.push(new FormControl(value));
      this.multipleSelections.markAsDirty();
      this.field.valinnat.push(value);
    }
    event.chipInput!.clear();
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      title: [ '', Validators.required ],
      multipleSelections: this.formBuilder.array([
        this.formBuilder.control('')
      ]),
      infoText: [ '' ],
      mandatory: [ '' ],
    })
  }

  // Luodaan lomakkeelle lisävalintojen kontrollit.
  private buildMultipleSelections(selections: string[]): void {
    const validators = Validators.maxLength(255);
    this.field.valinnat.forEach(selection => {
      this.multipleSelections.push(new FormControl(selection, validators))
      this.form.addControl(selection, this.multipleSelections);
    })
    // for (const selection of selections) {
    //   const validators = Validators.maxLength(255);
    //   // this.multipleSelections.push(this.formBuilder.control(selection));
    //   this.multipleSelections.push(new FormControl(selection, validators))
    // }
  }

  public changeRemoveButton() {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  private createField(): KentanTiedot {
    let field: KentanTiedot = {} as KentanTiedot;
    const controls = this.form.controls;
    field.id = this.field.id;
    field.otsikko = controls['title'].value;
    field.pakollinen = controls['mandatory'].value;
    // TODO: Esitäytettävä ei vielä käytössä.
    field.esitaytettava = this.field.esitaytettava;
    field.ohje = controls['infoText'].value;
    field.valinnat = this.field.valinnat;
    return field
  }

  public edit(valinta: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.remove(valinta);
      return;
    }
    let index = this.field.valinnat.indexOf(valinta);
    if (index >= 0) this.field.valinnat[index] = value;

    index = this.multipleSelections.value.indexOf(valinta);
    if (index >= 0) {
      this.multipleSelections.markAsDirty();
    } 
  }

  // Hae kentän tiedot editoidessa olemassa olevaa.
  private getFieldInfo(courseID: string, fieldID: string | null) {
    this.ticketService.getTicketFieldInfo(courseID).then(response => {
      if (!Array.isArray(response)) {
        throw new Error('Ei saatu haettua kenttäpohjan tietoja.');
      }
      // Tarvitaan tietojen lähettämiseen.
      this.allFields = response;
      // this.allFields = response.map(field => {
      //   return {
      //     ...field, id: field.id?.toString()
      //   }
      // });

      console.log('alla kaikki kentät');
      console.dir(this.allFields);
      if (!fieldID) return

      let matchingField = response.filter(field => {
        return String(field.id) === fieldID
      });
      if (matchingField == null) {
        throw new Error('Ei saatu haettua kenttäpohjan tietoja.');
      }
      this.field = matchingField[0];
        // Jos ei valintoja, niin oletuksena valinnat-array sisältää yhden
        // alkion "", mitä ei haluta.
      if (this.field.valinnat[0].length === 0) {
        this.field.valinnat = [];
        this.multipleSelection = false;
      } else {
        this.multipleSelection = true;
      }

      this.titleServ.setTitle(Constants.baseTitle + ' ' + 
          $localize `:@@Lisäkenttä:Lisäkenttä` + ' - ' + this.field.otsikko);
      this.form.controls['title'].setValue(this.field.otsikko);
      this.form.controls['infoText'].setValue(this.field.ohje);
      this.form.controls['mandatory'].setValue(this.field.pakollinen);
      this.buildMultipleSelections(this.field.valinnat);
      console.log('controllerit:');
      console.dir(this.multipleSelections);
      // console.log('form:');
      // console.dir(this.form);
      // console.log('Muokattavan kentän tiedot: ' + JSON.stringify(this.field));
      // console.log('alla kaikki kentät');
      // console.dir(this.allFields);
      this.isLoaded = true
      return
    }).catch(error => {
      console.dir(error);
      this.errorMessage = $localize `:@@Lisäkentän tietojen haku epäonnistui:
          Lisäkentän tietojen haku epäonnistui` + '.';
          this.isLoaded = true
    }).finally( () => this.isLoaded = true)
  }

  onArrowLeft(event: any) {
    console.log('Vasen nuoli painettu');
    // event.target === this.input.nativeElement &&
    if (event.key === 'ArrowLeft' && event.target.selectionStart === 0) {
      // if (this.chipGrid != null) this.chipGrid.last.focus();
    }
  }

  public remove(valinta: string): void {
    let index = this.field.valinnat.indexOf(valinta);
    if (index >= 0) this.field.valinnat.splice(index, 1);
    index = this.multipleSelections.value.indexOf(valinta);
    if (index >= 0) {
      this.multipleSelections.removeAt(index);
      this.multipleSelections.markAsDirty();
    } 
  }

  private showCourseName(courseID: string) {
    this.ticketService.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

  public sendField(removeExisting?: boolean): void {
    if (this.form.invalid) return
    if (this.multipleSelection === false) this.field.valinnat = [];
    const newField = this.createField();
    if (this.fieldID == null) {   // Ellei ole uusi kenttä.
      this.allFields.push(newField);
    } else {
      const index = this.allFields.findIndex(field => field.id == this.fieldID);
      if (removeExisting) {
        this.allFields.splice(index, 1);
      } else {
        this.allFields.splice(index, 1, newField)
      }
    // this.allFields = this.allFields.filter(field => field.id !== this.fieldID);
    }
    this.ticketService.setTicketFieldInfo(this.courseID, this.allFields)
      .then(response => {
        if (response === true ) {
          this.router.navigate(['/course/' + this.courseID + '/settings'],
              { state: { delayFetching: 'true' } });
        } else {
          console.log('Tikettipohjan muuttaminen epäonnistui.');
        }
      }).catch (() => {
        // TODO: käännä.
        this.errorMessage = 'Kenttäpohjan muuttaminen ei onnistunut.';
      })
  }

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        // this.stopLoading();
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.fieldID  = paramMap.get('fieldid');
      // console.log('fieldID tyyppi:');
      // console.log(typeof this.fieldID);
      // console.dir(this.fieldID);
      this.courseID = courseID;
      this.showCourseName(this.courseID);
      // Kentän id on uudella kentällä null.
      if  (!this.fieldID) {
        this.titleServ.setTitle(Constants.baseTitle + $localize
            `:@@Uusi lisäkenttä:Uusi lisäkenttä`);
      }
      // Lähetykseen tarvitaan tiedot kaikista kentistä, vaikka lähetetään
      // uusi kenttä.
      this.getFieldInfo(courseID, this.fieldID);
    });
  }

}
