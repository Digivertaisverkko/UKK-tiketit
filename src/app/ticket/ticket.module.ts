import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { NgModule } from '@angular/core';
import { TicketRoutingModule } from './ticket-routing.module';
import { TicketViewComponent } from './ticket-view/ticket-view.component';

import { CommentComponent } from './components/comment/comment.component';
import { EditAttachmentsComponent } from './components/edit-attachments/edit-attachments.component';
import { FaqViewComponent } from './faq-view/faq-view.component';
import { ListingComponent } from './listing/listing.component';
import { MessageComponent } from './components/message/message.component';
import { SharedModule } from '../shared/shared.module';
import { SubmitFaqComponent } from './submit-faq/submit-faq.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { TicketListComponent } from './listing/ticket-list/ticket-list.component';
import { ViewAttachmentsComponent } from './components/view-attachments/view-attachments.component';

/**
 * Tiketteihin eli kysymyksiin liittyvä toiminnallisuus.
 *
 * @export
 * @class TicketModule
 */
@NgModule({
  declarations: [
    CommentComponent,
    EditAttachmentsComponent,
    FaqViewComponent,
    ListingComponent,
    MessageComponent,
    SubmitFaqComponent,
    SubmitTicketComponent,
    TicketListComponent,
    TicketViewComponent,
    ViewAttachmentsComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatSortModule,
    SharedModule,
    TicketRoutingModule,
  ]
})

export class TicketModule { }
