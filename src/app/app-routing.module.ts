import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './user-management/auth.guard';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';
import { ListingComponent } from './ticket/listing/listing.component';

// FIXME: viimeisimmän kurssin muistaminen, jos on tallennettuna local storageen?
const routes: Routes = [
  { path: '', redirectTo: '/list-tickets?courseID=1', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
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
