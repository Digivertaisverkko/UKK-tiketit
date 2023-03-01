import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseRoutingModule } from './course-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SettingsComponent } from './settings/settings.component';
import { EditFieldComponent } from './edit-field/edit-field.component';

@NgModule({
  declarations: [
    SettingsComponent,
    EditFieldComponent
  ],
  imports: [
    CommonModule,
    CourseRoutingModule,
    DragDropModule,
    SharedModule,
  ]
})
export class CourseModule { }
