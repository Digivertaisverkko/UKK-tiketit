import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { UserManagementModule } from './user-management/user-management.module';
import { TestingModule } from './testing/testing.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    UserManagementModule,
    TestingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
