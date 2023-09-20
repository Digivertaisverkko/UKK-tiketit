import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { UserRoutingModule } from './user-routing.module';

/**
 * Käyttäjiin liittyvä toiminnallisuus.
 *
 * @export
 * @class UserModule
 */
@NgModule({
  declarations: [
    LoginComponent,
    ProfileComponent,
    RegisterComponent
  ],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})

export class UserModule { }
 