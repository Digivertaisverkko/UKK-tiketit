import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { UserManagementRoutingModule } from './user-management-routing.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule }  from '@angular/material/divider';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    MatDividerModule,
    MatTabsModule,
    SharedModule,
    UserManagementRoutingModule
  ],
  providers: [
  ]
})

export class UserManagementModule { }
 