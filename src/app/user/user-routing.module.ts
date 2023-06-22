import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: 'course/:courseid/login', component: LoginComponent },
  { path: 'course/:courseid/register', component: RegisterComponent },
  {
    path: 'course/:courseid/profile',
    component: ProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UserRoutingModule { }
