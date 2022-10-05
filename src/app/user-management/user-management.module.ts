import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { UserManagementRoutingModule } from './user-management-routing.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule }  from '@angular/material/divider';
import { RegisterComponent } from './register/register.component';
import { TestingHenriComponent } from './testing-henri/testing-henri.component';

import { AuthService } from 'src/app/core/auth.service';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    TestingHenriComponent,
  ],
  imports: [
    MatDividerModule,
    MatTabsModule,
    SharedModule,
    UserManagementRoutingModule
  ],
  providers: [
    AuthService
  ]
})

export class UserManagementModule { }
 