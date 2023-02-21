import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { TicketRoutingModule } from './ticket-routing.module';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// MatFormFieldModule,
// MatInputModule,


// import { MatPaginatorIntl } from '@angular/material/paginator';
// import { CustomPaginator } from './functions/CustomPaginator';
import { FaqViewComponent } from './faq-view/faq-view.component';
import { MessageComponent } from './message/message.component';
import { SubmitFaqComponent } from './submit-faq/submit-faq.component';
import { ViewAttachmentsComponent } from './components/view-attachments/view-attachments.component';
import { EditAttachmentsComponent } from './components/edit-attachments/edit-attachments.component';


@NgModule({
  declarations: [
    SubmitTicketComponent,
    TicketViewComponent,
    FaqViewComponent,
    MessageComponent,
    SubmitFaqComponent,
    ViewAttachmentsComponent,
    EditAttachmentsComponent,
  ],
  imports: [
    CommonModule,
    MatSortModule,
    TicketRoutingModule,
    SharedModule,
    MatCardModule,
    MatListModule,
  ]
})

// providers: [
//   Jos paginatorin haluaa.
//   { provide: MatPaginatorIntl, useValue: CustomPaginator() }
// ]
export class TicketModule { }
