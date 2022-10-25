/* singleton services and modules shared throughout the application. This module should
 * only be imported by app.module. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../shared/material.module';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

import { AuthService } from './auth.service';

import { HeaderComponent } from '../core/header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    MatMenuModule,
    RouterModule
  ],
  providers: [
    AuthService
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})
export class CoreModule { }
