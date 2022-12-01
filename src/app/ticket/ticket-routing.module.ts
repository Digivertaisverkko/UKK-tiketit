import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { ListingComponent } from './listing/listing.component';
import { FaqViewComponent } from './faq-view/faq-view.component';


const routes: Routes = [
  { path: 'ticket-view/:id', component: TicketViewComponent },
  { path: 'faq-view/:id', component: FaqViewComponent },
  { path: 'submit', component: SubmitTicketComponent},
  { path: 'list-tickets', component: ListingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
