/* singleton services and modules shared throughout the application. This module should
 * only be imported by app.module. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../shared/material.module';
import { MatSidenavModule } from '@angular/material/sidenav';

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
    MatSidenavModule
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
