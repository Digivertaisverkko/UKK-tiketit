import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { TicketRoutingModule } from './ticket-routing.module';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from './functions/CustomPaginator';
import { FaqViewComponent } from './faq-view/faq-view.component';

@NgModule({
  declarations: [
    SubmitTicketComponent,
    TicketViewComponent,
    FaqViewComponent
  ],
  imports: [
    CommonModule,
    MatSortModule,
    TicketRoutingModule,
    SharedModule,
    MatCardModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})

// providers: [
//   { provide: LOCALE_ID, useValue: 'fi-FI'},
//   { provide: MatPaginatorIntl, useValue: CustomPaginator() }
// ]
export class TicketModule { }
