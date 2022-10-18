/* This file is to declare components, directives, and pipes when those
 * items will be re-used and referenced by the components declared in other
 * feature modules. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { ErrorCardComponent } from './error-card/error-card.component';

@NgModule({
  declarations: [
    ErrorCardComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    ErrorCardComponent
  ]
})
export class SharedModule { }
