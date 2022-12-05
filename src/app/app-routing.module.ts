import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListingComponent } from './ticket/listing/listing.component';
import { TestingHenriComponent } from './user-management/testing-henri/testing-henri.component';
import { authGuard } from './user-management/auth.guard';

const routes: Routes = [
  { path: '**', component: ListingComponent, canActivate: [authGuard] }
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
