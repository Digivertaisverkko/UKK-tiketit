import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from './core/core.module';

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
    BrowserAnimationsModule,
    UserManagementModule,
    TestingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
