// Material elements which are used in core app here.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

const materialModules = [
  MatInputModule,
  MatCardModule,
  MatTabsModule,
  MatFormFieldModule,
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule
];

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
