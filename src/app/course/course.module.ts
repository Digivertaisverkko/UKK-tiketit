import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseRoutingModule } from './course-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';

import { SettingsComponent } from './settings/settings.component';
import { EditFieldComponent } from './edit-field/edit-field.component';
import { JoinComponent } from './join/join.component';

/**
 * Kursseihin liittyvä toiminnallisuus.
 *
 * @export
 * @class CourseModule
 */
@NgModule({
  declarations: [
    SettingsComponent,
    EditFieldComponent,
    JoinComponent
  ],
  imports: [
    CommonModule,
    CourseRoutingModule,
    DragDropModule,
    SharedModule,
    MatChipsModule
  ]
})
export class CourseModule { }
