import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { MatDialogModule } from '@angular/material/dialog';

const materialModules = [
  MatInputModule,
  MatCardModule,
  MatFormFieldModule,
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatToolbarModule,
  MatRadioModule,
  MatMenuModule,
  MatSelectModule,
  MatTableModule,
  MatSortModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatAutocompleteModule
];

/**
 * Muiden moduulien käyttämät Angular Material -moduulit. Erillään shared.modulesta
 * ryhmittelyn vuoksi. Jos jokin moduuli on käytössä ainoastaan tietyssä
 * yhdessä moduulissa, voidaan se määritellä siellä tämän sijaan.
 *
 * @export
 * @class MaterialModule
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule, ...materialModules
  ],
  exports: [
    materialModules
  ]
})
export class MaterialModule { }
