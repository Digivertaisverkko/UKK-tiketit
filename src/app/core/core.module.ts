/* singleton services and modules shared throughout the application. This module should
 * only be imported by app.module. */

// Yleiset moduulit
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

// Material moduulit
import { MatDialogConfig, MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../shared/material.module';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
// import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle'

// Servicet
import { AuthService } from './auth.service';
import { CustomHttpInterceptor } from './http-interceptor';

// Komponentit
import { DataConsentComponent } from './data-consent/data-consent.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from '../core/header/header.component';
import { NoPrivilegesComponent } from './no-privileges/no-privileges.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PrivacyModalComponent } from './footer/privacy-modal/privacy-modal.component';

@NgModule({
  declarations: [
    DataConsentComponent,
    FooterComponent,
    HeaderComponent,
    NoPrivilegesComponent,
    PageNotFoundComponent,
    PrivacyModalComponent,
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
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true},
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue:
        { autoFocus: 'dialog' } as MatDialogConfig }

  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})
export class CoreModule { }
