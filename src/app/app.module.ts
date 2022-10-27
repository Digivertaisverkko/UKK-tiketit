import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { UserManagementModule } from './user-management/user-management.module';
import { FrontModule } from './front/front.module';
import { SubmitModule } from './submit-ticket/submit.module';

import { AppComponent } from './app.component';
import { ListingComponent } from './ticket-list/listing/listing.component';

@NgModule({
  declarations: [
    AppComponent,
    ListingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    UserManagementModule,
    FrontModule,
    SubmitModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
  ]
})
export class AppModule { }
