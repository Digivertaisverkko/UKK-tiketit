import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../user-management/auth.guard';

import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { SubmitTicketComponent } from './submit-ticket/submit-ticket.component';
import { SubmitFaqComponent } from './submit-faq/submit-faq.component';
import { FaqViewComponent } from './faq-view/faq-view.component';
import { ListingComponent } from './listing/listing.component';

const routes: Routes = [
  { path: 'course/:courseid/ticket-view/:id',
      component: TicketViewComponent },
      // canActivate: [authGuard] },

  { path: 'course/:courseid/submit',
      component: SubmitTicketComponent },

  { path: 'course/:courseid/submit/:id',
      component: SubmitTicketComponent },

  { path: 'course/:courseid/submit-faq',
      component: SubmitFaqComponent },

  { path: 'course/:courseid/submit-faq/:id',
      component: SubmitFaqComponent },

  { path: 'course/:courseid/faq-view/:id',
      component: FaqViewComponent },

  { path: 'course/:courseid/list-tickets',
      component: ListingComponent },
];
//   { path: 'list-tickets', component: ListingComponent }

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
