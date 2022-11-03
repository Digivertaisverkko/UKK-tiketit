import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';

const routes: Routes = [
  { path: 'ticket-view', component: TicketViewComponent },
  { path: 'submit', component: SubmitTicketComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
