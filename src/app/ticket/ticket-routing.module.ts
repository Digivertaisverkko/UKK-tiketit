import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { ListingComponent } from './listing/listing.component';

import { EsimerkkiListingComponent } from './listing/esimerkki-listing.component';

const routes: Routes = [
  { path: 'ticket-view/:id', component: TicketViewComponent },
  { path: 'submit', component: SubmitTicketComponent},
  { path: 'list-tickets', component: ListingComponent },
  { path: 'list-tickets-esim', component: EsimerkkiListingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
