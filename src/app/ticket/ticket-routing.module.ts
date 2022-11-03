import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TicketViewComponent } from './ticket-view/ticket-view.component';

const routes: Routes = [
  { path: 'ticket-view', component: TicketViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
