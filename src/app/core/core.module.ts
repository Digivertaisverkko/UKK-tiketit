/* singleton services and modules shared throughout the application. This module should
 * only be imported by app.module. */

// Yleiset moduulit
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

// Material moduulit
import { MaterialModule } from '../shared/material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
// import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle'

// Servicet
import { AuthService } from './auth.service';
import { CustomHttpInterceptor } from './http-interceptor';

// Komponentit
import { HeaderComponent } from '../core/header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PrivacyModalComponent } from './footer/privacy-modal/privacy-modal.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NoPrivilegesComponent } from './no-privileges/no-privileges.component';
import { DataConsentComponent } from './data-consent/data-consent.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PrivacyModalComponent,
    PageNotFoundComponent,
    NoPrivilegesComponent,
    DataConsentComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatDialogModule,
    MaterialModule,
    MatListModule,
    MatMenuModule,
    MatRippleModule,
    RouterModule,
    SharedModule,
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true}
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})
export class CoreModule { }
