import { NgModule } from '@angular/core';
import { MatDividerModule }  from '@angular/material/divider';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    ProfileComponent,
    RegisterComponent
  ],
  imports: [
    MatDividerModule,
    SharedModule,
    UserRoutingModule
  ],
  providers: [
  ]
})

export class UserModule { }
 