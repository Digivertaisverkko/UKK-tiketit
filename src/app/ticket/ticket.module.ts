import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { TicketRoutingModule } from './ticket-routing.module';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { MatSortModule } from '@angular/material/sort';

import { MatCardModule } from '@angular/material/card';

import { EsimerkkiListingComponent } from './listing/esimerkki-listing.component';

@NgModule({
  declarations: [
    SubmitTicketComponent,
    TicketViewComponent,
    EsimerkkiListingComponent 
  ],
  imports: [
    CommonModule,
    MatSortModule,
    TicketRoutingModule,
    SharedModule,
    MatCardModule
  ]
})
export class TicketModule { }
