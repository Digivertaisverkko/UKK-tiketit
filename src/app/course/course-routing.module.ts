import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../user-management/auth.guard';
import { SettingsComponent } from './settings/settings.component';
import { EditFieldComponent } from './edit-field/edit-field.component';

const routes: Routes = [
  { path: 'course/:courseid/settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'course/:courseid/settings/field/:fieldid', component: EditFieldComponent, canActivate: [authGuard] },
  { path: 'course/:courseid/settings/field', component: EditFieldComponent, canActivate: [authGuard] }
];

// { path: '', component: AppComponent }

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourseRoutingModule { }
