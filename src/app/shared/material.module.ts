// Material elements which are used in core app here.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

const materialModules = [
  MatInputModule,
  MatCardModule,
  MatFormFieldModule,
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatToolbarModule
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
