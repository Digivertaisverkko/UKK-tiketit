import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontRoutingModule } from './front-routing.module';
import { FrontPageComponent } from './front-page/front-page.component';

@NgModule({
  declarations: [
    FrontPageComponent
  ],
  imports: [
    CommonModule,
    FrontRoutingModule
  ],
  providers: [

  ]
})
export class FrontModule { }
