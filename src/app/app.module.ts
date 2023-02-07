import { APP_INITIALIZER, NgModule } from '@angular/core';
import { initializeSupportedLocales } from './app.initializers';
import { LOCALE_ID } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { TicketModule } from './ticket/ticket.module';
import { UserManagementModule } from './user-management/user-management.module';

import { AppComponent } from './app.component';
import { ListingComponent } from './ticket/listing/listing.component';
import { initializeLanguage  } from "./app.initializers";

// AppRoutingModule pitää tulla viimeisimpänä ennen muita routingeja sisältäviä
// moduuleja.
@NgModule({
  declarations: [
    AppComponent,
    ListingComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
    TicketModule,
    UserManagementModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: () => initializeLanguage, multi: true },
    { provide: LOCALE_ID, useFactory: initializeSupportedLocales }
  ],
  bootstrap: [AppComponent],
  exports: []
})

export class AppModule { }

// { provide: LOCALE_ID, useValue: 'fi' }
//  { provide: LOCALE_ID, useFactory: initializeSupportedLocales }
