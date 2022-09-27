/* singleton services shared throughout the application. This module should
   only be imported by app.module. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [

  ]
})
export class CoreModule { }
