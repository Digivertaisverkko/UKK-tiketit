import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListingComponent } from './ticket/listing/listing.component';
import { TestingHenriComponent } from './user-management/testing-henri/testing-henri.component';

const routes: Routes = [
<<<<<<< HEAD
=======
  { path: 'ListingComponent', component: ListingComponent },
  { path: 'test', component: TestingHenriComponent }
>>>>>>> 8dc345cac5237609bbabbf83124ee252e2e6c998
];

// redirect esimerkkki:  { path: '', redirectTo: 'login', pathMatch: 'full' }
// lazy-loading esimerkki:
// { path: 'front', loadChildren: () => import('./front/front.module').then(m => m.FrontModule) }
// { path: 'users', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
