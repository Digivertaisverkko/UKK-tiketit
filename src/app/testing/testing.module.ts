import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestingRoutingModule } from './testing-routing.module';
import { TestPageComponent } from './test-page/test-page.component';

@NgModule({
  declarations: [
    TestPageComponent
  ],
  imports: [
    CommonModule,
    TestingRoutingModule
  ],
  providers: [

  ]
})
export class TestingModule { }
