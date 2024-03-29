import { EditFieldComponent } from './edit-field/edit-field.component';
import { JoinComponent } from './join/join.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: 'course/:courseid/join', component: JoinComponent },
  { path: 'course/:courseid/settings', component: SettingsComponent },
  {
    path: 'course/:courseid/settings/field/:fieldid',
    component: EditFieldComponent,
  },
  { path: 'course/:courseid/settings/field', component: EditFieldComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseRoutingModule {}
