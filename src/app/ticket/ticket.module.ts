import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { TicketRoutingModule } from './ticket-routing.module';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// MatFormFieldModule,
// MatInputModule,

import { FaqViewComponent } from './faq-view/faq-view.component';
import { MessageComponent } from './components/message/message.component';
import { SubmitFaqComponent } from './submit-faq/submit-faq.component';
import { ViewAttachmentsComponent } from './components/view-attachments/view-attachments.component';
import { EditAttachmentsComponent } from './components/edit-attachments/edit-attachments.component';
import { CommentComponent } from './components/comment/comment.component';
import { TicketListComponent } from './listing/ticket-list/ticket-list.component';


@NgModule({
  declarations: [
    EditAttachmentsComponent,
    FaqViewComponent,
    MessageComponent,
    SubmitFaqComponent,
    SubmitTicketComponent,
    TicketViewComponent,
    ViewAttachmentsComponent,
    CommentComponent,
    TicketListComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatSortModule,
    SharedModule,
    TicketRoutingModule,
  ],
  exports: [
    TicketListComponent
  ]
})

export class TicketModule { }
