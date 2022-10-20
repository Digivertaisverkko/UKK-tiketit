/* singleton services and modules shared throughout the application. This module should
 * only be imported by app.module. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../shared/material.module';

import { AuthService } from './auth.service';

import { HeaderComponent } from '../core/header/header.component';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
  ],
  providers: [
    AuthService
  ],
  exports: [
    HeaderComponent
  ]
})
export class CoreModule { }
