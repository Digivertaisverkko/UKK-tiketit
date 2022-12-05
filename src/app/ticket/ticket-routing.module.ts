import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { ListingComponent } from './listing/listing.component';
import { FaqViewComponent } from './faq-view/faq-view.component';
import { authGuard } from '../user-management/auth.guard';

const routes: Routes = [
  { path: 'ticket-view/:id', component: TicketViewComponent, canActivate: [authGuard] },
  { path: 'faq-view/:id', component: FaqViewComponent, canActivate: [authGuard] },
  { path: 'submit', component: SubmitTicketComponent, canActivate: [authGuard] },
  { path: 'list-tickets', component: ListingComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
