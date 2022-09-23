import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';

import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    UserManagementRoutingModule
  ]
})
export class UserManagementModule { }
 