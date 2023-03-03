import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { TicketService, KentanTiedot } from 'src/app/ticket/ticket.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';

@Component({
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.scss']
})

export class EditFieldComponent implements OnInit {
  public allFields: KentanTiedot[] = [];
  public field: KentanTiedot;
  public errorMessage: string = '';
  public isInIframe: boolean;
  public isRemovePressed: boolean = false;
  public courseID: string = '';
  public courseName: string = '';
  public multipleSelection: boolean = false;
  public fieldID: string | null = null;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public addOnBlur = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
  ) {
    this.isInIframe = getIsInIframe();
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

  private trackRouteParameters() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        // this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.fieldID  = paramMap.get('fieldid');
      this.courseID = courseID;
      this.showCourseName(this.courseID);
      // Kentän id on uudella kentällä null.
      this.getFieldInfo(courseID, this.fieldID);
    });
  }

  public add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) this.field.valinnat.push(value);
    event.chipInput!.clear();
  }

  public remove(valinta: string): void {
    const index = this.field.valinnat.indexOf(valinta);
    if (index >= 0) this.field.valinnat.splice(index, 1);
  }

  public edit(valinta: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.remove(valinta);
      return;
    }
    const index = this.field.valinnat.indexOf(valinta);
    if (index >= 0) this.field.valinnat[index] = value;
  }

  private getFieldInfo(courseID: string, fieldID: string | null) {
    this.ticketService.getTicketFieldInfo(courseID).then(response => {
      if (response[0].id) {
        // Tarvitaan tietojen lähettämiseen.
        this.allFields = response.map(field => {
          return {
            ...field, id: field.id?.toString()
          }
        });
        if (fieldID != null) {
          let matchingField = response.filter((field: KentanTiedot) => String(field.id) == fieldID);
          if (matchingField == null) {
            console.error('Virhe: ei oikeutta kentän tietoihin.');
          } else {
            this.field = matchingField[0];
             // Jos ei valintoja, niin oletuksena valinnat-array sisältää yhden alkion "", mitä ei haluta.
            if (this.field.valinnat[0].length === 0) {
              this.field.valinnat = [];
              this.multipleSelection = false;
            } else {
              this.multipleSelection = true;
            }
          }
        }
        console.log('Muokattavan kentän tiedot: ' + JSON.stringify(this.field));
      }
    }).catch(error => {
      this.errorMessage = "Ei saatu luettua kentän tietoja.";
    })
  }

  private showCourseName(courseID: string) {
    this.ticketService.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
  }

  public sendField(removeExisting?: boolean): void {
    if (this.multipleSelection === false) this.field.valinnat = [];
    if (this.fieldID == null) {   // Ellei ole uusi kenttä.
      this.allFields.push(this.field);
    } else {
      const index = this.allFields.findIndex(field => field.id == this.fieldID);
      if (removeExisting) {
        this.allFields.splice(index, 1);
      } else {
        this.allFields.splice(index, 1, this.field)
      }
      // this.allFields = this.allFields.filter(field => field.id !== this.fieldID);
    }
    this.ticketService.setTicketFieldInfo(this.courseID, this.allFields).then(response => {
      if (response === true ) {
        this.router.navigate(['/course/' + this.courseID + '/settings'], { state: { delayFetching: 'true' } });
      } else {
        console.log('Tikettipohjan muuttaminen epäonnistui.');
      }
    }).catch (error => {
      this.errorMessage = 'Kenttäpohjan muuttaminen ei onnistunut.';
    })
  }

  public changeRemoveButton() {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

}
