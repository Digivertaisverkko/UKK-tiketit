import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseRoutingModule } from './course-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SettingsComponent } from './settings/settings.component';
import { DragDropModule } from '@angular/cdk/drag-drop'; 


@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    CourseRoutingModule,
    DragDropModule,
    SharedModule,
  ]
})
export class CourseModule { }
