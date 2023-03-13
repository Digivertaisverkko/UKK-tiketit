import { NgModule } from '@angular/core';
import { MatDividerModule }  from '@angular/material/divider';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { UserManagementRoutingModule } from './user-management-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    ProfileComponent,
    RegisterComponent
  ],
  imports: [
    MatDividerModule,
    SharedModule,
    UserManagementRoutingModule
  ],
  providers: [
  ]
})

export class UserManagementModule { }
 