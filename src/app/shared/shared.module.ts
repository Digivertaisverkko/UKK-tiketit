import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';

@NgModule({
  declarations: [],
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
    MaterialModule
  ]
})
export class SharedModule { }
