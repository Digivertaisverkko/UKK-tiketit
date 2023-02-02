import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { TicketRoutingModule } from './ticket-routing.module';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

// import { MatPaginatorIntl } from '@angular/material/paginator';
// import { CustomPaginator } from './functions/CustomPaginator';
import { FaqViewComponent } from './faq-view/faq-view.component';
import { MessageComponent } from './message/message.component';
import { SubmitFaqComponent } from './submit-faq/submit-faq.component';

@NgModule({
  declarations: [
    SubmitTicketComponent,
    TicketViewComponent,
    FaqViewComponent,
    MessageComponent,
    SubmitFaqComponent
  ],
  imports: [
    CommonModule,
    MatSortModule,
    TicketRoutingModule,
    SharedModule,
    MatCardModule,
  ],
  providers: [
    
  ]
})

// providers: [
//   Jos paginatorin haluaa.
//   { provide: MatPaginatorIntl, useValue: CustomPaginator() }
// ]
export class TicketModule { }
